"use client"

import { useEffect, useState } from "react"
import { CreditCardIcon, CheckIcon, Loader2Icon, EyeIcon, EyeOffIcon, ExternalLinkIcon } from "lucide-react"

interface PaymentConfig {
  barbershopId: string
  mpAccessToken: string
  mpPublicKey: string
  mpWebhookSecret: string
  active: boolean
}

interface Barbershop {
  id: string
  name: string
}

interface AdminMe {
  role: string
  barbershopId: string | null
  barbershop: { id: string; name: string } | null
}

export default function PaymentPage() {
  const [me, setMe] = useState<AdminMe | null>(null)
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [selectedShopId, setSelectedShopId] = useState("")
  const [config, setConfig] = useState<PaymentConfig>({
    barbershopId: "",
    mpAccessToken: "",
    mpPublicKey: "",
    mpWebhookSecret: "",
    active: false,
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [showSecret, setShowSecret] = useState(false)

  useEffect(() => {
    fetch("/api/admin/me")
      .then((r) => r.json())
      .then(async (data) => {
        setMe(data)
        if (data.role === "SUPERADMIN") {
          const bRes = await fetch("/api/admin/barbershops")
          const bData = await bRes.json()
          setBarbershops(Array.isArray(bData) ? bData : [])
          if (Array.isArray(bData) && bData.length > 0) {
            setSelectedShopId(bData[0].id)
          }
        } else if (data.barbershopId) {
          setSelectedShopId(data.barbershopId)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (!selectedShopId) return
    fetch(`/api/admin/payment?barbershopId=${selectedShopId}`)
      .then((r) => r.json())
      .then((data) => {
        setConfig({ ...data, barbershopId: selectedShopId })
      })
  }, [selectedShopId])

  const handleSave = async () => {
    if (!selectedShopId) {
      setError("Selecione uma barbearia")
      return
    }
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/payment", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...config, barbershopId: selectedShopId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setConfig(data)
      setSuccess("Configurações salvas com sucesso!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2Icon className="h-8 w-8 animate-spin text-yellow-400" />
      </div>
    )
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-gray-800 p-2">
          <CreditCardIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configuração de Pagamento</h1>
          <p className="text-sm text-gray-400">Integração com Mercado Pago por barbearia</p>
        </div>
      </div>

      {success && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckIcon className="h-4 w-4" />
          {success}
        </div>
      )}
      {error && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Superadmin: selecionar barbearia */}
      {me?.role === "SUPERADMIN" && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-5">
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Selecionar Barbearia
          </label>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
          >
            <option value="">Selecione...</option>
            {barbershops.map((b) => (
              <option key={b.id} value={b.id}>{b.name}</option>
            ))}
          </select>
        </div>
      )}

      {/* Config MP */}
      {selectedShopId && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Mercado Pago</h2>
            <div className="flex items-center gap-2">
              <label className="text-sm text-gray-400">Ativo</label>
              <button
                onClick={() => setConfig({ ...config, active: !config.active })}
                className={`relative h-6 w-11 rounded-full transition-colors ${config.active ? "bg-green-500" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${config.active ? "translate-x-5" : "translate-x-0.5"}`} />
              </button>
            </div>
          </div>

          <div className="rounded-lg bg-blue-500/5 border border-blue-500/20 p-4">
            <p className="text-xs text-blue-400 leading-relaxed">
              <span className="font-medium">Como obter as credenciais:</span> Acesse{" "}
              <a href="https://www.mercadopago.com.br/developers/panel" target="_blank" rel="noopener noreferrer" className="underline hover:text-blue-300 inline-flex items-center gap-0.5">
                Mercado Pago Developers <ExternalLinkIcon className="h-3 w-3" />
              </a>
              {" "}→ Suas integrações → Credenciais de produção.
            </p>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Access Token (Produção)
            </label>
            <div className="relative">
              <input
                type={showToken ? "text" : "password"}
                value={config.mpAccessToken}
                onChange={(e) => setConfig({ ...config, mpAccessToken: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white font-mono focus:border-yellow-500 focus:outline-none"
                placeholder="APP_USR-..."
              />
              <button
                type="button"
                onClick={() => setShowToken(!showToken)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showToken ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Public Key
            </label>
            <input
              type="text"
              value={config.mpPublicKey}
              onChange={(e) => setConfig({ ...config, mpPublicKey: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white font-mono focus:border-yellow-500 focus:outline-none"
              placeholder="APP_USR-..."
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Webhook Secret (opcional)
            </label>
            <div className="relative">
              <input
                type={showSecret ? "text" : "password"}
                value={config.mpWebhookSecret}
                onChange={(e) => setConfig({ ...config, mpWebhookSecret: e.target.value })}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 pr-10 text-sm text-white font-mono focus:border-yellow-500 focus:outline-none"
                placeholder="Para validação de webhooks"
              />
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showSecret ? <EyeOffIcon className="h-4 w-4" /> : <EyeIcon className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
            >
              {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar Credenciais"}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
