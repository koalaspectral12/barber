import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

export async function GET() {
  try {
    const ctx = await getAdminContext()
    if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const where = ctx.role === "ADMIN" && ctx.barbershopId
      ? { barbershopId: ctx.barbershopId }
      : {}

    const services = await db.barbershopService.findMany({
      where,
      include: { barbershop: { select: { id: true, name: true } } },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(services)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar serviços" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const ctx = await getAdminContext()
    if (!ctx) return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const body = await request.json()
    const { name, description, price, imageUrl, barbershopId } = body

    if (!name || !description || !price || !imageUrl || !barbershopId) {
      return NextResponse.json({ error: "Campos obrigatórios faltando" }, { status: 400 })
    }

    // ADMIN só pode criar serviço na sua barbearia
    if (ctx.role === "ADMIN" && ctx.barbershopId !== barbershopId) {
      return NextResponse.json({ error: "Acesso negado" }, { status: 403 })
    }

    const service = await db.barbershopService.create({
      data: {
        id: randomUUID(),
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        barbershopId,
      },
      include: { barbershop: { select: { id: true, name: true } } },
    })

    return NextResponse.json(service, { status: 201 })
  } catch {
    return NextResponse.json({ error: "Erro ao criar serviço" }, { status: 500 })
  }
}
