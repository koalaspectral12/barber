export const dynamic = "force-dynamic"

import { Suspense } from "react"
import { ScissorsIcon } from "lucide-react"
import SignInForm from "./_components/signin-form"

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
