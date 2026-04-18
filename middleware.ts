import { withAuth } from "next-auth/middleware"
import { NextResponse } from "next/server"

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token
    const pathname = req.nextUrl.pathname

    if (pathname.startsWith("/admin")) {
      const role = token?.role as string | undefined
      if (!role || !["ADMIN", "SUPERADMIN"].includes(role)) {
        const loginUrl = new URL("/auth/signin", req.url)
        loginUrl.searchParams.set("callbackUrl", pathname)
        return NextResponse.redirect(loginUrl)
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      // Always run the middleware function above for matched routes
      authorized: () => true,
    },
    pages: {
      signIn: "/auth/signin",
    },
  },
)

export const config = {
  matcher: ["/admin/:path*"],
}
