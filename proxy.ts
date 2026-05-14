import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    
    const isProtected = ['/profile', '/manage-profile'].some(path => 
        request.nextUrl.pathname.startsWith(path)
    )

    if (isProtected && !token) {
        return NextResponse.redirect(new URL('/login', request.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/profile/:path*', '/manage-profile/:path*']
}