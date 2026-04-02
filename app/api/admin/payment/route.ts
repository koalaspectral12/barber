import { db } from "@/app/_lib/prisma"
import { NextRequest, NextResponse } from "next/server"

// GET - buscar config de pagamento para uma barbearia
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const barbershopId = searchParams.get("barbershopId")

    if (!barbershopId) {
      return NextResponse.json({ error: "barbershopId é obrigatório" }, { status: 400 })
    }

    const config = await db.paymentConfig.findUnique({ where: { barbershopId } })
    if (!config) {
      return NextResponse.json({ barbershopId, mpAccessToken: "", mpPublicKey: "", mpWebhookSecret: "", active: false })
    }

    // Mascarar token para exibição segura
    return NextResponse.json({
      ...config,
      mpAccessToken: config.mpAccessToken ? maskSecret(config.mpAccessToken) : "",
      mpPublicKey: config.mpPublicKey || "",
      mpWebhookSecret: config.mpWebhookSecret ? maskSecret(config.mpWebhookSecret) : "",
    })
  } catch {
    return NextResponse.json({ error: "Erro ao buscar configuração de pagamento" }, { status: 500 })
  }
}

// PUT - salvar/atualizar config de pagamento
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { barbershopId, mpAccessToken, mpPublicKey, mpWebhookSecret, active } = body

    if (!barbershopId) {
      return NextResponse.json({ error: "barbershopId é obrigatório" }, { status: 400 })
    }

    // Se o valor não mudou (está mascarado), busca o valor atual
    const existing = await db.paymentConfig.findUnique({ where: { barbershopId } })

    const data: Record<string, unknown> = { active: !!active, barbershopId }

    if (mpAccessToken && !mpAccessToken.includes("•")) data.mpAccessToken = mpAccessToken
    else if (existing?.mpAccessToken) data.mpAccessToken = existing.mpAccessToken

    if (mpPublicKey) data.mpPublicKey = mpPublicKey
    else if (existing?.mpPublicKey) data.mpPublicKey = existing.mpPublicKey

    if (mpWebhookSecret && !mpWebhookSecret.includes("•")) data.mpWebhookSecret = mpWebhookSecret
    else if (existing?.mpWebhookSecret) data.mpWebhookSecret = existing.mpWebhookSecret

    const config = await db.paymentConfig.upsert({
      where: { barbershopId },
      create: { ...data, id: require("crypto").randomUUID() } as Parameters<typeof db.paymentConfig.create>[0]["data"],
      update: data as Parameters<typeof db.paymentConfig.update>[0]["data"],
    })

    return NextResponse.json({ ...config, mpAccessToken: config.mpAccessToken ? maskSecret(config.mpAccessToken) : "", mpWebhookSecret: config.mpWebhookSecret ? maskSecret(config.mpWebhookSecret) : "" })
  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: "Erro ao salvar configuração de pagamento" }, { status: 500 })
  }
}

function maskSecret(value: string): string {
  if (value.length <= 8) return "••••••••"
  return value.substring(0, 4) + "•".repeat(Math.min(20, value.length - 8)) + value.substring(value.length - 4)
}
