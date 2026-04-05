export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getAdminContext } from "@/app/_lib/admin-auth"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const ctx = await getAdminContext()
    if (!ctx)
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })

    const isSuperAdmin = ctx.role === "SUPERADMIN"
    const shopId = ctx.barbershopId

    const [
      totalBarbershops,
      totalServices,
      totalBookings,
      totalUsers,
      totalBarbers,
      totalAdmins,
      recentBookings,
      upcomingBookings,
    ] = await Promise.all([
      isSuperAdmin
        ? db.barbershop.count()
        : db.barbershop.count({ where: { id: shopId! } }),
      isSuperAdmin
        ? db.barbershopService.count()
        : db.barbershopService.count({ where: { barbershopId: shopId! } }),
      isSuperAdmin
        ? db.booking.count()
        : db.booking.count({ where: { service: { barbershopId: shopId! } } }),
      db.user.count({ where: { role: "CUSTOMER" } }),
      isSuperAdmin
        ? db.user.count({ where: { role: "BARBER" } })
        : db.barber.count({ where: { barbershopId: shopId! } }),
      isSuperAdmin ? db.user.count({ where: { role: "ADMIN" } }) : 0,
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        where: isSuperAdmin ? {} : { service: { barbershopId: shopId! } },
        include: {
          user: { select: { name: true, email: true, image: true } },
          service: {
            include: { barbershop: { select: { name: true } } },
          },
        },
      }),
      db.booking.count({
        where: {
          date: { gte: new Date() },
          ...(isSuperAdmin ? {} : { service: { barbershopId: shopId! } }),
        },
      }),
    ])

    return NextResponse.json({
      totalBarbershops,
      totalServices,
      totalBookings,
      totalUsers,
      totalBarbers,
      totalAdmins,
      upcomingBookings,
      recentBookings,
      isSuperAdmin,
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 },
    )
  }
}
