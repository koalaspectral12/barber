import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT - Atualizar serviço
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { name, description, price, imageUrl, barbershopId } = body

    const service = await db.barbershopService.update({
      where: { id: params.id },
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
    return NextResponse.json(service)
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao atualizar serviço" },
      { status: 500 },
    )
  }
}

// DELETE - Deletar serviço
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    await db.barbershopService.delete({
      where: { id: params.id },
    })
    return NextResponse.json({ message: "Serviço deletado com sucesso" })
  } catch (error) {
    return NextResponse.json(
      { error: "Erro ao deletar serviço" },
      { status: 500 },
    )
  }
}
