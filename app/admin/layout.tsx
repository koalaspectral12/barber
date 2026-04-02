"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  LayoutDashboardIcon,
  ScissorsIcon,
  CalendarIcon,
  UsersIcon,
  SparklesIcon,
  MenuIcon,
  XIcon,
  ChevronRightIcon,
  UserCogIcon,
  ShieldCheckIcon,
  SettingsIcon,
  CreditCardIcon,
  LogOutIcon,
} from "lucide-react"
import { useState, useEffect } from "react"
import { signOut, useSession } from "next-auth/react"

interface AdminMe {
  id: string
  name: string | null
  email: string
  role: string
  barbershopId: string | null
  barbershop: { id: string; name: string; imageUrl: string } | null
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session, status } = useSession()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [me, setMe] = useState<AdminMe | null>(null)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/signin?callbackUrl=/admin")
      return
    }
    if (status === "authenticated") {
      fetch("/api/admin/me")
        .then((r) => r.json())
        .then((data) => {
          if (data.error) {
            router.push("/auth/signin?callbackUrl=/admin")
          } else {
            setMe(data)
          }
        })
        .catch(() => router.push("/auth/signin?callbackUrl=/admin"))
    }
  }, [status, router])

  const isSuperAdmin = me?.role === "SUPERADMIN"

  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboardIcon, always: true },
    { href: "/admin/barbershops", label: "Barbearias", icon: ScissorsIcon, always: true },
    { href: "/admin/services", label: "Serviços", icon: SparklesIcon, always: true },
    { href: "/admin/bookings", label: "Agendamentos", icon: CalendarIcon, always: true },
    { href: "/admin/payment", label: "Pagamento", icon: CreditCardIcon, always: true },
    { href: "/admin/barbers", label: "Barbeiros", icon: UserCogIcon, superOnly: true },
    { href: "/admin/admins", label: "Admins", icon: ShieldCheckIcon, superOnly: true },
    { href: "/admin/users", label: "Clientes", icon: UsersIcon, superOnly: true },
    { href: "/admin/settings", label: "Configurações", icon: SettingsIcon, superOnly: true },
  ].filter((item) => item.always || (item.superOnly && isSuperAdmin))

  if (status === "loading" || !me) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-yellow-500 border-t-transparent" />
          <p className="text-sm text-gray-400">Carregando...</p>
        </div>
      </div>
    )
  }

  const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
    const Icon = item.icon
    const isActive =
      item.href === "/admin"
        ? pathname === "/admin"
        : pathname.startsWith(item.href)
    return (
      <Link
        key={item.href}
        href={item.href}
        onClick={() => setSidebarOpen(false)}
        className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
          isActive
            ? "bg-yellow-500/10 text-yellow-400"
            : "text-gray-400 hover:bg-gray-800 hover:text-white"
        }`}
      >
        <Icon className="h-4 w-4 flex-shrink-0" />
        {item.label}
        {isActive && <ChevronRightIcon className="ml-auto h-3 w-3 text-yellow-400" />}
      </Link>
    )
  }

  const SidebarContent = () => (
    <>
      <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
          <ScissorsIcon className="h-4 w-4 text-black" />
        </div>
        <div>
          <p className="text-sm font-bold text-white">Barberon</p>
          <p className="text-xs text-gray-400">
            {isSuperAdmin ? "Super Admin" : "Painel Admin"}
          </p>
        </div>
      </div>

      {/* Info do admin */}
      <div className="border-b border-gray-800 px-4 py-3">
        <p className="truncate text-xs font-medium text-white">{me?.name || me?.email}</p>
        {me?.barbershop && (
          <p className="truncate text-xs text-yellow-400">{me.barbershop.name}</p>
        )}
        {isSuperAdmin && (
          <span className="mt-1 inline-block rounded-full bg-yellow-500/20 px-2 py-0.5 text-xs text-yellow-400">
            Superadmin
          </span>
        )}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-4">
        {navItems.map((item) => (
          <NavLink key={item.href} item={item} />
        ))}
      </nav>

      <div className="border-t border-gray-800 p-4 space-y-2">
        <Link href="/" className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300">
          ← Voltar ao site
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/auth/signin" })}
          className="flex items-center gap-2 text-xs text-red-400 hover:text-red-300"
        >
          <LogOutIcon className="h-3 w-3" />
          Sair
        </button>
      </div>
    </>
  )

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-900 md:flex">
        <SidebarContent />
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-gray-800 bg-gray-900">
            <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
                  <ScissorsIcon className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm font-bold">Barberon</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-gray-400 hover:text-white">
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 md:hidden">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-400 hover:text-white">
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500">
              <ScissorsIcon className="h-3.5 w-3.5 text-black" />
            </div>
            <p className="text-sm font-bold">Barberon</p>
          </div>
        </header>
        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
