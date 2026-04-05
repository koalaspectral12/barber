export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "crypto"

// POST /api/admin/users/promote
// Body: { userId, barbershopId, expiresAt (optional ISO string), action }
// action: "promote" | "demote" | "renew" | "deactivate" | "activate"
export async function POST(req: NextRequest) {
  try {
    const ctx = await getAdminContext()
    if (!ctx || ctx.role !== "SUPERADMIN") {
      return NextResponse.json(
        { error: "Apenas superadmin pode fazer isso" },
        { status: 403 },
      )
    }

    const { userId, barbershopId, expiresAt, action } = await req.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: "userId e action são obrigatórios" },
        { status: 400 },
      )
    }

    const user = await db.user.findUnique({
      where: { id: userId },
      include: { managedShop: true },
    })
    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 },
      )
    }

    if (action === "promote") {
      if (!barbershopId) {
        return NextResponse.json(
          { error: "barbershopId obrigatório para promover" },
          { status: 400 },
        )
      }

      // Check barbershop doesn't already have an admin
      const existing = await db.barbershopAdmin.findUnique({
        where: { barbershopId },
      })
      if (existing && existing.userId !== userId) {
        return NextResponse.json(
          { error: "Esta barbearia já tem um admin" },
          { status: 409 },
        )
      }

      // Remove old admin assignment if any
      if (user.managedShop) {
        await db.barbershopAdmin.delete({ where: { userId } })
      }

      // Promote user to ADMIN
      await db.user.update({ where: { id: userId }, data: { role: "ADMIN" } })

      // Assign barbershop
      const expiry = expiresAt ? new Date(expiresAt) : null
      await db.barbershopAdmin.upsert({
        where: { userId },
        create: {
          id: randomUUID(),
          userId,
          barbershopId,
          expiresAt: expiry,
          active: true,
        },
        update: {
          barbershopId,
          expiresAt: expiry,
          active: true,
        },
      })

      // Activate the barbershop
      await db.barbershop.update({
        where: { id: barbershopId },
        data: { active: true },
      })

      return NextResponse.json({
        success: true,
        message: "Usuário promovido a Admin",
      })
    }

    if (action === "demote") {
      // Remove admin assignment
      if (user.managedShop) {
        // Deactivate barbershop
        await db.barbershop.update({
          where: { id: user.managedShop.barbershopId },
          data: { active: false },
        })
        await db.barbershopAdmin.delete({ where: { userId } })
      }
      await db.user.update({
        where: { id: userId },
        data: { role: "CUSTOMER" },
      })
      return NextResponse.json({
        success: true,
        message: "Admin rebaixado para cliente",
      })
    }

    if (action === "renew") {
      if (!user.managedShop) {
        return NextResponse.json(
          { error: "Usuário não é admin" },
          { status: 400 },
        )
      }
      const expiry = expiresAt ? new Date(expiresAt) : null
      await db.barbershopAdmin.update({
        where: { userId },
        data: { expiresAt: expiry, active: true },
      })
      // Reactivate barbershop
      await db.barbershop.update({
        where: { id: user.managedShop.barbershopId },
        data: { active: true },
      })
      return NextResponse.json({ success: true, message: "Acesso renovado" })
    }

    if (action === "deactivate") {
      if (!user.managedShop) {
        return NextResponse.json(
          { error: "Usuário não é admin" },
          { status: 400 },
        )
      }
      await db.barbershopAdmin.update({
        where: { userId },
        data: { active: false },
      })
      await db.barbershop.update({
        where: { id: user.managedShop.barbershopId },
        data: { active: false },
      })
      return NextResponse.json({ success: true, message: "Admin desativado" })
    }

    if (action === "activate") {
      if (!user.managedShop) {
        return NextResponse.json(
          { error: "Usuário não é admin" },
          { status: 400 },
        )
      }
      await db.barbershopAdmin.update({
        where: { userId },
        data: { active: true },
      })
      await db.barbershop.update({
        where: { id: user.managedShop.barbershopId },
        data: { active: true },
      })
      return NextResponse.json({ success: true, message: "Admin reativado" })
    }

    return NextResponse.json({ error: "Action inválida" }, { status: 400 })
  } catch (err) {
    console.error("[POST /api/admin/users/promote]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
