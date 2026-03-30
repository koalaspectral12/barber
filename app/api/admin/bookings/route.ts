import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

// GET - Listar todos os agendamentos
export async function GET() {
  try {
    const bookings = await db.booking.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        service: {
          include: {
            barbershop: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { date: "desc" },
    })
    return NextResponse.json(bookings)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar agendamentos" },
      { status: 500 },
    )
  }
}
