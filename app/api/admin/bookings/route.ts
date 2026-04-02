import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const ctx = await getAdminContext()
    if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const where = ctx.role === "ADMIN" && ctx.barbershopId
      ? { service: { barbershopId: ctx.barbershopId } }
      : {}

    const bookings = await db.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        service: {
          include: { barbershop: { select: { id: true, name: true } } },
        },
      },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(bookings)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar agendamentos" }, { status: 500 })
  }
}
