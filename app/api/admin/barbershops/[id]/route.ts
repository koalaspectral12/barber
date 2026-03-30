import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// Helpers para serializar/desserializar phones
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

// GET - Buscar barbearia por ID
export async function GET(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const barbershop = await db.barbershop.findUnique({
      where: { id: params.id },
      include: { services: true },
    })
    if (!barbershop) {
      return NextResponse.json(
        { error: "Barbearia não encontrada" },
        { status: 404 },
      )
    }
    return NextResponse.json({
      ...barbershop,
      phones: parsePhonesField(barbershop.phones),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao buscar barbearia" },
      { status: 500 },
    )
  }
}

// PUT - Atualizar barbearia
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { name, address, phones, description, imageUrl } = body

    const barbershop = await db.barbershop.update({
      where: { id: params.id },
      data: {
        name,
        address,
        phones: serializePhonesField(phones || []),
        description,
        imageUrl,
      },
    })
    return NextResponse.json({
      ...barbershop,
      phones: parsePhonesField(barbershop.phones),
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar barbearia" },
      { status: 500 },
    )
  }
}

// DELETE - Deletar barbearia
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Primeiro deleta todos os serviços relacionados
    await db.barbershopService.deleteMany({
      where: { barbershopId: params.id },
    })

    await db.barbershop.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Barbearia deletada com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar barbearia" },
      { status: 500 },
    )
  }
}
