"use client"

import { useEffect, useState } from "react"
import { ClockIcon, SaveIcon, Loader2Icon, CheckIcon } from "lucide-react"

const DAYS = [
  { label: "Domingo", value: 0 },
  { label: "Segunda-feira", value: 1 },
  { label: "Terça-feira", value: 2 },
  { label: "Quarta-feira", value: 3 },
  { label: "Quinta-feira", value: 4 },
  { label: "Sexta-feira", value: 5 },
  { label: "Sábado", value: 6 },
]

const SLOT_OPTIONS = [
  { label: "15 minutos", value: 15 },
  { label: "30 minutos", value: 30 },
  { label: "45 minutos", value: 45 },
  { label: "60 minutos", value: 60 },
]

interface HourConfig {
  dayOfWeek: number
  openTime: string
  closeTime: string
  slotMinutes: number
  enabled: boolean
}

interface Barbershop {
  id: string
  name: string
}

export default function HoursPage() {
  const [hours, setHours] = useState<HourConfig[]>(
    DAYS.map((d) => ({
      dayOfWeek: d.value,
      openTime: "09:00",
      closeTime: "18:00",
      slotMinutes: 30,
      enabled: d.value >= 1 && d.value <= 6, // Mon-Sat by default
    })),
  )
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [selectedShopId, setSelectedShopId] = useState<string>("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const init = async () => {
      try {
        const meRes = await fetch("/api/admin/me")
        const me = await meRes.json()
        setIsSuperAdmin(me.role === "SUPERADMIN")

        if (me.role === "SUPERADMIN") {
          const shopsRes = await fetch("/api/admin/barbershops")
          const shops = await shopsRes.json()
          setBarbershops(Array.isArray(shops) ? shops : [])
          if (shops.length > 0) {
            setSelectedShopId(shops[0].id)
            await loadHours(shops[0].id)
          }
        } else if (me.barbershopId) {
          setSelectedShopId(me.barbershopId)
          await loadHours(me.barbershopId)
        }
      } catch {
        setError("Erro ao carregar dados")
      } finally {
        setLoading(false)
      }
    }
    init()
  }, [])

  useEffect(() => {
    if (selectedShopId) {
      setLoading(true)
      loadHours(selectedShopId).finally(() => setLoading(false))
    }
  }, [selectedShopId])

  const loadHours = async (shopId: string) => {
    try {
      const res = await fetch(`/api/admin/hours?barbershopId=${shopId}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        // Merge with defaults
        const newHours: HourConfig[] = DAYS.map((d) => {
          const existing = data.find(
            (h: { dayOfWeek: number }) => h.dayOfWeek === d.value,
          )
          return {
            dayOfWeek: d.value,
            openTime: existing?.openTime || "09:00",
            closeTime: existing?.closeTime || "18:00",
            slotMinutes: existing?.slotMinutes || 30,
            enabled: !!existing,
          }
        })
        setHours(newHours)
      }
    } catch {
      // ignore
    }
  }

  const handleSave = async () => {
    if (!selectedShopId) return
    setSaving(true)
    setError("")
    setSuccess(false)
    try {
      const res = await fetch("/api/admin/hours", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          barbershopId: selectedShopId,
          hours,
        }),
      })
      if (res.ok) {
        setSuccess(true)
        setTimeout(() => setSuccess(false), 3000)
      } else {
        const d = await res.json()
        setError(d.error || "Erro ao salvar")
      }
    } catch {
      setError("Erro de conexão")
    } finally {
      setSaving(false)
    }
  }

  const updateDay = (
    dayOfWeek: number,
    field: keyof HourConfig,
    value: string | number | boolean,
  ) => {
    setHours((prev) =>
      prev.map((h) =>
        h.dayOfWeek === dayOfWeek ? { ...h, [field]: value } : h,
      ),
    )
  }

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-gray-400">
        <Loader2Icon size={18} className="animate-spin" />
        Carregando horários...
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">
            Horários de Funcionamento
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Configure os dias e horários disponíveis para agendamento.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving || !selectedShopId}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-yellow-400 disabled:opacity-60"
        >
          {saving ? (
            <Loader2Icon size={16} className="animate-spin" />
          ) : success ? (
            <CheckIcon size={16} />
          ) : (
            <SaveIcon size={16} />
          )}
          {saving ? "Salvando..." : success ? "Salvo!" : "Salvar"}
        </button>
      </div>

      {/* Shop selector for superadmin */}
      {isSuperAdmin && barbershops.length > 0 && (
        <div className="mb-6">
          <label className="mb-1.5 block text-sm font-medium text-gray-300">
            Barbearia
          </label>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
          >
            {barbershops.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✅ Horários salvos com sucesso!
        </div>
      )}

      {/* Hours grid */}
      <div className="space-y-3">
        {DAYS.map((day) => {
          const config = hours.find((h) => h.dayOfWeek === day.value)!
          return (
            <div
              key={day.value}
              className={`rounded-xl border p-4 transition-colors ${
                config.enabled
                  ? "border-gray-700 bg-gray-900"
                  : "border-gray-800 bg-gray-950 opacity-60"
              }`}
            >
              <div className="flex flex-wrap items-center gap-4">
                {/* Toggle */}
                <label className="flex cursor-pointer items-center gap-3">
                  <div
                    onClick={() =>
                      updateDay(day.value, "enabled", !config.enabled)
                    }
                    className={`relative h-6 w-11 rounded-full transition-colors ${
                      config.enabled ? "bg-yellow-500" : "bg-gray-700"
                    }`}
                  >
                    <span
                      className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${
                        config.enabled ? "translate-x-5" : "translate-x-0.5"
                      }`}
                    />
                  </div>
                  <span className="w-32 text-sm font-medium text-white">
                    {day.label}
                  </span>
                </label>

                {config.enabled && (
                  <div className="flex flex-wrap items-center gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <ClockIcon size={14} className="text-gray-400" />
                      <span className="text-gray-400">Abertura:</span>
                      <input
                        type="time"
                        value={config.openTime}
                        onChange={(e) =>
                          updateDay(day.value, "openTime", e.target.value)
                        }
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <ClockIcon size={14} className="text-gray-400" />
                      <span className="text-gray-400">Fechamento:</span>
                      <input
                        type="time"
                        value={config.closeTime}
                        onChange={(e) =>
                          updateDay(day.value, "closeTime", e.target.value)
                        }
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:border-yellow-500 focus:outline-none"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-gray-400">Intervalo:</span>
                      <select
                        value={config.slotMinutes}
                        onChange={(e) =>
                          updateDay(
                            day.value,
                            "slotMinutes",
                            Number(e.target.value),
                          )
                        }
                        className="rounded border border-gray-700 bg-gray-800 px-2 py-1 text-sm text-white focus:border-yellow-500 focus:outline-none"
                      >
                        {SLOT_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {!config.enabled && (
                  <span className="text-sm text-gray-500">Fechado</span>
                )}
              </div>
            </div>
          )
        })}
      </div>

      <p className="mt-4 text-xs text-gray-500">
        * Os horários definem quais slots de agendamento ficam disponíveis para
        os clientes. Dias desabilitados aparecem como &quot;fechados&quot;.
      </p>
    </div>
  )
}
