"use client"

import { useEffect, useState } from "react"
import { CheckIcon, Loader2Icon, SettingsIcon } from "lucide-react"
import ImageUpload, { MultiImageUpload } from "@/app/_components/image-upload"

interface Settings {
  appName: string
  logoUrl: string | null
  banners: string[]
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<Settings>({ appName: "Barberon", logoUrl: null, banners: [] })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) setSettings(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError("")
    try {
      const res = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setSettings(data)
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
          <SettingsIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Configurações do App</h1>
          <p className="text-sm text-gray-400">Nome, logo e banners da tela principal</p>
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

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Nome e Logo */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          <h2 className="font-semibold text-white">Identidade Visual</h2>

          <div>
            <label className="mb-1.5 block text-xs font-medium text-gray-400">
              Nome do Aplicativo
            </label>
            <input
              value={settings.appName}
              onChange={(e) => setSettings({ ...settings, appName: e.target.value })}
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
              placeholder="Barberon"
            />
            <p className="mt-1 text-xs text-gray-500">
              Aparece no cabeçalho e nas páginas do app
            </p>
          </div>

          <ImageUpload
            value={settings.logoUrl || ""}
            onChange={(url) => setSettings({ ...settings, logoUrl: url || null })}
            label="Logo (substitui o ícone + nome no cabeçalho)"
          />
        </div>

        {/* Banners */}
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 space-y-5">
          <h2 className="font-semibold text-white">Banners da Tela Principal</h2>

          <MultiImageUpload
            values={settings.banners}
            onChange={(urls) => setSettings({ ...settings, banners: urls })}
            label="Imagens do banner"
            maxImages={5}
          />

          <div className="rounded-lg bg-gray-800 p-3">
            <p className="text-xs text-gray-400">
              <span className="font-medium text-white">Dica:</span> Adicione mais de 1 imagem para criar um carrossel automático na tela principal. As imagens trocam a cada 4 segundos.
            </p>
          </div>
        </div>
      </div>

      {/* Preview */}
      {settings.banners.length > 0 && (
        <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
          <h2 className="mb-4 font-semibold text-white">Preview dos Banners</h2>
          <div className="flex gap-3 overflow-x-auto pb-2">
            {settings.banners.map((url, idx) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                key={idx}
                src={url}
                alt={`Banner ${idx + 1}`}
                className="h-24 w-48 flex-shrink-0 rounded-lg object-cover border border-gray-700"
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-6 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
        >
          {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
          {saving ? "Salvando..." : "Salvar Configurações"}
        </button>
      </div>
    </div>
  )
}
