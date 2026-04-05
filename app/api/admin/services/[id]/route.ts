export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await request.json()
    const { name, description, price, imageUrl, barbershopId } = body

    // ADMIN só pode editar serviços da sua barbearia
    if (ctx.role === "ADMIN" && ctx.barbershopId !== barbershopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const service = await db.barbershopService.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        barbershopId,
      },
      include: { barbershop: { select: { id: true, name: true } } },
    })
    return NextResponse.json(service)
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 },
    )
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    // Verificar se o serviço pertence à barbearia do admin
    if (ctx.role === "ADMIN") {
      const svc = await db.barbershopService.findUnique({
        where: { id: params.id },
      })
      if (svc?.barbershopId !== ctx.barbershopId) {
        return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
      }
    }

    await db.barbershopService.delete({ where: { id: params.id } })
    return NextResponse.json({ message: "Serviço deletado com sucesso" })
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar serviço" },
      { status: 500 },
    )
  }
}
