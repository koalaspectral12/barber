import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { db } from "./prisma"

export interface AdminContext {
  userId: string
  role: "ADMIN" | "SUPERADMIN"
  barbershopId: string | null
}

export async function getAdminContext(): Promise<AdminContext | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user?.email) return null

  const user = await db.user.findUnique({
    where: { email: session.user.email },
    include: { managedShop: true },
  })

  if (!user || !["ADMIN", "SUPERADMIN"].includes(user.role)) return null

  return {
    userId: user.id,
    role: user.role as "ADMIN" | "SUPERADMIN",
    barbershopId: user.managedShop?.barbershopId || null,
  }
}
