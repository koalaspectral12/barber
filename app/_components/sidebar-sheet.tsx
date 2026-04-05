"use client"

import { Button } from "./ui/button"
import {
  CalendarIcon,
  HomeIcon,
  LogInIcon,
  LogOutIcon,
  ShieldIcon,
  Loader2Icon,
  EyeIcon,
  EyeOffIcon,
} from "lucide-react"
import { SheetClose, SheetContent, SheetHeader, SheetTitle } from "./ui/sheet"
import { quickSearchOptions } from "../_constants/search"
import Link from "next/link"
import Image from "next/image"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog"
import { signIn, signOut, useSession } from "next-auth/react"
import { Avatar, AvatarImage } from "./ui/avatar"
import { useState } from "react"

const SidebarSheet = () => {
  const { data: session } = useSession()
  const handleGoogleLogin = () => signIn("google")
  const handleLogoutClick = () => signOut()

  const userRole = (session?.user as { role?: string })?.role
  const isAdmin = userRole === "ADMIN" || userRole === "SUPERADMIN"

  // Credentials login state
  const [loginDialogOpen, setLoginDialogOpen] = useState(false)
  const [loginTab, setLoginTab] = useState<"google" | "credentials">("google")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState("")

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginError("")
    setLoginLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setLoginError("Email ou senha incorretos.")
      } else {
        setLoginDialogOpen(false)
        setEmail("")
        setPassword("")
      }
    } catch {
      setLoginError("Erro ao fazer login.")
    } finally {
      setLoginLoading(false)
    }
  }

  return (
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="text-left">Menu</SheetTitle>
      </SheetHeader>

      {/* User section */}
      <div className="flex items-center justify-between gap-3 border-b border-solid py-5">
        {session?.user ? (
          <div className="flex items-center gap-2">
            <Avatar>
              <AvatarImage src={session.user.image ?? ""} />
            </Avatar>
            <div>
              <p className="font-bold">{session.user.name}</p>
              <p className="text-xs">{session.user.email}</p>
            </div>
          </div>
        ) : (
          <>
            <h2 className="font-bold">Olá, faça seu login!</h2>
            <Dialog open={loginDialogOpen} onOpenChange={setLoginDialogOpen}>
              <DialogTrigger asChild>
                <Button size="icon">
                  <LogInIcon />
                </Button>
              </DialogTrigger>
              <DialogContent className="w-[90%]">
                <DialogHeader>
                  <DialogTitle>Faça login na plataforma</DialogTitle>
                  <DialogDescription>
                    Escolha como deseja entrar.
                  </DialogDescription>
                </DialogHeader>

                {/* Tab selector */}
                <div className="flex gap-2 rounded-lg border border-solid p-1">
                  <button
                    onClick={() => setLoginTab("google")}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${loginTab === "google" ? "bg-primary text-primary-foreground" : "text-gray-400 hover:text-white"}`}
                  >
                    Google
                  </button>
                  <button
                    onClick={() => setLoginTab("credentials")}
                    className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${loginTab === "credentials" ? "bg-primary text-primary-foreground" : "text-gray-400 hover:text-white"}`}
                  >
                    Email e senha
                  </button>
                </div>

                {loginTab === "google" ? (
                  <Button
                    variant="outline"
                    className="gap-2 font-bold"
                    onClick={handleGoogleLogin}
                  >
                    <Image
                      alt="Google"
                      src="/google.svg"
                      width={18}
                      height={18}
                    />
                    Entrar com Google
                  </Button>
                ) : (
                  <form onSubmit={handleCredentialsLogin} className="space-y-3">
                    {loginError && (
                      <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                        {loginError}
                      </div>
                    )}
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Email
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                        placeholder="seu@email.com"
                      />
                    </div>
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        Senha
                      </label>
                      <div className="relative">
                        <input
                          type={showPass ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          required
                          className="w-full rounded-lg border border-gray-700 bg-gray-800 px-3 py-2 pr-9 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                          placeholder="••••••••"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPass(!showPass)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                        >
                          {showPass ? (
                            <EyeOffIcon size={15} />
                          ) : (
                            <EyeIcon size={15} />
                          )}
                        </button>
                      </div>
                    </div>
                    <Button
                      type="submit"
                      className="w-full"
                      disabled={loginLoading}
                    >
                      {loginLoading && (
                        <Loader2Icon size={15} className="mr-2 animate-spin" />
                      )}
                      {loginLoading ? "Entrando..." : "Entrar"}
                    </Button>
                  </form>
                )}
              </DialogContent>
            </Dialog>
          </>
        )}
      </div>

      {/* Navigation */}
      <div className="flex flex-col gap-2 border-b border-solid py-5">
        <SheetClose asChild>
          <Button className="justify-start gap-2" variant="ghost" asChild>
            <Link href="/">
              <HomeIcon size={18} />
              Início
            </Link>
          </Button>
        </SheetClose>

        {session?.user && (
          <SheetClose asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href="/bookings">
                <CalendarIcon size={18} />
                Agendamentos
              </Link>
            </Button>
          </SheetClose>
        )}

        {isAdmin && (
          <SheetClose asChild>
            <Button
              className="justify-start gap-2 text-yellow-500 hover:text-yellow-400"
              variant="ghost"
              asChild
            >
              <Link href="/admin">
                <ShieldIcon size={18} />
                Administrador
              </Link>
            </Button>
          </SheetClose>
        )}
      </div>

      {/* Quick search */}
      <div className="flex flex-col gap-2 border-b border-solid py-5">
        {quickSearchOptions.map((option) => (
          <SheetClose key={option.title} asChild>
            <Button className="justify-start gap-2" variant="ghost" asChild>
              <Link href={`/barbershops?service=${option.title}`}>
                <Image
                  alt={option.title}
                  src={option.imageUrl}
                  height={18}
                  width={18}
                />
                {option.title}
              </Link>
            </Button>
          </SheetClose>
        ))}
      </div>

      {/* Logout */}
      {session?.user && (
        <div className="flex flex-col gap-2 py-5">
          <Button
            variant="ghost"
            className="justify-start gap-2"
            onClick={handleLogoutClick}
          >
            <LogOutIcon size={18} />
            Sair da conta
          </Button>
        </div>
      )}
    </SheetContent>
  )
}

export default SidebarSheet
