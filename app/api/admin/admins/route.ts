import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { randomUUID } from "crypto"

// GET - listar todos os admins com suas barbearias
export async function GET() {
  try {
    const admins = await db.user.findMany({
      where: { role: { in: ["ADMIN", "SUPERADMIN"] } },
      include: {
        managedShop: {
          include: { barbershop: { select: { id: true, name: true, imageUrl: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    })
    return NextResponse.json(admins)
  } catch {
    return NextResponse.json({ error: "Erro ao buscar admins" }, { status: 500 })
  }
}

// POST - criar novo admin e associar a uma barbearia
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, barbershopId, role } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nome, email e senha são obrigatórios" }, { status: 400 })
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "Este email já está cadastrado" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const userRole = role === "SUPERADMIN" ? "SUPERADMIN" : "ADMIN"

    // Verificar se já existe admin para essa barbearia
    if (barbershopId && userRole === "ADMIN") {
      const existingAdmin = await db.barbershopAdmin.findUnique({ where: { barbershopId } })
      if (existingAdmin) {
        return NextResponse.json({ error: "Esta barbearia já possui um admin associado" }, { status: 409 })
      }
    }

    const user = await db.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: userRole,
        ...(barbershopId && userRole === "ADMIN" && {
          managedShop: {
            create: {
              id: randomUUID(),
              barbershopId,
            },
          },
        }),
      },
      include: {
        managedShop: {
          include: { barbershop: { select: { id: true, name: true } } },
        },
      },
    })

    return NextResponse.json({ ...user, password: undefined }, { status: 201 })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao criar admin" }, { status: 500 })
  }
}
