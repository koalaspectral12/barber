import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    // Se for rota do admin e o usuário não for admin/superadmin
    if (pathname.startsWith("/admin")) {
      const role = token?.role as string | undefined
      if (!role || !["ADMIN", "SUPERADMIN"].includes(role)) {
        return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/admin", req.url))
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: ["/admin/:path*"],
}
