"use client"

import { useEffect, useState } from "react"
import {
  TrashIcon,
  SearchIcon,
  CalendarIcon,
  CheckIcon,
  Loader2Icon,
  ClockIcon,
} from "lucide-react"
import Image from "next/image"

interface Booking {
  id: string
  date: string
  createdAt: string
  user: { id: string; name: string | null; email: string; image: string | null }
  service: {
    id: string
    name: string
    price: string
    barbershop: { id: string; name: string }
  }
}

export default function BookingsAdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "upcoming" | "past">("all")
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [fetchError, setFetchError] = useState("")

  const fetchBookings = async () => {
    setLoading(true)
    setFetchError("")
    try {
      const res = await fetch("/api/admin/bookings")
      const data = await res.json()
      if (Array.isArray(data)) {
        setBookings(data)
      } else {
        setFetchError(data?.error || "Erro ao carregar agendamentos")
        setBookings([])
      }
    } catch {
      setFetchError("Não foi possível conectar ao banco de dados")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBookings()
  }, [])

  const now = new Date()

  const filtered = bookings.filter((b) => {
    const matchSearch =
      (b.user.name ?? b.user.email)
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      b.service.name.toLowerCase().includes(search.toLowerCase()) ||
      b.service.barbershop.name.toLowerCase().includes(search.toLowerCase())

    const bookingDate = new Date(b.date)
    const matchFilter =
      filter === "all" ||
      (filter === "upcoming" && bookingDate >= now) ||
      (filter === "past" && bookingDate < now)

    return matchSearch && matchFilter
  })

  const handleDelete = async (id: string) => {
    setSaving(true)
    try {
      await fetch(`/api/admin/bookings/${id}`, { method: "DELETE" })
      setDeleteConfirm(null)
      setSuccessMsg("Agendamento cancelado!")
      setTimeout(() => setSuccessMsg(""), 3000)
      await fetchBookings()
    } catch {
      // handle error
    } finally {
      setSaving(false)
    }
  }

  const upcomingCount = bookings.filter((b) => new Date(b.date) >= now).length
  const pastCount = bookings.filter((b) => new Date(b.date) < now).length

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Agendamentos</h1>
        <p className="text-sm text-gray-400">
          Visualize e gerencie todos os agendamentos
        </p>
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

      {/* Stats mini */}
      <div className="grid grid-cols-3 gap-3">
        {[
          {
            label: "Total",
            value: bookings.length,
            color: "text-white",
            bg: "bg-gray-800",
          },
          {
            label: "Futuros",
            value: upcomingCount,
            color: "text-green-400",
            bg: "bg-green-500/10",
          },
          {
            label: "Realizados",
            value: pastCount,
            color: "text-gray-400",
            bg: "bg-gray-800",
          },
        ].map((s) => (
          <div
            key={s.label}
            className={`rounded-xl border border-gray-800 ${s.bg} p-4 text-center`}
          >
            <p className={`text-2xl font-bold ${s.color}`}>
              {loading ? (
                <span className="inline-block h-6 w-10 animate-pulse rounded bg-gray-700" />
              ) : (
                s.value
              )}
            </p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar por usuário, serviço ou barbearia..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-800 bg-gray-900 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
          />
        </div>
        <div className="flex rounded-lg border border-gray-800 bg-gray-900 p-1">
          {(["all", "upcoming", "past"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                filter === f
                  ? "bg-yellow-500 text-black"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              {f === "all"
                ? "Todos"
                : f === "upcoming"
                  ? "Futuros"
                  : "Passados"}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Cliente</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Serviço
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Barbearia
              </th>
              <th className="px-4 py-3 font-medium">Data</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Valor
              </th>
              <th className="px-4 py-3 text-right font-medium">Status</th>
              <th className="px-4 py-3 text-right font-medium">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={7}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <CalendarIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum agendamento encontrado
                </td>
              </tr>
            ) : (
              filtered.map((b) => {
                const isUpcoming = new Date(b.date) >= now
                return (
                  <tr
                    key={b.id}
                    className="transition-colors hover:bg-gray-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className="relative h-8 w-8 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                          {b.user.image ? (
                            <Image
                              src={b.user.image}
                              alt={b.user.name ?? ""}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                              {(b.user.name ?? b.user.email)
                                .charAt(0)
                                .toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-white">
                            {b.user.name ?? b.user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                      {b.service.name}
                    </td>
                    <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                      {b.service.barbershop.name}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1 text-gray-300">
                        <ClockIcon className="h-3 w-3 text-gray-500" />
                        <span className="text-xs">
                          {new Date(b.date).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "2-digit",
                            year: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <span className="font-semibold text-yellow-400">
                        {Intl.NumberFormat("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }).format(Number(b.service.price))}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          isUpcoming
                            ? "bg-green-500/10 text-green-400"
                            : "bg-gray-700/50 text-gray-500"
                        }`}
                      >
                        {isUpcoming ? "Futuro" : "Realizado"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => setDeleteConfirm(b.id)}
                        className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-400"
                        title="Cancelar agendamento"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/70"
            onClick={() => setDeleteConfirm(null)}
          />
          <div className="relative w-full max-w-sm rounded-xl border border-gray-800 bg-gray-900 p-6 shadow-2xl">
            <h2 className="mb-2 text-lg font-bold text-white">
              Cancelar agendamento?
            </h2>
            <p className="mb-6 text-sm text-gray-400">
              O agendamento será removido permanentemente.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-800"
              >
                Voltar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                disabled={saving}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:opacity-60"
              >
                {saving && <Loader2Icon className="h-4 w-4 animate-spin" />}
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
