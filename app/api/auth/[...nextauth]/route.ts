export const dynamic = "force-dynamic"

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

        try {
          const user = await db.user.findUnique({
            where: { email: credentials.email },
          })

          if (!user || !user.password) return null

          const bcrypt = await import("bcryptjs")
          const valid = await bcrypt.compare(
            credentials.password,
            user.password,
          )
          if (!valid) return null

          return {
            id: user.id,
            name: user.name,
            email: user.email,
            image: user.image,
            role: user.role,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === "google" && user.email) {
        try {
          const dbUser = await db.user.findUnique({
            where: { email: user.email },
          })
          if (dbUser && !dbUser.role) {
            await db.user.update({
              where: { email: user.email },
              data: { role: "CUSTOMER" },
            })
          }
        } catch {
          // ignore
        }
      }
      return true
    },

    async jwt({ token, user }) {
      // On first sign in from credentials, set role from the returned user object
      if (user) {
        token.id = user.id
        // Cast to get role field set by authorize()
        const roleFromUser = (user as { role?: string }).role
        if (roleFromUser) {
          token.role = roleFromUser
        }
      }

      // Always reload role from DB to keep it fresh
      if (token.email) {
        try {
          // Simple query first — just get role without relations
          const dbUser = await db.user.findUnique({
            where: { email: token.email as string },
            select: { id: true, role: true },
          })

          if (dbUser) {
            token.id = dbUser.id
            // Check if admin is still active
            if (dbUser.role === "ADMIN") {
              try {
                const adminRecord = await db.barbershopAdmin.findUnique({
                  where: { userId: dbUser.id },
                  select: { active: true, expiresAt: true, barbershopId: true },
                })
                if (adminRecord) {
                  const expired =
                    adminRecord.expiresAt &&
                    new Date(adminRecord.expiresAt) < new Date()
                  const inactive = adminRecord.active === false

                  if (expired || inactive) {
                    token.role = "CUSTOMER"
                  } else {
                    token.role = dbUser.role
                  }
                } else {
                  // No BarbershopAdmin record — demote to customer
                  token.role = "CUSTOMER"
                }
              } catch {
                // BarbershopAdmin table or columns may not exist yet — keep role from DB
                token.role = dbUser.role
              }
            } else {
              token.role = dbUser.role
            }
          }
        } catch {
          // DB unavailable — keep whatever role is already in the token
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
      // Allow relative URLs — honour callbackUrl
      if (url.startsWith("/")) {
        return `${baseUrl}${url}`
      }
      // Allow same-origin (includes /admin)
      if (url.startsWith(baseUrl)) {
        return url
      }
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
