"use client"

import { useEffect, useState } from "react"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  XIcon,
  CheckIcon,
  Loader2Icon,
  ScissorsIcon,
} from "lucide-react"
import Image from "next/image"

interface Barber {
  id: string
  specialty: string | null
  bio: string | null
  avatarUrl: string | null
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
    image: string | null
    role: string
  }
  barbershop: { id: string; name: string; imageUrl: string }
}

interface Barbershop {
  id: string
  name: string
}

interface FormState {
  name: string
  email: string
  barbershopId: string
  specialty: string
  bio: string
  avatarUrl: string
}

const emptyForm: FormState = {
  name: "",
  email: "",
  barbershopId: "",
  specialty: "",
  bio: "",
  avatarUrl: "",
}

export default function BarbersAdminPage() {
  const [barbers, setBarbers] = useState<Barber[]>([])
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

  const fetchAll = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const [bRes, sRes] = await Promise.all([
        fetch("/api/admin/barbers"),
        fetch("/api/admin/barbershops"),
      ])
      const [bData, sData] = await Promise.all([bRes.json(), sRes.json()])
      setBarbers(Array.isArray(bData) ? bData : [])
      setBarbershops(Array.isArray(sData) ? sData : [])
      if (!Array.isArray(bData))
        setFetchError(bData?.error || "Erro ao carregar barbeiros")
    } catch {
      setFetchError("Não foi possível conectar ao banco de dados")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filtered = barbers.filter((b) => {
    const matchSearch =
      (b.user.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      b.user.email.toLowerCase().includes(search.toLowerCase()) ||
      (b.specialty ?? "").toLowerCase().includes(search.toLowerCase()) ||
      b.barbershop.name.toLowerCase().includes(search.toLowerCase())
    const matchShop = !filterShop || b.barbershop.id === filterShop
    return matchSearch && matchShop
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setModalOpen(true)
  }

  const openEdit = (b: Barber) => {
    setEditingId(b.id)
    setForm({
      name: b.user.name ?? "",
      email: b.user.email,
      barbershopId: b.barbershop.id,
      specialty: b.specialty ?? "",
      bio: b.bio ?? "",
      avatarUrl: b.avatarUrl ?? "",
    })
    setError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.name || !form.email || !form.barbershopId) {
      setError("Nome, email e barbearia são obrigatórios.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId
        ? `/api/admin/barbers/${editingId}`
        : "/api/admin/barbers"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || "Erro ao salvar")
      setModalOpen(false)
      setSuccessMsg(editingId ? "Barbeiro atualizado!" : "Barbeiro criado!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Erro ao salvar barbeiro.")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await fetch(`/api/admin/barbers/${id}`, { method: "DELETE" })
      setDeleteConfirm(null)
      setSuccessMsg("Barbeiro removido!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } finally {
      setSaving(false)
    }
  }

  // Agrupa por barbearia para o resumo
  const byShop = barbershops.map((s) => ({
    ...s,
    count: barbers.filter((b) => b.barbershop.id === s.id).length,
  }))

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Barbeiros</h1>
          <p className="text-sm text-gray-400">
            Cadastrado pelo{" "}
            <span className="font-semibold text-yellow-400">Superadmin</span> —
            cada barbeiro pertence a uma barbearia
          </p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-yellow-500 px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-yellow-400"
        >
          <PlusIcon className="h-4 w-4" />
          Novo Barbeiro
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          <CheckIcon className="h-4 w-4" />
          {successMsg}
        </div>
      )}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-medium">Banco de dados indisponível</p>
            <p className="text-xs text-red-400/70">{fetchError}</p>
          </div>
        </div>
      )}

      {/* Cards resumo por barbearia */}
      {!loading && barbers.length > 0 && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
          {byShop.map((s) => (
            <div
              key={s.id}
              onClick={() => setFilterShop(filterShop === s.id ? "" : s.id)}
              className={`cursor-pointer rounded-xl border p-3 transition-all ${
                filterShop === s.id
                  ? "border-yellow-500/50 bg-yellow-500/10"
                  : "border-gray-800 bg-gray-900 hover:border-gray-700"
              }`}
            >
              <p className="truncate text-xs font-medium text-white">{s.name}</p>
              <p className="mt-1 text-2xl font-bold text-yellow-400">
                {s.count}
              </p>
              <p className="text-xs text-gray-500">barbeiro(s)</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por nome, email ou especialidade..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <select
          value={filterShop}
          onChange={(e) => setFilterShop(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Todas as barbearias</option>
          {barbershops.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Barbeiro</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Barbearia
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Especialidade
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Cadastro
              </th>
              <th className="px-4 py-3 font-medium text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={5}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <ScissorsIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum barbeiro encontrado
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr
                  key={b.id}
                  className="transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                        {b.user.image || b.avatarUrl ? (
                          <Image
                            src={(b.user.image || b.avatarUrl) as string}
                            alt={b.user.name ?? ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-bold text-yellow-400">
                            {(b.user.name ?? b.user.email)
                              .charAt(0)
                              .toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {b.user.name ?? "—"}
                        </p>
                        <p className="text-xs text-gray-500">{b.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    <div className="flex items-center gap-2">
                      <div className="relative h-6 w-6 overflow-hidden rounded">
                        <Image
                          src={b.barbershop.imageUrl}
                          alt={b.barbershop.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <span className="text-sm text-gray-300">
                        {b.barbershop.name}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {b.specialty ? (
                      <span className="rounded-full bg-yellow-500/10 px-2 py-0.5 text-xs text-yellow-400">
                        {b.specialty}
                      </span>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-gray-500 lg:table-cell">
                    {new Date(b.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(b)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(b.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                      >
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

      {/* Modal criar/editar */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Barbeiro" : "Novo Barbeiro"}
              </h2>
              <button
                onClick={() => setModalOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>

            {error && (
              <div className="mb-4 rounded-lg bg-red-500/10 px-4 py-2 text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Nome *
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                    placeholder="Ex: João Silva"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-400">
                    Email *{" "}
                    {editingId && (
                      <span className="text-gray-600">(não editável)</span>
                    )}
                  </label>
                  <input
                    value={form.email}
                    disabled={!!editingId}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none disabled:opacity-50"
                    placeholder="email@barbearia.com"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Barbearia *
                </label>
                <select
                  value={form.barbershopId}
                  onChange={(e) =>
                    setForm({ ...form, barbershopId: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Selecione uma barbearia</option>
                  {barbershops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Especialidade
                </label>
                <input
                  value={form.specialty}
                  onChange={(e) =>
                    setForm({ ...form, specialty: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Fade, Navalha, Coloração"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={(e) => setForm({ ...form, bio: e.target.value })}
                  rows={3}
                  className="w-full resize-none rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Breve descrição sobre o barbeiro..."
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  URL do Avatar
                </label>
                <input
                  value={form.avatarUrl}
                  onChange={(e) =>
                    setForm({ ...form, avatarUrl: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="https://..."
                />
              </div>
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
                {editingId ? "Salvar" : "Cadastrar Barbeiro"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmar delete */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">
              Remover barbeiro?
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              O usuário e perfil de barbeiro serão excluídos permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
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
