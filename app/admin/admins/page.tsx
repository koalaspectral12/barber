"use client"

import { useEffect, useState } from "react"
import {
  PlusIcon, PencilIcon, TrashIcon, SearchIcon, XIcon,
  CheckIcon, Loader2Icon, ShieldCheckIcon, ShieldIcon,
} from "lucide-react"

interface Admin {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: string
  managedShop: {
    barbershop: { id: string; name: string; imageUrl: string }
  } | null
}

interface Barbershop {
  id: string
  name: string
}

const ROLE_LABELS: Record<string, string> = {
  ADMIN: "Admin",
  SUPERADMIN: "Superadmin",
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: "bg-blue-500/10 text-blue-400",
  SUPERADMIN: "bg-yellow-500/10 text-yellow-400",
}

export default function AdminsPage() {
  const [admins, setAdmins] = useState<Admin[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [form, setForm] = useState({ name: "", email: "", password: "", barbershopId: "", role: "ADMIN" })
  const [formError, setFormError] = useState("")

  const fetchAll = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const [aRes, bRes] = await Promise.all([
        fetch("/api/admin/admins"),
        fetch("/api/admin/barbershops"),
      ])
      const [aData, bData] = await Promise.all([aRes.json(), bRes.json()])
      setAdmins(Array.isArray(aData) ? aData : [])
      setBarbershops(Array.isArray(bData) ? bData : [])
      if (!Array.isArray(aData)) setFetchError(aData?.error || "Erro ao carregar")
    } catch {
      setFetchError("Erro ao conectar ao servidor")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  const filtered = admins.filter((a) =>
    (a.name || "").toLowerCase().includes(search.toLowerCase()) ||
    a.email.toLowerCase().includes(search.toLowerCase()) ||
    (a.managedShop?.barbershop?.name || "").toLowerCase().includes(search.toLowerCase())
  )

  const openCreate = () => {
    setEditingId(null)
    setForm({ name: "", email: "", password: "", barbershopId: "", role: "ADMIN" })
    setFormError("")
    setModalOpen(true)
  }

  const openEdit = (a: Admin) => {
    setEditingId(a.id)
    setForm({
      name: a.name || "",
      email: a.email,
      password: "",
      barbershopId: a.managedShop?.barbershop?.id || "",
      role: a.role,
    })
    setFormError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email) {
      setFormError("Nome e email são obrigatórios")
      return
    }
    if (!editingId && !form.password) {
      setFormError("Senha é obrigatória para novos admins")
      return
    }
    setSaving(true)
    setFormError("")
    try {
      const url = editingId ? `/api/admin/admins/${editingId}` : "/api/admin/admins"
      const method = editingId ? "PUT" : "POST"
      const body = editingId
        ? { name: form.name, password: form.password || undefined, barbershopId: form.barbershopId }
        : form
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao salvar")
      setModalOpen(false)
      setSuccessMsg(editingId ? "Admin atualizado!" : "Admin criado com sucesso!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setFormError(e instanceof Error ? e.message : "Erro ao salvar")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      const res = await fetch(`/api/admin/admins/${id}`, { method: "DELETE" })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || "Erro ao remover")
      setDeleteConfirm(null)
      setSuccessMsg("Admin removido!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setSuccessMsg("")
      setFetchError(e instanceof Error ? e.message : "Erro ao remover")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Administradores</h1>
          <p className="text-sm text-gray-400">Gerencie os admins e seus acessos às barbearias</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
        >
          <PlusIcon className="h-4 w-4" />
          Novo Admin
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckIcon className="h-4 w-4" />
          {successMsg}
        </div>
      )}
      {fetchError && (
        <div className="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ⚠️ {fetchError}
        </div>
      )}

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome, email ou barbearia..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
        />
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Administrador</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">Função</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">Barbearia</th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={4}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-12 text-center text-gray-500">
                  <ShieldCheckIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum admin encontrado
                </td>
              </tr>
            ) : (
              filtered.map((a) => (
                <tr key={a.id} className="transition-colors hover:bg-gray-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-700">
                        <ShieldIcon className="h-4 w-4 text-gray-400" />
                      </div>
                      <div>
                        <p className="font-medium text-white">{a.name || "—"}</p>
                        <p className="text-xs text-gray-500">{a.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${ROLE_COLORS[a.role] || "bg-gray-700 text-gray-400"}`}>
                      {ROLE_LABELS[a.role] || a.role}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {a.managedShop?.barbershop ? (
                      <span className="text-sm text-gray-300">{a.managedShop.barbershop.name}</span>
                    ) : a.role === "SUPERADMIN" ? (
                      <span className="text-xs text-yellow-400">Todas as barbearias</span>
                    ) : (
                      <span className="text-xs text-gray-500">Sem barbearia</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(a)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      {a.role !== "SUPERADMIN" && (
                        <button
                          onClick={() => setDeleteConfirm(a.id)}
                          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
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

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/70" onClick={() => setModalOpen(false)} />
          <div className="relative w-full max-w-md rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Admin" : "Novo Admin"}
              </h2>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-white">
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {formError && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">{formError}</div>
            )}

            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">Nome *</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Nome completo"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Email * {editingId && <span className="text-gray-600">(não editável)</span>}
                </label>
                <input
                  value={form.email}
                  disabled={!!editingId}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                  placeholder="email@exemplo.com"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Senha {editingId ? "(deixe em branco para manter)" : "*"}
                </label>
                <input
                  type="password"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder={editingId ? "••••••• (manter)" : "Mínimo 6 caracteres"}
                />
              </div>

              {!editingId && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Função</label>
                  <select
                    value={form.role}
                    onChange={(e) => setForm({ ...form, role: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="ADMIN">Admin (1 barbearia)</option>
                    <option value="SUPERADMIN">Superadmin (todas)</option>
                  </select>
                </div>
              )}

              {(form.role === "ADMIN" || editingId) && (
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">Barbearia</label>
                  <select
                    value={form.barbershopId}
                    onChange={(e) => setForm({ ...form, barbershopId: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  >
                    <option value="">Sem barbearia</option>
                    {barbershops.map((s) => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                {editingId ? "Salvar" : "Criar Admin"}
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
            <h2 className="mb-2 text-lg font-bold text-white">Remover admin?</h2>
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
