import { db } from "@/app/_lib/prisma"
import { PrismaAdapter } from "@auth/prisma-adapter"
import NextAuth, { NextAuthOptions } from "next-auth"
import { Adapter } from "next-auth/adapters"
import GoogleProvider from "next-auth/providers/google"
import CredentialsProvider from "next-auth/providers/credentials"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(db) as Adapter,
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Senha", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const user = await db.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) return null

        const bcrypt = await import("bcryptjs")
        const valid = await bcrypt.compare(credentials.password, user.password)
        if (!valid) return null

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
          role: user.role,
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ account }) {
      // Always allow sign-in; role assignment is handled in jwt callback
      void account
      return true
    },
    async jwt({ token, user, account, trigger }) {
      // On initial sign-in via credentials, user object is populated
      if (user) {
        token.role = (user as { role?: string }).role
        token.id = user.id
      }

      // Always refresh role from DB on first login OR on session update trigger
      // This covers: Google OAuth, credentials, and session refreshes
      if (account || trigger === "update" || !token.role) {
        if (token.email) {
          try {
            const dbUser = await db.user.findUnique({
              where: { email: token.email as string },
              include: { managedShop: true },
            })
            if (dbUser) {
              // Auto-deactivate expired admin
              if (
                dbUser.role === "ADMIN" &&
                dbUser.managedShop?.expiresAt &&
                new Date(dbUser.managedShop.expiresAt) < new Date()
              ) {
                await db.barbershopAdmin.update({
                  where: { userId: dbUser.id },
                  data: { active: false },
                })
                await db.barbershop.update({
                  where: { id: dbUser.managedShop.barbershopId },
                  data: { active: false },
                })
                token.role = "CUSTOMER"
              } else if (
                dbUser.role === "ADMIN" &&
                dbUser.managedShop?.active === false
              ) {
                token.role = "CUSTOMER"
              } else {
                token.role = dbUser.role
              }
              token.id = dbUser.id
            }
          } catch {
            // DB error — keep existing token values
          }
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        ;(session.user as { role?: string; id?: string }).role =
          token.role as string
        ;(session.user as { role?: string; id?: string }).id =
          token.id as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Allow same-origin and relative URLs as-is
      if (url.startsWith("/")) return `${baseUrl}${url}`
      if (url.startsWith(baseUrl)) return url
      return baseUrl
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
  secret: process.env.NEXTAUTH_SECRET,
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
