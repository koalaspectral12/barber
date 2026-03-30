import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET - Listar todas as barbearias
export async function GET() {
  try {
    const barbershops = await db.barbershop.findMany({
      include: {
        services: true,
        _count: {
          select: { services: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(barbershops)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar barbearias" },
      { status: 500 },
    )
  }
}

// POST - Criar nova barbearia
export async function POST(request: NextRequest) {
  try {
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
        name,
        address,
        phones: phones || [],
        description,
        imageUrl,
      },
    })

    return NextResponse.json(barbershop, { status: 201 })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar barbearia" },
      { status: 500 },
    )
  }
}
