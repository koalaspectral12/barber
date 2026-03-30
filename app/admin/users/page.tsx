"use client"

import { useEffect, useState } from "react"
import { SearchIcon, UsersIcon, CalendarIcon } from "lucide-react"
import Image from "next/image"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  createdAt: string
  emailVerified: string | null
  _count: { bookings: number }
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [fetchError, setFetchError] = useState("")

  useEffect(() => {
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setUsers(data)
        } else {
          setFetchError(data?.error || "Erro ao carregar usuários")
          setUsers([])
        }
        setLoading(false)
      })
      .catch(() => {
        setFetchError("Não foi possível conectar ao banco de dados")
        setUsers([])
        setLoading(false)
      })
  }, [])

  const filtered = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-sm text-gray-400">
          Usuários registrados na plataforma
        </p>
      </div>

      {fetchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-medium">Banco de dados indisponível</p>
            <p className="text-xs text-red-400/70">{fetchError}</p>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 rounded-xl border border-gray-800 bg-gray-900 p-5">
        <div className="rounded-lg bg-purple-500/10 p-3">
          <UsersIcon className="h-5 w-5 text-purple-400" />
        </div>
        <div>
          <p className="text-2xl font-bold text-white">
            {loading ? (
              <span className="inline-block h-7 w-12 animate-pulse rounded bg-gray-800" />
            ) : (
              users.length
            )}
          </p>
          <p className="text-sm text-gray-400">Total de usuários cadastrados</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Buscar por nome ou email..."
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
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Email
              </th>
              <th className="px-4 py-3 font-medium">Agendamentos</th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Verificado
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Cadastro
              </th>
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
                  <UsersIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className="transition-colors hover:bg-gray-800/50"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                        {u.image ? (
                          <Image
                            src={u.image}
                            alt={u.name ?? ""}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-sm font-medium text-gray-400">
                            {(u.name ?? u.email).charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-white">
                          {u.name ?? (
                            <span className="italic text-gray-500">
                              Sem nome
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-gray-500 md:hidden">
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 text-gray-400 md:table-cell">
                    {u.email}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <CalendarIcon className="h-3.5 w-3.5 text-gray-500" />
                      <span
                        className={
                          u._count.bookings > 0
                            ? "font-semibold text-yellow-400"
                            : "text-gray-500"
                        }
                      >
                        {u._count.bookings}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    {u.emailVerified ? (
                      <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs text-green-400">
                        Verificado
                      </span>
                    ) : (
                      <span className="rounded-full bg-gray-700/50 px-2 py-0.5 text-xs text-gray-500">
                        Pendente
                      </span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-gray-500 lg:table-cell">
                    {new Date(u.createdAt).toLocaleDateString("pt-BR")}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
