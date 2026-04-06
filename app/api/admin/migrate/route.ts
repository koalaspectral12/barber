export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

// Each statement is idempotent (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)
const MIGRATIONS = [
  `ALTER TABLE \`Barbershop\` ADD COLUMN IF NOT EXISTS \`active\` BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE \`BarbershopAdmin\` ADD COLUMN IF NOT EXISTS \`expiresAt\` DATETIME(3) NULL`,
  `ALTER TABLE \`BarbershopAdmin\` ADD COLUMN IF NOT EXISTS \`active\` BOOLEAN NOT NULL DEFAULT TRUE`,
  `ALTER TABLE \`Booking\` ADD COLUMN IF NOT EXISTS \`paymentMethod\` VARCHAR(191) NOT NULL DEFAULT 'local'`,
  `ALTER TABLE \`Booking\` ADD COLUMN IF NOT EXISTS \`paymentStatus\` VARCHAR(191) NOT NULL DEFAULT 'pending'`,
  `ALTER TABLE \`Booking\` ADD COLUMN IF NOT EXISTS \`mpPaymentId\` VARCHAR(191) NULL`,
  `ALTER TABLE \`AppSettings\` ADD COLUMN IF NOT EXISTS \`logoUrl\` TEXT NULL`,
  `CREATE TABLE IF NOT EXISTS \`PaymentConfig\` (
    \`id\`              VARCHAR(191) NOT NULL,
    \`barbershopId\`    VARCHAR(191) NOT NULL,
    \`mpAccessToken\`   TEXT         NULL,
    \`mpPublicKey\`     TEXT         NULL,
    \`mpWebhookSecret\` TEXT         NULL,
    \`active\`          BOOLEAN      NOT NULL DEFAULT FALSE,
    \`createdAt\`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    \`updatedAt\`       DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX \`PaymentConfig_barbershopId_key\`(\`barbershopId\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  `CREATE TABLE IF NOT EXISTS \`BarbershopHours\` (
    \`id\`           VARCHAR(191) NOT NULL,
    \`barbershopId\` VARCHAR(191) NOT NULL,
    \`dayOfWeek\`    INTEGER      NOT NULL,
    \`openTime\`     VARCHAR(191) NOT NULL,
    \`closeTime\`    VARCHAR(191) NOT NULL,
    \`slotMinutes\`  INTEGER      NOT NULL DEFAULT 30,
    UNIQUE INDEX \`BarbershopHours_barbershopId_dayOfWeek_key\`(\`barbershopId\`, \`dayOfWeek\`),
    PRIMARY KEY (\`id\`)
  ) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`,
  // Add FK only if table was just created (ignore duplicate key errors)
  `ALTER TABLE \`PaymentConfig\` ADD CONSTRAINT \`PaymentConfig_barbershopId_fkey\`
    FOREIGN KEY (\`barbershopId\`) REFERENCES \`Barbershop\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
  `ALTER TABLE \`BarbershopHours\` ADD CONSTRAINT \`BarbershopHours_barbershopId_fkey\`
    FOREIGN KEY (\`barbershopId\`) REFERENCES \`Barbershop\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE`,
]

export async function POST() {
  try {
    const session = await getServerSession(authOptions)
    if (
      !session?.user ||
      !["ADMIN", "SUPERADMIN"].includes(
        (session.user as { role?: string }).role || "",
      )
    ) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 })
    }

    const results: { sql: string; status: string; error?: string }[] = []

    for (const sql of MIGRATIONS) {
      try {
        await db.$executeRawUnsafe(sql)
        results.push({ sql: sql.slice(0, 60) + "...", status: "ok" })
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err)
        // Ignore "already exists" / "duplicate key" / "duplicate column" errors
        if (
          msg.includes("Duplicate key") ||
          msg.includes("already exists") ||
          msg.includes("Duplicate column") ||
          msg.includes("errno: 1060") ||
          msg.includes("errno: 1061") ||
          msg.includes("errno: 1050")
        ) {
          results.push({
            sql: sql.slice(0, 60) + "...",
            status: "skipped (already applied)",
          })
        } else {
          results.push({
            sql: sql.slice(0, 60) + "...",
            status: "error",
            error: msg,
          })
        }
      }
    }

    return NextResponse.json({ success: true, results })
  } catch (err) {
    console.error("[POST /api/admin/migrate]", err)
    return NextResponse.json({ error: "Erro interno" }, { status: 500 })
  }
}
