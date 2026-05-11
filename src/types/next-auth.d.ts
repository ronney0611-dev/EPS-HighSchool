import 'next-auth'
import 'next-auth/jwt'

declare module 'next-auth' {
  interface User {
    id: string
    isPaid: boolean
    paidUntil: Date | null
  }

  interface Session {
    user: {
      id: string
      email: string
      isPaid: boolean
      paidUntil: Date | null
    }
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    isPaid: boolean
    paidUntil: Date | null
  }
}