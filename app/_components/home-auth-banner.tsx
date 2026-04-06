"use client"

import { useSession, signIn } from "next-auth/react"
import { Button } from "./ui/button"
import { LogInIcon, UserPlusIcon } from "lucide-react"
import Link from "next/link"

export default function HomeAuthBanner() {
  const { data: session, status } = useSession()

  if (status === "loading" || session?.user) return null

  return (
    <div className="mt-5 flex items-center gap-3 rounded-xl border border-dashed border-gray-700 bg-gray-900/60 p-4">
      <div className="flex-1">
        <p className="text-sm font-semibold text-white">
          Faça login para agendar
        </p>
        <p className="text-xs text-gray-400">
          Entre ou crie sua conta gratuitamente.
        </p>
      </div>
      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-1 text-xs"
          onClick={() => signIn()}
        >
          <LogInIcon size={13} />
          Entrar
        </Button>
        <Button size="sm" className="gap-1 text-xs" asChild>
          <Link href="/auth/signin?tab=register">
            <UserPlusIcon size={13} />
            Cadastrar
          </Link>
        </Button>
      </div>
    </div>
  )
}
