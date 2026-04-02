"use client"

import { useEffect, useState } from "react"
import {
  PlusIcon, PencilIcon, TrashIcon, SearchIcon,
  SparklesIcon, XIcon, CheckIcon, Loader2Icon,
} from "lucide-react"
import ImageUpload from "@/app/_components/image-upload"

interface Service {
  id: string
  name: string
  description: string
  price: string
  imageUrl: string
  barbershopId: string
  barbershop: { id: string; name: string }
}

interface Barbershop { id: string; name: string }

interface FormState {
  name: string
  description: string
  price: string
  imageUrl: string
  barbershopId: string
}

const emptyForm: FormState = { name: "", description: "", price: "", imageUrl: "", barbershopId: "" }

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterShop, setFilterShop] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)
  const [adminBarbershopId, setAdminBarbershopId] = useState<string | null>(null)

  const fetchAll = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const [sRes, bRes, meRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/barbershops"),
        fetch("/api/admin/me"),
      ])
      const [sData, bData, meData] = await Promise.all([sRes.json(), bRes.json(), meRes.json()])
      setServices(Array.isArray(sData) ? sData : [])
      setBarbershops(Array.isArray(bData) ? bData : [])
      if (!Array.isArray(sData)) setFetchError(sData?.error || "Erro ao carregar")
      setIsSuperAdmin(meData?.role === "SUPERADMIN")
      setAdminBarbershopId(meData?.barbershopId || null)
      // Pré-selecionar a barbearia do admin no form
      if (meData?.role === "ADMIN" && meData?.barbershopId) {
        setForm((f) => ({ ...f, barbershopId: meData.barbershopId }))
        setFilterShop(meData.barbershopId)
      }
    } catch {
      setFetchError("Não foi possível conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = services.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.barbershop?.name.toLowerCase().includes(search.toLowerCase())
    const matchShop = !filterShop || s.barbershopId === filterShop
    return matchSearch && matchShop
  })

  const openCreate = () => {
    setEditingId(null)
    setForm({ ...emptyForm, barbershopId: adminBarbershopId || "" })
    setError("")
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditingId(s.id)
    setForm({ name: s.name, description: s.description, price: s.price.toString(), imageUrl: s.imageUrl, barbershopId: s.barbershopId })
    setError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.description || !form.price || !form.imageUrl || !form.barbershopId) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId ? `/api/admin/services/${editingId}` : "/api/admin/services"
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setModalOpen(false)
      setSuccessMsg(editingId ? "Serviço atualizado!" : "Serviço criado!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar serviço.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await fetch(`/api/admin/services/${id}`, { method: "DELETE" })
      setDeleteConfirm(null)
      setSuccessMsg("Serviço removido!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Serviços</h1>
          <p className="text-sm text-gray-400">Gerencie os serviços das barbearias</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
        >
          <PlusIcon className="h-4 w-4" />
          Novo Serviço
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckIcon className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {fetchError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        {isSuperAdmin && (
          <select
            value={filterShop}
            onChange={(e) => setFilterShop(e.target.value)}
            className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
          >
            <option value="">Todas as barbearias</option>
            {barbershops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Serviço</th>
              {isSuperAdmin && <th className="hidden px-4 py-3 font-medium md:table-cell">Barbearia</th>}
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Preço</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={4}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                  <SparklesIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum serviço encontrado
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr key={s.id} className="transition-colors hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={s.imageUrl} alt={s.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="text-xs text-gray-500 lg:hidden">
                          {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(s.price))}
                        </p>
                      </div>
                    </div>
                  </td>
                  {isSuperAdmin && (
                    <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                      {s.barbershop?.name || "—"}
                    </td>
                  )}
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="font-medium text-yellow-400">
                      {Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(Number(s.price))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(s)} className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400">
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button onClick={() => setDeleteConfirm(s.id)} className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400">
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Serviço" : "Novo Serviço"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {error && <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Corte Clássico"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Preço (R$) *</label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              {isSuperAdmin && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Barbearia *</label>
                  <select
                    value={form.barbershopId}
                    onChange={(e) => setForm({ ...form, barbershopId: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="">Selecione uma barbearia</option>
                    {barbershops.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                </div>
              )}

              {/* Upload de imagem */}
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                label="Foto do Serviço *"
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Descreva o serviço..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button onClick={() => setModalOpen(false)} className="flex-1 rounded-lg border border-gray-700 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800">Cancelar</button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {editingId ? "Salvar Alterações" : "Criar Serviço"}
              </button>
            </div>
          </div>
        </div>
      )}

      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">Remover serviço?</h2>
            <p className="mb-6 text-sm text-gray-400">Esta ação é irreversível.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancelar</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                Remover
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
