import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function proxy(request: NextRequest) {
    // 1. Fetch the exact token from Next-Auth
    const token = await getToken({ 
        req: request, 
        secret: process.env.NEXTAUTH_SECRET 
    })
    
    const { pathname } = request.nextUrl

    // 2. Define all routes that require an absolute active session
    const protectedPaths = ['/profile', '/manage-profile', '/dashboard', '/documents']
    const isProtected = protectedPaths.some(path => pathname.startsWith(path))

    // 3. If a user tries to access a protected path without a token, throw them to login
    if (isProtected && !token) {
        const loginUrl = new URL('/login', request.url)
        // Pass the page they were trying to visit so they can come back later
        loginUrl.searchParams.set('callbackUrl', pathname) 
        
        const response = NextResponse.redirect(loginUrl)
        response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
        return response
    }

    // 4. Force browser to check proxy status on every single page navigation change
    const response = NextResponse.next()
    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
    response.headers.set('x-middleware-cache', 'no-cache')
    return response
}

export const config = {
    matcher: [
        '/profile/:path*', 
        '/manage-profile/:path*',
        '/dashboard/:path*',
        '/documents/:path*'
    ]
}