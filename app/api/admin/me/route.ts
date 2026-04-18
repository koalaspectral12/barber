export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: {
        managedShop: {
          include: {
            barbershop: {
              select: { id: true, name: true, imageUrl: true },
            },
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    if (!["ADMIN", "SUPERADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Acesso negado" },
        { status: 403 },
      )
    }

    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      barbershop: user.managedShop?.barbershop ?? null,
      barbershopId: user.managedShop?.barbershopId ?? null,
    })
  } catch (err) {
    console.error("[GET /api/admin/me]", err)
    return NextResponse.json(
      { error: "Erro ao buscar dados do admin" },
      { status: 500 },
    )
  }
}
