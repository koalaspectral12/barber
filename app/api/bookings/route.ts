import { db } from "@/app/_lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "../auth/[...nextauth]/route"

// GET /api/bookings — list bookings for logged-in user
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    const bookings = await db.booking.findMany({
      where: { userId: user.id },
      include: {
        service: {
          include: { barbershop: true },
        },
      },
      orderBy: { date: "desc" },
    })

    return NextResponse.json(bookings)
  } catch (err) {
    console.error("[GET /api/bookings]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// POST /api/bookings — create a booking
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
    })
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    const { serviceId, date, paymentMethod = "local" } = await req.json()
    if (!serviceId || !date) {
      return NextResponse.json(
        { error: "serviceId e date são obrigatórios" },
        { status: 400 },
      )
    }

    const bookingDate = new Date(date)

    // Check if the slot is already booked
    const conflict = await db.booking.findFirst({
      where: { serviceId, date: bookingDate },
    })
    if (conflict) {
      return NextResponse.json(
        { error: "Horário já reservado" },
        { status: 409 },
      )
    }

    const booking = await db.booking.create({
      data: {
        userId: user.id,
        serviceId,
        date: bookingDate,
        paymentMethod:
          paymentMethod === "mercadopago" ? "mercadopago" : "local",
        paymentStatus: paymentMethod === "mercadopago" ? "pending" : "pending",
      },
      include: {
        service: {
          include: { barbershop: true },
        },
      },
    })

    return NextResponse.json(booking, { status: 201 })
  } catch (err) {
    console.error("[POST /api/bookings]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
