export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

// GET /api/admin/hours?barbershopId=xxx
export async function GET(req: NextRequest) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { searchParams } = new URL(req.url)
    const barbershopId = searchParams.get("barbershopId") || ctx.barbershopId

    if (!barbershopId) {
      return NextResponse.json(
        { error: "barbershopId obrigatório" },
        { status: 400 },
      )
    }

    // Admins can only access their own barbershop
    if (ctx.role !== "SUPERADMIN" && barbershopId !== ctx.barbershopId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    const hours = await db.barbershopHours.findMany({
      where: { barbershopId },
      orderBy: { dayOfWeek: "asc" },
    })

    return NextResponse.json(hours)
  } catch (err) {
    console.error("[GET /api/admin/hours]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}

// PUT /api/admin/hours — upsert all days at once
export async function PUT(req: NextRequest) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const { barbershopId, hours } = await req.json()

    const targetId = barbershopId || ctx.barbershopId
    if (!targetId) {
      return NextResponse.json(
        { error: "barbershopId obrigatório" },
        { status: 400 },
      )
    }

    if (ctx.role !== "SUPERADMIN" && targetId !== ctx.barbershopId) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    // hours is an array of { dayOfWeek, openTime, closeTime, slotMinutes, enabled }
    // If enabled=false, delete the record; otherwise upsert
    const results = []
    for (const h of hours) {
      if (!h.enabled) {
        await db.barbershopHours.deleteMany({
          where: { barbershopId: targetId, dayOfWeek: h.dayOfWeek },
        })
      } else {
        const result = await db.barbershopHours.upsert({
          where: {
            barbershopId_dayOfWeek: {
              barbershopId: targetId,
              dayOfWeek: h.dayOfWeek,
            },
          },
          update: {
            openTime: h.openTime,
            closeTime: h.closeTime,
            slotMinutes: h.slotMinutes || 30,
          },
          create: {
            barbershopId: targetId,
            dayOfWeek: h.dayOfWeek,
            openTime: h.openTime,
            closeTime: h.closeTime,
            slotMinutes: h.slotMinutes || 30,
          },
        })
        results.push(result)
      }
    }

    return NextResponse.json({ success: true, updated: results.length })
  } catch (err) {
    console.error("[PUT /api/admin/hours]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
