import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// DELETE - Cancelar/deletar agendamento
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await db.booking.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Agendamento cancelado com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao cancelar agendamento" },
      { status: 500 },
    )
  }
}
