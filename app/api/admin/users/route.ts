import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

// GET - Listar todos os usuários
export async function GET() {
  try {
    const users = await db.user.findMany({
      include: {
        _count: {
          select: { bookings: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(users)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 },
    )
  }
}
