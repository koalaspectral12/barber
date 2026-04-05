export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET — listar todos os barbeiros com perfil e barbearia
export async function GET() {
  try {
    const barbers = await db.barber.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true,
            createdAt: true,
          },
        },
        barbershop: {
          select: { id: true, name: true, imageUrl: true },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(barbers)
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar barbeiros" },
      { status: 500 },
    )
  }
}

// POST — criar novo barbeiro (somente SUPERADMIN)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, barbershopId, specialty, bio, avatarUrl } = body

    if (!name || !email || !barbershopId) {
      return NextResponse.json(
        { error: "Nome, email e barbearia são obrigatórios" },
        { status: 400 },
      )
    }

    // Verificar se email já existe
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 },
      )
    }

    // Criar usuário com role BARBER e perfil de barbeiro
    const user = await db.user.create({
      data: {
        name,
        email,
        role: "BARBER",
        barberProfile: {
          create: {
            barbershopId,
            specialty: specialty || null,
            bio: bio || null,
            avatarUrl: avatarUrl || null,
          },
        },
      },
      include: {
        barberProfile: {
          include: {
            barbershop: { select: { id: true, name: true } },
          },
        },
      },
    })

    return NextResponse.json(user, { status: 201 })
  } catch {
    return NextResponse.json(
      { error: "Erro ao criar barbeiro" },
      { status: 500 },
    )
  }
}
