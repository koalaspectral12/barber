export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET /api/barbershops/[id]/hours
export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const hours = await db.barbershopHours.findMany({
      where: { barbershopId: params.id },
      orderBy: { dayOfWeek: "asc" },
    })
    return NextResponse.json(hours)
  } catch (err) {
    console.error("[GET /api/barbershops/id/hours]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// GET available time slots for a specific date
// GET /api/barbershops/[id]/hours?date=2024-01-15
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const { date } = await req.json()
    if (!date) {
      return NextResponse.json({ error: "date obrigatório" }, { status: 400 })
    }

    const dateObj = new Date(date)
    const dayOfWeek = dateObj.getDay() // 0=Sun, 6=Sat

    // Get working hours for this day
    const hours = await db.barbershopHours.findUnique({
      where: {
        barbershopId_dayOfWeek: {
          barbershopId: params.id,
          dayOfWeek,
        },
      },
    })

    if (!hours) {
      return NextResponse.json({ slots: [], closed: true })
    }

    // Generate time slots
    const slots: string[] = []
    const [openH, openM] = hours.openTime.split(":").map(Number)
    const [closeH, closeM] = hours.closeTime.split(":").map(Number)
    const openMinutes = openH * 60 + openM
    const closeMinutes = closeH * 60 + closeM

    for (let m = openMinutes; m < closeMinutes; m += hours.slotMinutes) {
      const h = Math.floor(m / 60)
        .toString()
        .padStart(2, "0")
      const min = (m % 60).toString().padStart(2, "0")
      slots.push(`${h}:${min}`)
    }

    // Get already booked slots for this barbershop on this date
    const dayStart = new Date(dateObj)
    dayStart.setHours(0, 0, 0, 0)
    const dayEnd = new Date(dateObj)
    dayEnd.setHours(23, 59, 59, 999)

    const bookedSlots = await db.booking.findMany({
      where: {
        service: { barbershopId: params.id },
        date: { gte: dayStart, lte: dayEnd },
      },
      select: { date: true },
    })

    const bookedTimes = new Set(
      bookedSlots.map((b) => {
        const d = new Date(b.date)
        return `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`
      }),
    )

    const availableSlots = slots.map((slot) => ({
      time: slot,
      available: !bookedTimes.has(slot),
    }))

    return NextResponse.json({
      slots: availableSlots,
      closed: false,
      openTime: hours.openTime,
      closeTime: hours.closeTime,
    })
  } catch (err) {
    console.error("[POST /api/barbershops/id/hours]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
