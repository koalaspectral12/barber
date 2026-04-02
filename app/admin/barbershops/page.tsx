"use client"

import { useEffect, useState } from "react"
import {
  PlusIcon, PencilIcon, TrashIcon, SearchIcon,
  ScissorsIcon, XIcon, CheckIcon, Loader2Icon,
} from "lucide-react"
import ImageUpload from "@/app/_components/image-upload"

interface Barbershop {
  id: string
  name: string
  address: string
  phones: string[]
  description: string
  imageUrl: string
  createdAt: string
  _count: { services: number }
  admin?: { user: { name: string | null; email: string } } | null
}

interface FormState {
  name: string
  address: string
  phones: string
  description: string
  imageUrl: string
}

const emptyForm: FormState = { name: "", address: "", phones: "", description: "", imageUrl: "" }

export default function BarbershopsAdminPage() {
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState<FormState>(emptyForm)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [isSuperAdmin, setIsSuperAdmin] = useState(false)

  const fetchAll = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const [bRes, meRes] = await Promise.all([
        fetch("/api/admin/barbershops"),
        fetch("/api/admin/me"),
      ])
      const [bData, meData] = await Promise.all([bRes.json(), meRes.json()])
      if (Array.isArray(bData)) setBarbershops(bData)
      else { setFetchError(bData?.error || "Erro ao carregar"); setBarbershops([]) }
      setIsSuperAdmin(meData?.role === "SUPERADMIN")
    } catch {
      setFetchError("Não foi possível conectar ao servidor")
      setBarbershops([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = barbershops.filter(
    (b) => b.name.toLowerCase().includes(search.toLowerCase()) ||
      b.address.toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setModalOpen(true)
  }

  const openEdit = (b: Barbershop) => {
    setEditingId(b.id)
    setForm({ name: b.name, address: b.address, phones: b.phones.join(", "), description: b.description, imageUrl: b.imageUrl })
    setError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.address || !form.description || !form.imageUrl) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const payload = { ...form, phones: form.phones.split(",").map((p) => p.trim()).filter(Boolean) }
      const url = editingId ? `/api/admin/barbershops/${editingId}` : "/api/admin/barbershops"
      const res = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setModalOpen(false)
      setSuccessMsg(editingId ? "Barbearia atualizada!" : "Barbearia criada!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar barbearia.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/barbershops/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao deletar")
      setDeleteConfirm(null)
      setSuccessMsg("Barbearia removida!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao deletar")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Barbearias</h1>
          <p className="text-sm text-gray-400">Gerencie as barbearias cadastradas</p>
        </div>
        {isSuperAdmin && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
          >
            <PlusIcon className="h-4 w-4" />
            Nova Barbearia
          </button>
        )}
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckIcon className="h-4 w-4" /> {successMsg}
        </div>
      )}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou endereço..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Barbearia</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Endereço</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Admin</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Serviços</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={5}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-500">
                  <ScissorsIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhuma barbearia encontrada
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="transition-colors hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={b.imageUrl} alt={b.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{b.name}</p>
                        <p className="text-xs text-gray-500 md:hidden">{b.address}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">{b.address}</td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {b.admin?.user ? (
                      <span className="text-xs text-gray-300">{b.admin.user.name || b.admin.user.email}</span>
                    ) : (
                      <span className="text-xs text-gray-600">Sem admin</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
                      {b._count?.services ?? 0} serviço(s)
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(b)}
                        className="rounded-lg p-1.5 text-gray-400 hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {isSuperAdmin && (
                        <button
                          onClick={() => setDeleteConfirm(b.id)}
                          className="rounded-lg p-1.5 text-gray-400 hover:bg-red-500/10 hover:text-red-400"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-lg overflow-y-auto max-h-[90vh] rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Barbearia" : "Nova Barbearia"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{error}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Barbearia Vintage"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Endereço *</label>
                <input
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Rua das Flores, 123"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Telefones (separados por vírgula)
                </label>
                <input
                  value={form.phones}
                  onChange={(e) => setForm({ ...form, phones: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="(11) 99999-9999, (11) 88888-8888"
                />
              </div>

              {/* Upload de imagem */}
              <ImageUpload
                value={form.imageUrl}
                onChange={(url) => setForm({ ...form, imageUrl: url })}
                label="Foto da Barbearia *"
              />

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Descrição *</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Descreva a barbearia..."
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm font-medium text-gray-400 hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {editingId ? "Salvar Alterações" : "Criar Barbearia"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setDeleteConfirm(null)} />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">Confirmar exclusão</h2>
            <p className="mb-6 text-sm text-gray-400">
              Todos os serviços e dados desta barbearia serão removidos. Ação irreversível.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800">Cancelar</button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
