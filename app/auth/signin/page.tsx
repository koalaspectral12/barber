"use client"

export const dynamic = "force-dynamic"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  ScissorsIcon,
  Loader2Icon,
  EyeIcon,
  EyeOffIcon,
  UserPlusIcon,
} from "lucide-react"
import Image from "next/image"

function SignInForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"

  const [tab, setTab] = useState<"signin" | "register">("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })
      if (result?.error) {
        setError("Email ou senha incorretos.")
      } else {
        router.push(callbackUrl)
      }
    } catch {
      setError("Erro ao tentar fazer login.")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || "Erro ao criar conta")
      } else {
        setSuccessMsg("Conta criada! Fazendo login...")
        const result = await signIn("credentials", {
          email,
          password,
          redirect: false,
        })
        if (result?.error) {
          setError("Conta criada, mas erro ao fazer login. Tente entrar.")
          setSuccessMsg("")
          setTab("signin")
        } else {
          router.push("/")
        }
      }
    } catch {
      setError("Erro de conexão.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
      {/* Tabs */}
      <div className="mb-6 flex gap-2 rounded-lg border border-gray-800 p-1">
        <button
          onClick={() => {
            setTab("signin")
            setError("")
            setSuccessMsg("")
          }}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            tab === "signin"
              ? "bg-yellow-500 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Entrar
        </button>
        <button
          onClick={() => {
            setTab("register")
            setError("")
            setSuccessMsg("")
          }}
          className={`flex-1 rounded-md py-1.5 text-sm font-medium transition-colors ${
            tab === "register"
              ? "bg-yellow-500 text-black"
              : "text-gray-400 hover:text-white"
          }`}
        >
          Criar conta
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {error}
        </div>
      )}
      {successMsg && (
        <div className="mb-4 rounded-lg border border-green-500/20 bg-green-500/10 px-4 py-3 text-sm text-green-400">
          {successMsg}
        </div>
      )}

      {tab === "signin" ? (
        <>
          {/* Google */}
          <button
            onClick={() => signIn("google", { callbackUrl: "/" })}
            className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-700 bg-gray-800 py-2.5 text-sm font-medium text-white transition hover:bg-gray-700"
          >
            <Image alt="Google" src="/google.svg" width={18} height={18} />
            Entrar com Google
          </button>

          <div className="mb-4 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-700" />
            <span className="text-xs text-gray-500">ou</span>
            <div className="h-px flex-1 bg-gray-700" />
          </div>

          <form onSubmit={handleCredentialsLogin} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Email
              </label>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="seu@email.com"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-300">
                Senha
              </label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                >
                  {showPass ? (
                    <EyeOffIcon className="h-4 w-4" />
                  ) : (
                    <EyeIcon className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
            >
              {loading && <Loader2Icon className="h-4 w-4 animate-spin" />}
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </form>
        </>
      ) : (
        /* Register */
        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Nome completo
            </label>
            <input
              type="text"
              autoComplete="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="Seu nome"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
              placeholder="seu@email.com"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Senha
            </label>
            <div className="relative">
              <input
                type={showPass ? "text" : "password"}
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full rounded-lg border border-gray-700 bg-gray-800 px-4 py-2.5 pr-10 text-sm text-white placeholder-gray-500 focus:border-yellow-500 focus:outline-none"
                placeholder="Mínimo 6 caracteres"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
              >
                {showPass ? (
                  <EyeOffIcon className="h-4 w-4" />
                ) : (
                  <EyeIcon className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-yellow-500 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-yellow-400 disabled:opacity-60"
          >
            {loading ? (
              <Loader2Icon className="h-4 w-4 animate-spin" />
            ) : (
              <UserPlusIcon className="h-4 w-4" />
            )}
            {loading ? "Criando conta..." : "Criar conta grátis"}
          </button>
          <p className="text-center text-xs text-gray-500">
            Ao criar conta você concorda com os termos de uso.
          </p>
        </form>
      )}

      <div className="mt-6 border-t border-gray-800 pt-4 text-center">
        <a href="/" className="text-xs text-yellow-400 hover:underline">
          ← Voltar ao site
        </a>
      </div>
    </div>
  )
}

function SignInSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-800 bg-gray-900 p-8">
      <div className="space-y-4">
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-800" />
        <div className="h-10 w-full animate-pulse rounded-lg bg-gray-800" />
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-950 px-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-yellow-500">
            <ScissorsIcon className="h-8 w-8 text-black" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white">Barberon</h1>
            <p className="text-sm text-gray-400">Entre ou crie sua conta</p>
          </div>
        </div>
        <Suspense fallback={<SignInSkeleton />}>
          <SignInForm />
        </Suspense>
      </div>
    </div>
  )
}
