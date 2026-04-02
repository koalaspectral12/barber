import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"

// PUT - atualizar admin
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const body = await request.json()
    const { name, password, barbershopId } = body

    const updateData: Record<string, unknown> = {}
    if (name) updateData.name = name
    if (password) updateData.password = await bcrypt.hash(password, 10)

    const user = await db.user.update({
      where: { id: params.id },
      data: updateData,
    })

    // Atualizar barbearia associada
    if (barbershopId && user.role === "ADMIN") {
      const existing = await db.barbershopAdmin.findUnique({ where: { userId: params.id } })
      if (existing) {
        await db.barbershopAdmin.update({
          where: { userId: params.id },
          data: { barbershopId },
        })
      } else {
        // Verificar se a barbearia já tem admin
        const shopAdmin = await db.barbershopAdmin.findUnique({ where: { barbershopId } })
        if (!shopAdmin) {
          await db.barbershopAdmin.create({
            data: {
              id: require("crypto").randomUUID(),
              userId: params.id,
              barbershopId,
            },
          })
        }
      }
    } else if (barbershopId === "" && user.role === "ADMIN") {
      // Remover associação
      await db.barbershopAdmin.deleteMany({ where: { userId: params.id } })
    }

    return NextResponse.json({ ...user, password: undefined })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao atualizar admin" }, { status: 500 })
  }
}

// DELETE - remover admin
export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const user = await db.user.findUnique({ where: { id: params.id } })
    if (!user) return NextResponse.json({ error: "Admin não encontrado" }, { status: 404 })
    if (user.role === "SUPERADMIN") return NextResponse.json({ error: "Não é possível remover o Superadmin" }, { status: 403 })

    await db.barbershopAdmin.deleteMany({ where: { userId: params.id } })
    await db.user.delete({ where: { id: params.id } })

    return NextResponse.json({ message: "Admin removido com sucesso" })
  } catch {
    return NextResponse.json({ error: "Erro ao remover admin" }, { status: 500 })
  }
}
