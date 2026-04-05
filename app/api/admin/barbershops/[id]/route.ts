export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"

function parsePhonesField(phones: string): string[] {
  try {
    return JSON.parse(phones)
  } catch {
    return []
  }
}
function serializePhonesField(phones: string[] | string): string {
  if (Array.isArray(phones)) return JSON.stringify(phones)
  return phones
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    if (ctx.role === "ADMIN" && ctx.barbershopId !== params.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const b = await db.barbershop.findUnique({
      where: { id: params.id },
      include: { services: true },
    })
    if (!b)
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 },
      )
    return NextResponse.json({ ...b, phones: parsePhonesField(b.phones) })
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar barbearia" },
      { status: 500 },
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    if (ctx.role === "ADMIN" && ctx.barbershopId !== params.id) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const body = await request.json()
    const { name, address, phones, description, imageUrl } = body

    const b = await db.barbershop.update({
      where: { id: params.id },
      data: {
        name,
        address,
        phones: serializePhonesField(phones || []),
        description,
        imageUrl,
      },
    })
    return NextResponse.json({ ...b, phones: parsePhonesField(b.phones) })
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar barbearia" },
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
    if (!ctx || ctx.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Apenas o Superadmin pode excluir barbearias" },
        { status: 403 },
      )
    }

    await db.barbershopService.deleteMany({
      where: { barbershopId: params.id },
    })
    await db.barbershopAdmin.deleteMany({ where: { barbershopId: params.id } })
    await db.barber.deleteMany({ where: { barbershopId: params.id } })
    await db.paymentConfig.deleteMany({ where: { barbershopId: params.id } })
    await db.barbershop.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Barbearia deletada com sucesso" })
  } catch {
    return NextResponse.json(
      { error: "Erro ao deletar barbearia" },
      { status: 500 },
    )
  }
}
