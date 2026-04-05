export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getServerSession } from "next-auth"
import { NextRequest, NextResponse } from "next/server"
import { authOptions } from "../../auth/[...nextauth]/route"

// DELETE /api/bookings/[id] — cancel a booking
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
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

    const booking = await db.booking.findUnique({ where: { id: params.id } })
    if (!booking) {
      return NextResponse.json(
        { error: "Agendamento não encontrado" },
        { status: 404 },
      )
    }

    if (booking.userId !== user.id) {
      return NextResponse.json({ error: "Sem permissão" }, { status: 403 })
    }

    await db.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Agendamento cancelado" })
  } catch (err) {
    console.error("[DELETE /api/bookings/id]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
