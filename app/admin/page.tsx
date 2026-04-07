"use client"

import { useEffect, useState } from "react"
import {
  ScissorsIcon,
  SparklesIcon,
  CalendarIcon,
  UsersIcon,
  TrendingUpIcon,
  ClockIcon,
  UserCogIcon,
  ShieldCheckIcon,
} from "lucide-react"

interface Stats {
  totalBarbershops: number
  totalServices: number
  totalBookings: number
  totalUsers: number
  totalBarbers: number
  totalAdmins: number
  upcomingBookings: number
  recentBookings: Array<{
    id: string
    date: string
    user: { name: string; email: string; image: string | null }
    service: {
      name: string
      price: string
      barbershop: { name: string }
    }
  }>
}

const statCards = [
  {
    key: "totalBarbershops" as keyof Stats,
    label: "Barbearias",
    icon: ScissorsIcon,
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
  },
  {
    key: "totalBarbers" as keyof Stats,
    label: "Barbeiros",
    icon: UserCogIcon,
    color: "text-orange-400",
    bg: "bg-orange-500/10",
  },
  {
    key: "totalAdmins" as keyof Stats,
    label: "Admins",
    icon: ShieldCheckIcon,
    color: "text-blue-400",
    bg: "bg-blue-500/10",
  },
  {
    key: "totalBookings" as keyof Stats,
    label: "Agendamentos",
    icon: CalendarIcon,
    color: "text-green-400",
    bg: "bg-green-500/10",
  },
  {
    key: "totalServices" as keyof Stats,
    label: "Serviços",
    icon: SparklesIcon,
    color: "text-pink-400",
    bg: "bg-pink-500/10",
  },
  {
    key: "totalUsers" as keyof Stats,
    label: "Clientes",
    icon: UsersIcon,
    color: "text-purple-400",
    bg: "bg-purple-500/10",
  },
]

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [fetchError, setFetchError] = useState("")

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((data) => {
        if (data?.error) {
          setFetchError(data.error)
        } else {
          setStats(data)
        }
        setLoading(false)
      })
      .catch(() => {
        setFetchError("Não foi possível conectar ao banco de dados")
        setLoading(false)
      })
  }, [])

  return (
    <div className="space-y-8 p-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-400">
          Visão geral do sistema Barberon
        </p>
      </div>

      {/* DB Error Banner */}
      {fetchError && (
        <div className="flex items-center gap-3 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <span className="text-lg">⚠️</span>
          <div>
            <p className="font-medium">Banco de dados indisponível</p>
            <p className="text-xs text-red-400/70">{fetchError}</p>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map(({ key, label, icon: Icon, color, bg }) => (
          <div
            key={key}
            className="rounded-xl border border-gray-800 bg-gray-900 p-5"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-400">{label}</p>
              <div className={`rounded-lg p-2 ${bg}`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <p className="mt-3 text-3xl font-bold text-white">
              {loading ? (
                <span className="inline-block h-8 w-16 animate-pulse rounded bg-gray-800" />
              ) : (
                ((stats?.[key] as number) ?? 0)
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Upcoming Bookings Banner */}
      <div className="flex items-center gap-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-5">
        <div className="rounded-lg bg-yellow-500/10 p-3">
          <TrendingUpIcon className="h-5 w-5 text-yellow-400" />
        </div>
        <div>
          <p className="font-semibold text-white">Agendamentos futuros</p>
          <p className="text-sm text-gray-400">
            {loading ? (
              <span className="inline-block h-4 w-24 animate-pulse rounded bg-gray-800" />
            ) : (
              <>
                <span className="font-bold text-yellow-400">
                  {stats?.upcomingBookings ?? 0}
                </span>{" "}
                agendamento(s) a partir de hoje
              </>
            )}
          </p>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className="rounded-xl border border-gray-800 bg-gray-900">
        <div className="flex items-center gap-2 border-b border-gray-800 px-6 py-4">
          <ClockIcon className="h-4 w-4 text-gray-400" />
          <h2 className="font-semibold text-white">Agendamentos Recentes</h2>
        </div>

        {loading ? (
          <div className="space-y-4 p-6">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-14 animate-pulse rounded-lg bg-gray-800"
              />
            ))}
          </div>
        ) : stats?.recentBookings?.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            Nenhum agendamento encontrado
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {stats?.recentBookings?.map((booking) => (
              <div
                key={booking.id}
                className="flex items-center gap-4 px-6 py-4"
              >
                {/* Avatar */}
                <div className="relative h-10 w-10 flex-shrink-0 overflow-hidden rounded-full bg-gray-800">
                  {booking.user.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={booking.user.image}
                      alt={booking.user.name ?? ""}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-xs text-gray-400">
                      {booking.user.name?.charAt(0).toUpperCase() ?? "?"}
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-white">
                    {booking.user.name ?? booking.user.email}
                  </p>
                  <p className="truncate text-xs text-gray-400">
                    {booking.service.name} — {booking.service.barbershop.name}
                  </p>
                </div>

                {/* Date + Price */}
                <div className="text-right">
                  <p className="text-sm font-semibold text-yellow-400">
                    {Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(Number(booking.service.price))}
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(booking.date).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
