import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Helpers para serializar/desserializar phones (MySQL não suporta arrays)
function parsePhonesField(phones: string): string[] {
  try {
    return JSON.parse(phones)
  } catch {
    return []
  }
}

function serializePhonesField(phones: string[] | string): string {
  if (Array.isArray(phones)) return JSON.stringify(phones)
  return phones // já é string JSON
}

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
    // Desserializar phones para array antes de enviar ao frontend
    const result = barbershops.map((b) => ({
      ...b,
      phones: parsePhonesField(b.phones),
    }))
    return NextResponse.json(result)
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
        phones: serializePhonesField(phones || []),
        description,
        imageUrl,
      },
    })

    return NextResponse.json(
      { ...barbershop, phones: parsePhonesField(barbershop.phones) },
      { status: 201 },
    )
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao criar barbearia" },
      { status: 500 },
    )
  }
}
