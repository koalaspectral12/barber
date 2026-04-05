import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextResponse } from "next/server"

// GET - Listar todos os usuários (superadmin only)
export async function GET() {
  try {
    const ctx = await getAdminContext()
    if (!ctx) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }
    if (ctx.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Acesso restrito ao superadmin" },
        { status: 403 },
      )
    }

    const users = await db.user.findMany({
      include: {
        _count: { select: { bookings: true } },
        managedShop: {
          include: {
            barbershop: { select: { id: true, name: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    // Check admin expiry status
    const now = new Date()
    const result = users.map((u) => ({
      ...u,
      adminExpired:
        u.managedShop?.expiresAt != null &&
        new Date(u.managedShop.expiresAt) < now,
      adminActive: u.managedShop?.active ?? null,
    }))

    return NextResponse.json(result)
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar usuários" },
      { status: 500 },
    )
  }
}
