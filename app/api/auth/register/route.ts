import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

// POST /api/auth/register — register a new customer
export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json()

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Nome, email e senha são obrigatórios" },
        { status: 400 },
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "A senha deve ter pelo menos 6 caracteres" },
        { status: 400 },
      )
    }

    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 },
      )
    }

    const bcrypt = await import("bcryptjs")
    const hashedPassword = await bcrypt.hash(password, 10)

    const user = await db.user.create({
      data: {
        id: randomUUID(),
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    })

    return NextResponse.json(
      { id: user.id, name: user.name, email: user.email },
      { status: 201 },
    )
  } catch (err) {
    console.error("[POST /api/auth/register]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
