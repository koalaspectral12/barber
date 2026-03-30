import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// PUT — atualizar barbeiro
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { name, barbershopId, specialty, bio, avatarUrl } = body

    // Atualiza perfil de barbeiro
    const barber = await db.barber.update({
      where: { id: params.id },
      data: {
        barbershopId,
        specialty: specialty || null,
        bio: bio || null,
        avatarUrl: avatarUrl || null,
        user: {
          update: { name },
        },
      },
      include: {
        user: { select: { id: true, name: true, email: true, image: true } },
        barbershop: { select: { id: true, name: true } },
      },
    })

    return NextResponse.json(barber)
  } catch {
    return NextResponse.json(
      { error: "Erro ao atualizar barbeiro" },
      { status: 500 },
    )
  }
}

// DELETE — remover barbeiro (e seu usuário)
export async function DELETE(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    // Busca o userId antes de deletar
    const barber = await db.barber.findUnique({
      where: { id: params.id },
      select: { userId: true },
    })
    if (!barber) {
      return NextResponse.json(
        { error: "Barbeiro não encontrado" },
        { status: 404 },
      )
    }

    // Cascade: deletar perfil e usuário
    await db.barber.delete({ where: { id: params.id } })
    await db.user.delete({ where: { id: barber.userId } })

    return NextResponse.json({ message: "Barbeiro removido com sucesso" })
  } catch {
    return NextResponse.json(
      { error: "Erro ao remover barbeiro" },
      { status: 500 },
    )
  }
}
