import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

// GET - Estatísticas do dashboard
export async function GET() {
  try {
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
      db.barbershop.count(),
      db.barbershopService.count(),
      db.booking.count(),
      db.user.count({ where: { role: "CUSTOMER" } }),
      db.user.count({ where: { role: "BARBER" } }),
      db.user.count({ where: { role: "ADMIN" } }),
      db.booking.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, image: true } },
          service: {
            include: {
              barbershop: { select: { name: true } },
            },
          },
        },
      }),
      db.booking.count({
        where: { date: { gte: new Date() } },
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
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar estatísticas" },
      { status: 500 },
    )
  }
}
