export const dynamic = "force-dynamic"

import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

export async function GET() {
  try {
    let settings = await db.appSettings.findUnique({
      where: { id: "singleton" },
    })
    if (!settings) {
      settings = await db.appSettings.create({
        data: { id: "singleton", appName: "Barberon", banners: "[]" },
      })
    }
    return NextResponse.json({
      ...settings,
      banners: (() => {
        try {
          return JSON.parse(settings!.banners)
        } catch {
          return []
        }
      })(),
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao buscar configurações" },
      { status: 500 },
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { appName, logoUrl, banners } = body

    const settings = await db.appSettings.upsert({
      where: { id: "singleton" },
      create: {
        id: "singleton",
        appName: appName || "Barberon",
        logoUrl: logoUrl || null,
        banners: JSON.stringify(Array.isArray(banners) ? banners : []),
      },
      update: {
        ...(appName !== undefined && { appName }),
        ...(logoUrl !== undefined && { logoUrl }),
        ...(banners !== undefined && {
          banners: JSON.stringify(Array.isArray(banners) ? banners : []),
        }),
      },
    })

    return NextResponse.json({
      ...settings,
      banners: (() => {
        try {
          return JSON.parse(settings.banners)
        } catch {
          return []
        }
      })(),
    })
  } catch {
    return NextResponse.json(
      { error: "Erro ao salvar configurações" },
      { status: 500 },
    )
  }
}
