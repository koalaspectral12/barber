"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LayoutDashboardIcon,
  ScissorsIcon,
  CalendarIcon,
  UsersIcon,
  SparklesIcon,
  MenuIcon,
  XIcon,
  ChevronRightIcon,
} from "lucide-react"
import { useState } from "react"

const navItems = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboardIcon,
  },
  {
    href: "/admin/barbershops",
    label: "Barbearias",
    icon: ScissorsIcon,
  },
  {
    href: "/admin/services",
    label: "Serviços",
    icon: SparklesIcon,
  },
  {
    href: "/admin/bookings",
    label: "Agendamentos",
    icon: CalendarIcon,
  },
  {
    href: "/admin/users",
    label: "Usuários",
    icon: UsersIcon,
  },
]

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-950 text-white">
      {/* Sidebar Desktop */}
      <aside className="hidden w-64 flex-col border-r border-gray-800 bg-gray-900 md:flex">
        <div className="flex h-16 items-center gap-3 border-b border-gray-800 px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
            <ScissorsIcon className="h-4 w-4 text-black" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">FSW Barber</p>
            <p className="text-xs text-gray-400">Painel Admin</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              item.href === "/admin"
                ? pathname === "/admin"
                : pathname.startsWith(item.href)
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                  isActive
                    ? "bg-yellow-500/10 text-yellow-400"
                    : "text-gray-400 hover:bg-gray-800 hover:text-white"
                }`}
              >
                <Icon className="h-4 w-4" />
                {item.label}
                {isActive && (
                  <ChevronRightIcon className="ml-auto h-3 w-3 text-yellow-400" />
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-gray-800 p-4">
          <Link
            href="/"
            className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300"
          >
            ← Voltar para o site
          </Link>
        </div>
      </aside>

      {/* Sidebar Mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="absolute left-0 top-0 flex h-full w-64 flex-col border-r border-gray-800 bg-gray-900">
            <div className="flex h-16 items-center justify-between border-b border-gray-800 px-6">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-yellow-500">
                  <ScissorsIcon className="h-4 w-4 text-black" />
                </div>
                <p className="text-sm font-bold">FSW Admin</p>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="text-gray-400 hover:text-white"
              >
                <XIcon className="h-5 w-5" />
              </button>
            </div>
            <nav className="flex-1 space-y-1 p-4">
              {navItems.map((item) => {
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
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                )
              })}
            </nav>
            <div className="border-t border-gray-800 p-4">
              <Link
                href="/"
                className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300"
              >
                ← Voltar para o site
              </Link>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Top bar mobile */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-800 bg-gray-900 px-4 md:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-gray-400 hover:text-white"
          >
            <MenuIcon className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500">
              <ScissorsIcon className="h-3.5 w-3.5 text-black" />
            </div>
            <p className="text-sm font-bold">FSW Admin</p>
          </div>
        </header>

        <main className="flex-1 overflow-auto">{children}</main>
      </div>
    </div>
  )
}
