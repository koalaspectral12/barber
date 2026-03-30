"use client"

import { useEffect, useState } from "react"
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  SearchIcon,
  SparklesIcon,
  XIcon,
  CheckIcon,
  Loader2Icon,
} from "lucide-react"
import Image from "next/image"

interface Service {
  id: string
  name: string
  description: string
  price: string
  imageUrl: string
  barbershopId: string
  barbershop: { id: string; name: string }
}

interface Barbershop {
  id: string
  name: string
}

interface FormState {
  name: string
  description: string
  price: string
  imageUrl: string
  barbershopId: string
}

const emptyForm: FormState = {
  name: "",
  description: "",
  price: "",
  imageUrl: "",
  barbershopId: "",
}

export default function ServicesAdminPage() {
  const [services, setServices] = useState<Service[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterBarbershop, setFilterBarbershop] = useState("")
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
      const [sRes, bRes] = await Promise.all([
        fetch("/api/admin/services"),
        fetch("/api/admin/barbershops"),
      ])
      const [sData, bData] = await Promise.all([sRes.json(), bRes.json()])
      if (Array.isArray(sData)) {
        setServices(sData)
      } else {
        setFetchError(sData?.error || "Erro ao carregar serviços")
        setServices([])
      }
      setBarbershops(Array.isArray(bData) ? bData : [])
    } catch {
      setFetchError("Não foi possível conectar ao banco de dados")
      setServices([])
      setBarbershops([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAll()
  }, [])

  const filtered = services.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.barbershop.name.toLowerCase().includes(search.toLowerCase())
    const matchBarbershop =
      !filterBarbershop || s.barbershopId === filterBarbershop
    return matchSearch && matchBarbershop
  })

  const openCreate = () => {
    setEditingId(null)
    setForm(emptyForm)
    setError("")
    setModalOpen(true)
  }

  const openEdit = (s: Service) => {
    setEditingId(s.id)
    setForm({
      name: s.name,
      description: s.description,
      price: String(s.price),
      imageUrl: s.imageUrl,
      barbershopId: s.barbershopId,
    })
    setError("")
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (
      !form.name ||
      !form.description ||
      !form.price ||
      !form.imageUrl ||
      !form.barbershopId
    ) {
      setError("Preencha todos os campos obrigatórios.")
      return
    }
    setSaving(true)
    setError("")
    try {
      const url = editingId
        ? `/api/admin/services/${editingId}`
        : "/api/admin/services"
      const method = editingId ? "PUT" : "POST"
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      if (!res.ok) throw new Error()
      setModalOpen(false)
      setSuccessMsg(editingId ? "Serviço atualizado!" : "Serviço criado!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchAll()
    } catch {
      setError("Erro ao salvar serviço.")
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
    } catch {
      setError("Erro ao deletar.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Serviços</h1>
          <p className="text-sm text-gray-400">
            Gerencie os serviços das barbearias
          </p>
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

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por serviço ou barbearia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <select
          value={filterBarbershop}
          onChange={(e) => setFilterBarbershop(e.target.value)}
          className="rounded-lg border border-gray-800 bg-gray-900 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
        >
          <option value="">Todas as barbearias</option>
          {barbershops.map((b) => (
            <option key={b.id} value={b.id}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Serviço</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Barbearia
              </th>
              <th className="px-4 py-3 font-medium">Preço</th>
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
                <td
                  colSpan={4}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <SparklesIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum serviço encontrado
                </td>
              </tr>
            ) : (
              filtered.map((s) => (
                <tr
                  key={s.id}
                  className="transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-lg">
                        <Image
                          src={s.imageUrl}
                          alt={s.name}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-medium text-white">{s.name}</p>
                        <p className="line-clamp-1 text-xs text-gray-500">
                          {s.description}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                    {s.barbershop.name}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-yellow-400">
                      {Intl.NumberFormat("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }).format(Number(s.price))}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(s)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-blue-500/10 hover:text-blue-400"
                      >
                        <PencilIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(s.id)}
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

      {/* Create/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setModalOpen(false)}
          />
          <div className="relative w-full max-w-lg rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">
                {editingId ? "Editar Serviço" : "Novo Serviço"}
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
                  {barbershops.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Nome do Serviço *
                </label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Corte de Cabelo"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Descrição *
                </label>
                <input
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="Ex: Corte moderno com acabamento perfeito"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  Preço (R$) *
                </label>
                <input
                  type="number"
                  value={form.price}
                  onChange={(e) => setForm({ ...form, price: e.target.value })}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white focus:border-yellow-500 focus:outline-none"
                  placeholder="50.00"
                  step="0.01"
                  min="0"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-gray-400">
                  URL da Imagem *
                </label>
                <input
                  value={form.imageUrl}
                  onChange={(e) =>
                    setForm({ ...form, imageUrl: e.target.value })
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
                {editingId ? "Salvar" : "Criar Serviço"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">
              Confirmar exclusão
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              Tem certeza que deseja remover este serviço?
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
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
