"use client"

import { Suspense, useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
// ... imports de ícones

// Componente interno com useSearchParams
function SignInForm() {
  const searchParams = useSearchParams()  // aqui dentro do Suspense
  const callbackUrl = searchParams.get("callbackUrl") || "/admin"
  // ... resto do form
}

// Página exportada com Suspense obrigatório
export default function SignInPage() {
  return (
    <div className="...">
      {/* Logo */}
      <Suspense fallback={<div>Carregando...</div>}>
        <SignInForm />
      </Suspense>
    </div>
  )
}
