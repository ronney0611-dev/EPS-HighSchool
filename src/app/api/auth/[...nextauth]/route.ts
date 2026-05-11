import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { connectDB } from '@/src/lib/mongo'
import User from '@/src/models/User'


const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        await connectDB();
        const user = await User.findOne({ email: credentials.email })
        if (!user) return null

        const isValid = await bcrypt.compare(credentials.password, user.password)
        if (!isValid) return null

        return {
          id: user._id.toString(),
          email: user.email,
          isPaid: user.isPaid,
          paidUntil: user.paidUntil,
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.isPaid = (user).isPaid
        token.paidUntil = (user).paidUntil
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.isPaid = token.isPaid as boolean
        session.user.paidUntil = token.paidUntil as Date
      }
      return session
    }
  },
  session: { strategy: 'jwt' },
  pages: { signIn: '/login' }
})

export { handler as GET, handler as POST }