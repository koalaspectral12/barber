import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const ctx = await getAdminContext()
    if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    if (ctx.role === "ADMIN") {
      const booking = await db.booking.findUnique({
        where: { id: params.id },
        include: { service: true },
      })
      if (booking?.service?.barbershopId !== ctx.barbershopId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
      }
    }

    await db.booking.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Agendamento cancelado com sucesso" })
  } catch {
    return NextResponse.json({ error: "Erro ao cancelar agendamento" }, { status: 500 })
  }
}
