import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET - Listar todos os serviços
export async function GET() {
  try {
    const services = await db.barbershopService.findMany({
      include: {
        barbershop: { select: { id: true, name: true } },
      },
      orderBy: { name: "asc" },
    })
    return NextResponse.json(services)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar serviços" },
      { status: 500 },
    )
  }
}

// POST - Criar novo serviço
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, imageUrl, barbershopId } = body

    if (!name || !description || !price || !imageUrl || !barbershopId) {
      return NextResponse.json(
        { error: "Campos obrigatórios faltando" },
        { status: 400 },
      )
    }

    const service = await db.barbershopService.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        imageUrl,
        barbershopId,
      },
      include: {
        barbershop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(service, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar serviço" },
      { status: 500 },
    )
  }
}
