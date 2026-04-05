"use client"

import { useEffect, useState } from "react"
import {
  SearchIcon,
  UsersIcon,
  CalendarIcon,
  ShieldIcon,
  ShieldOffIcon,
  RefreshCwIcon,
  UserXIcon,
  UserCheckIcon,
  Loader2Icon,
  XIcon,
  AlertTriangleIcon,
  ClockIcon,
} from "lucide-react"

interface ManagedShop {
  id: string
  barbershopId: string
  expiresAt: string | null
  active: boolean
  barbershop: { id: string; name: string }
}

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
  emailVerified: string | null
  adminExpired: boolean
  adminActive: boolean | null
  managedShop: ManagedShop | null
  _count: { bookings: number }
}

interface Barbershop {
  id: string
  name: string
}

export default function UsersAdminPage() {
  const [users, setUsers] = useState<User[]>([])
  const [barbershops, setBarbershops] = useState<Barbershop[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [fetchError, setFetchError] = useState("")
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  // Promote modal state
  const [promoteModal, setPromoteModal] = useState<User | null>(null)
  const [selectedShopId, setSelectedShopId] = useState("")
  const [expiresAt, setExpiresAt] = useState("")

  // Renew modal state
  const [renewModal, setRenewModal] = useState<User | null>(null)
  const [renewExpiresAt, setRenewExpiresAt] = useState("")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      const [usersRes, shopsRes] = await Promise.all([
        fetch("/api/admin/users"),
        fetch("/api/admin/barbershops"),
      ])
      const usersData = await usersRes.json()
      const shopsData = await shopsRes.json()

      if (Array.isArray(usersData)) setUsers(usersData)
      else setFetchError(usersData?.error || "Erro ao carregar usuários")

      if (Array.isArray(shopsData)) setBarbershops(shopsData)
    } catch {
      setFetchError("Não foi possível conectar ao banco de dados")
    } finally {
      setLoading(false)
    }
  }

  const showSuccess = (msg: string) => {
    setSuccessMsg(msg)
    setErrorMsg("")
    setTimeout(() => setSuccessMsg(""), 3000)
  }

  const showError = (msg: string) => {
    setErrorMsg(msg)
    setSuccessMsg("")
    setTimeout(() => setErrorMsg(""), 4000)
  }

  const doAction = async (
    userId: string,
    action: string,
    extra?: { barbershopId?: string; expiresAt?: string },
  ) => {
    setActionLoading(userId + action)
    try {
      const res = await fetch("/api/admin/users/promote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, action, ...extra }),
      })
      const data = await res.json()
      if (res.ok) {
        showSuccess(data.message || "Operação realizada")
        await fetchData()
      } else {
        showError(data.error || "Erro na operação")
      }
    } catch {
      showError("Erro de conexão")
    } finally {
      setActionLoading(null)
    }
  }

  const handlePromote = async () => {
    if (!promoteModal || !selectedShopId) return
    await doAction(promoteModal.id, "promote", {
      barbershopId: selectedShopId,
      expiresAt: expiresAt || undefined,
    })
    setPromoteModal(null)
    setSelectedShopId("")
    setExpiresAt("")
  }

  const handleRenew = async () => {
    if (!renewModal) return
    await doAction(renewModal.id, "renew", {
      expiresAt: renewExpiresAt || undefined,
    })
    setRenewModal(null)
    setRenewExpiresAt("")
  }

  // Filter
  const filtered = users.filter(
    (u) =>
      (u.name ?? "").toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  )

  const roleBadge = (user: User) => {
    const isExpiredAdmin =
      user.role === "ADMIN" && (user.adminExpired || user.adminActive === false)
    if (user.role === "SUPERADMIN")
      return (
        <span className="rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs font-semibold text-yellow-400">
          Superadmin
        </span>
      )
    if (user.role === "ADMIN" && !isExpiredAdmin)
      return (
        <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-xs font-semibold text-blue-400">
          Admin
        </span>
      )
    if (isExpiredAdmin)
      return (
        <span className="rounded-full bg-red-500/20 px-2 py-0.5 text-xs font-semibold text-red-400">
          Admin inativo
        </span>
      )
    if (user.role === "BARBER")
      return (
        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-semibold text-purple-400">
          Barbeiro
        </span>
      )
    return (
      <span className="rounded-full bg-gray-700/50 px-2 py-0.5 text-xs text-gray-400">
        Cliente
      </span>
    )
  }

  // Get barbershops that don't have an active admin (for promote modal)
  const availableShops = barbershops.filter(
    (s) =>
      !users.some(
        (u) =>
          u.managedShop?.barbershopId === s.id &&
          u.role === "ADMIN" &&
          !u.adminExpired &&
          u.adminActive !== false,
      ),
  )

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Usuários</h1>
        <p className="text-sm text-gray-400">
          Gerencie usuários e promova admins de barbearia
        </p>
      </div>

      {/* Alerts */}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <AlertTriangleIcon size={16} />
          {fetchError}
        </div>
      )}
      {successMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          ✅ {successMsg}
        </div>
      )}
      {errorMsg && (
        <div className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          ❌ {errorMsg}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: "Total",
            value: users.length,
            icon: UsersIcon,
            color: "text-purple-400 bg-purple-500/10",
          },
          {
            label: "Admins",
            value: users.filter(
              (u) =>
                u.role === "ADMIN" &&
                !u.adminExpired &&
                u.adminActive !== false,
            ).length,
            icon: ShieldIcon,
            color: "text-blue-400 bg-blue-500/10",
          },
          {
            label: "Inativos",
            value: users.filter(
              (u) =>
                u.role === "ADMIN" &&
                (u.adminExpired || u.adminActive === false),
            ).length,
            icon: ShieldOffIcon,
            color: "text-red-400 bg-red-500/10",
          },
          {
            label: "Clientes",
            value: users.filter((u) => u.role === "CUSTOMER").length,
            icon: UsersIcon,
            color: "text-gray-400 bg-gray-700/30",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-3 rounded-xl border border-gray-800 bg-gray-900 p-4"
          >
            <div className={`rounded-lg p-2 ${s.color}`}>
              <s.icon size={16} />
            </div>
            <div>
              <p className="text-xl font-bold text-white">
                {loading ? "—" : s.value}
              </p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
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
      <div className="overflow-x-auto rounded-xl border border-gray-800 bg-gray-900">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-800 text-left text-xs text-gray-500">
              <th className="px-4 py-3 font-medium">Usuário</th>
              <th className="hidden px-4 py-3 font-medium md:table-cell">
                Role
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Barbearia
              </th>
              <th className="hidden px-4 py-3 font-medium lg:table-cell">
                Expira em
              </th>
              <th className="px-4 py-3 font-medium">Agend.</th>
              <th className="px-4 py-3 text-right font-medium">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  <td className="px-4 py-4" colSpan={6}>
                    <div className="h-8 animate-pulse rounded bg-gray-800" />
                  </td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-12 text-center text-gray-500"
                >
                  <UsersIcon className="mx-auto mb-2 h-8 w-8 opacity-30" />
                  Nenhum usuário encontrado
                </td>
              </tr>
            ) : (
              filtered.map((u) => {
                const isExpiredAdmin =
                  u.role === "ADMIN" &&
                  (u.adminExpired || u.adminActive === false)
                const isActiveAdmin = u.role === "ADMIN" && !isExpiredAdmin
                const isLoading = actionLoading?.startsWith(u.id)

                return (
                  <tr
                    key={u.id}
                    className={`transition-colors hover:bg-gray-800/50 ${isExpiredAdmin ? "opacity-60" : ""}`}
                  >
                    {/* Name */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="relative h-9 w-9 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                          {u.image ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={u.image}
                              alt={u.name ?? ""}
                              className="h-full w-full object-cover"
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
                          <p className="text-xs text-gray-500">{u.email}</p>
                          <div className="mt-0.5 md:hidden">{roleBadge(u)}</div>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="hidden px-4 py-3 md:table-cell">
                      {roleBadge(u)}
                    </td>

                    {/* Barbershop */}
                    <td className="hidden px-4 py-3 text-gray-400 lg:table-cell">
                      {u.managedShop ? (
                        <span className="text-sm">
                          {u.managedShop.barbershop.name}
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Expiry */}
                    <td className="hidden px-4 py-3 lg:table-cell">
                      {u.managedShop?.expiresAt ? (
                        <span
                          className={`flex items-center gap-1 text-xs ${isExpiredAdmin ? "text-red-400" : "text-gray-400"}`}
                        >
                          <ClockIcon size={12} />
                          {new Date(u.managedShop.expiresAt).toLocaleDateString(
                            "pt-BR",
                          )}
                          {isExpiredAdmin && " (expirado)"}
                        </span>
                      ) : u.role === "ADMIN" ? (
                        <span className="text-xs text-green-400">
                          Sem expiração
                        </span>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Bookings */}
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

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      {u.role === "SUPERADMIN" ? (
                        <span className="text-xs text-gray-600">
                          Superadmin
                        </span>
                      ) : (
                        <div className="flex items-center justify-end gap-1">
                          {isLoading ? (
                            <Loader2Icon
                              size={16}
                              className="animate-spin text-gray-400"
                            />
                          ) : (
                            <>
                              {/* Promote to Admin */}
                              {(u.role === "CUSTOMER" ||
                                u.role === "BARBER") && (
                                <button
                                  onClick={() => {
                                    setPromoteModal(u)
                                    setSelectedShopId("")
                                  }}
                                  title="Promover a Admin"
                                  className="rounded-lg p-1.5 text-blue-400 hover:bg-blue-500/10"
                                >
                                  <ShieldIcon size={15} />
                                </button>
                              )}

                              {/* Active admin actions */}
                              {isActiveAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRenewModal(u)
                                      setRenewExpiresAt("")
                                    }}
                                    title="Renovar acesso"
                                    className="rounded-lg p-1.5 text-green-400 hover:bg-green-500/10"
                                  >
                                    <RefreshCwIcon size={15} />
                                  </button>
                                  <button
                                    onClick={() => doAction(u.id, "deactivate")}
                                    title="Desativar admin"
                                    className="rounded-lg p-1.5 text-orange-400 hover:bg-orange-500/10"
                                  >
                                    <UserXIcon size={15} />
                                  </button>
                                  <button
                                    onClick={() => doAction(u.id, "demote")}
                                    title="Rebaixar para cliente"
                                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                                  >
                                    <ShieldOffIcon size={15} />
                                  </button>
                                </>
                              )}

                              {/* Expired/inactive admin actions */}
                              {isExpiredAdmin && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRenewModal(u)
                                      setRenewExpiresAt("")
                                    }}
                                    title="Reativar e renovar"
                                    className="rounded-lg p-1.5 text-green-400 hover:bg-green-500/10"
                                  >
                                    <UserCheckIcon size={15} />
                                  </button>
                                  <button
                                    onClick={() => doAction(u.id, "demote")}
                                    title="Rebaixar para cliente"
                                    className="rounded-lg p-1.5 text-red-400 hover:bg-red-500/10"
                                  >
                                    <ShieldOffIcon size={15} />
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Promote Modal */}
      {promoteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Promover a Admin</h2>
              <button
                onClick={() => setPromoteModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon size={20} />
              </button>
            </div>

            <p className="mb-4 text-sm text-gray-400">
              Promovendo:{" "}
              <span className="font-semibold text-white">
                {promoteModal.name ?? promoteModal.email}
              </span>
            </p>

            <div className="space-y-4">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Barbearia
                </label>
                <select
                  value={selectedShopId}
                  onChange={(e) => setSelectedShopId(e.target.value)}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
                >
                  <option value="">Selecionar barbearia...</option>
                  {availableShops.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                  {/* Also allow assigning any shop if already assigned to another */}
                  {barbershops
                    .filter((s) => !availableShops.some((a) => a.id === s.id))
                    .map((s) => (
                      <option key={s.id} value={s.id} className="text-gray-400">
                        {s.name} (já tem admin)
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-300">
                  Data de expiração{" "}
                  <span className="text-gray-500">
                    (opcional — deixe vazio para sem expiração)
                  </span>
                </label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setPromoteModal(null)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handlePromote}
                disabled={!selectedShopId || !!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2 text-sm font-semibold text-black hover:bg-yellow-400 disabled:opacity-60"
              >
                {actionLoading?.includes(promoteModal.id) ? (
                  <Loader2Icon size={15} className="animate-spin" />
                ) : (
                  <ShieldIcon size={15} />
                )}
                Promover
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Renew Modal */}
      {renewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-2xl border border-gray-700 bg-gray-900 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-white">Renovar Acesso</h2>
              <button
                onClick={() => setRenewModal(null)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon size={20} />
              </button>
            </div>

            <p className="mb-1 text-sm text-gray-400">
              Admin:{" "}
              <span className="font-semibold text-white">
                {renewModal.name ?? renewModal.email}
              </span>
            </p>
            {renewModal.managedShop && (
              <p className="mb-4 text-sm text-gray-400">
                Barbearia:{" "}
                <span className="text-yellow-400">
                  {renewModal.managedShop.barbershop.name}
                </span>
              </p>
            )}

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Nova data de expiração{" "}
                <span className="text-gray-500">(vazio = sem expiração)</span>
              </label>
              <input
                type="date"
                value={renewExpiresAt}
                onChange={(e) => setRenewExpiresAt(e.target.value)}
                min={new Date().toISOString().split("T")[0]}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2.5 text-sm text-white focus:border-yellow-500 focus:outline-none"
              />
            </div>

            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setRenewModal(null)}
                className="flex-1 rounded-lg border border-gray-700 py-2 text-sm text-gray-400 hover:bg-gray-800"
              >
                Cancelar
              </button>
              <button
                onClick={handleRenew}
                disabled={!!actionLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-green-600 py-2 text-sm font-semibold text-white hover:bg-green-500 disabled:opacity-60"
              >
                {actionLoading?.includes(renewModal.id) ? (
                  <Loader2Icon size={15} className="animate-spin" />
                ) : (
                  <RefreshCwIcon size={15} />
                )}
                Renovar acesso
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      <div className="rounded-lg border border-gray-800 bg-gray-900/50 p-4 text-xs text-gray-500">
        <p className="mb-2 font-semibold text-gray-400">Ações disponíveis:</p>
        <div className="grid grid-cols-2 gap-1 sm:grid-cols-3">
          <span className="flex items-center gap-1">
            <ShieldIcon size={12} className="text-blue-400" /> Promover a Admin
          </span>
          <span className="flex items-center gap-1">
            <RefreshCwIcon size={12} className="text-green-400" /> Renovar
            acesso
          </span>
          <span className="flex items-center gap-1">
            <UserXIcon size={12} className="text-orange-400" /> Desativar
            temporariamente
          </span>
          <span className="flex items-center gap-1">
            <UserCheckIcon size={12} className="text-green-400" /> Reativar
            admin expirado
          </span>
          <span className="flex items-center gap-1">
            <ShieldOffIcon size={12} className="text-red-400" /> Rebaixar para
            cliente
          </span>
        </div>
      </div>
    </div>
  )
}
