import { db } from "@/app/_lib/prisma"
import { NextResponse } from "next/server"

// GET /api/admin/cron — check and deactivate expired admins
// This can be called by Vercel cron or a simple scheduled task
// Protected by a secret token in production
export async function GET() {
  try {
    const now = new Date()

    // Find active admins whose expiresAt has passed
    const expiredAdmins = await db.barbershopAdmin.findMany({
      where: {
        active: true,
        expiresAt: { lte: now, not: null },
      },
      include: { user: true },
    })

    let deactivated = 0
    for (const admin of expiredAdmins) {
      // Deactivate admin record
      await db.barbershopAdmin.update({
        where: { id: admin.id },
        data: { active: false },
      })

      // Hide the barbershop
      await db.barbershop.update({
        where: { id: admin.barbershopId },
        data: { active: false },
      })

      deactivated++
      console.log(
        `[cron] Deactivated expired admin: ${admin.user.email} (barbershop: ${admin.barbershopId})`,
      )
    }

    return NextResponse.json({
      checked: expiredAdmins.length,
      deactivated,
      timestamp: now.toISOString(),
    })
  } catch (err) {
    console.error("[cron]", err)
    return NextResponse.json({ error: "Cron error" }, { status: 500 })
  }
}
