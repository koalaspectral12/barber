export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

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

export async function GET() {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const where =
      ctx.role === "ADMIN" && ctx.barbershopId ? { id: ctx.barbershopId } : {}

    const barbershops = await db.barbershop.findMany({
      where,
      include: {
        services: true,
        admin: {
          include: { user: { select: { id: true, name: true, email: true } } },
        },
        _count: { select: { services: true } },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(
      barbershops.map((b) => ({ ...b, phones: parsePhonesField(b.phones) })),
    )
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar barbearias" },
      { status: 500 },
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAdminContext()
    if (!ctx || ctx.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Apenas o Superadmin pode criar barbearias" },
        { status: 403 },
      )
    }

    const body = await request.json()
    const { name, address, phones, description, imageUrl } = body

    if (!name || !address || !description || !imageUrl) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      )
    }

    const barbershop = await db.barbershop.create({
      data: {
        id: randomUUID(),
        name,
        address,
        phones: serializePhonesField(phones || []),
        description,
        imageUrl,
      },
    })

    return NextResponse.json(
      { ...barbershop, phones: parsePhonesField(barbershop.phones) },
      { status: 201 },
    )
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar barbearia" },
      { status: 500 },
    )
  }
}
