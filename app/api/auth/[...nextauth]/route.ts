import NextAuth, { NextAuthOptions, DefaultSession, User as NextAuthUser, Session } from 'next-auth'
import { JWT } from 'next-auth/jwt'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/app/lib/mongo'
import User from '@/app/models/User'

// 💡 Type declarations matching your IUser schema exactly
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      isPaid: boolean;
      paidUntil: string | Date | null;
      role: 'user' | 'admin';
    } & DefaultSession["user"]
  }

  interface User {
    id: string;
    isPaid: boolean;
    paidUntil: string | Date | null;
    role: 'user' | 'admin';
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    isPaid: boolean;
    paidUntil: string | Date | null;
    role: 'user' | 'admin';
  }
}

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
        }
      }
    })
  ],
  callbacks: {
    // 🔒 Strictly typed arguments, zero 'any' allowed
    async jwt({ token, user }: { token: JWT; user?: NextAuthUser }) {
      if (user) {
        token.id = user.id
        token.role = user.role;
        token.isPaid = user.isPaid
        token.paidUntil = user.paidUntil
        token.role = user.role 
      }
      return token
    },
    async session({ session, token }: { session: Session; token: JWT }) {
      if (session.user) {
        session.user.id = token.id
        session.user.role = token.role;
        session.user.isPaid = token.isPaid
        session.user.paidUntil = token.paidUntil
        session.user.role = token.role 
      }
      return session
    }
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }