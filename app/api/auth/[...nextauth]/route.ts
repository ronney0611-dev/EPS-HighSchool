import NextAuth, { NextAuthOptions, DefaultSession, User as NextAuthUser, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/app/lib/mongo'
import User from '@/app/models/User'

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPaid: boolean;
      paidUntil: string | Date | null;
      role: 'user' | 'admin';
      level: 'lycee' | 'cem' | 'primaire';
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    isPaid: boolean;
    paidUntil: string | Date | null;
    role: 'user' | 'admin';
    level: 'lycee' | 'cem' | 'primaire';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPaid: boolean;
    paidUntil: string | Date | null;
    role: 'user' | 'admin';
    level: 'lycee' | 'cem' | 'primaire';
    isPaidCheckedAt?: number;
  }
}

const ISPAID_REVALIDATE_SECONDS = 5 * 60;

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null
        await connectDB()
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null
        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          isPaid: user.isPaid,
          paidUntil: user.paidUntil,
          role: user.role,
          level: user.level,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user, trigger }: { token: JWT; user?: NextAuthUser; trigger?: "signIn" | "signUp" | "update" }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.isPaid = user.isPaid
        token.paidUntil = user.paidUntil
        token.level = user.level
        token.isPaidCheckedAt = Math.floor(Date.now() / 1000)
        return token
      }

      const checkedAt = token.isPaidCheckedAt ?? 0
      const now = Math.floor(Date.now() / 1000)
      const isStale = now - checkedAt > ISPAID_REVALIDATE_SECONDS

      if (trigger === 'update' || isStale) {
        await connectDB()
        const dbUser = await User.findById(token.id).select('isPaid paidUntil').lean()
        if (dbUser) {
          token.isPaid = dbUser.isPaid
          token.paidUntil = dbUser.paidUntil
          token.isPaidCheckedAt = now
        }
      }

      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.isPaid = token.isPaid
        session.user.paidUntil = token.paidUntil
        session.user.level = token.level
      }
      return session
    }
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }