import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const REFRESH_TIMEOUT_MS = 3000

export const config = {
    matcher: [
        '/login',
        '/profile/:path*',
        '/manage-profile/:path*',
        '/dashboard/:path*',
        '/documents/:path*',
    ],
}

export async function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl

    if (pathname.startsWith('/api/auth')) {
        return NextResponse.next()
    }

    const token = await getToken({
        req: request,
        secret: process.env.NEXTAUTH_SECRET,
    })

    // /documents root is public for everyone (listing page)
    // only sub-paths require auth + subscription
    const isDocumentSubPath =
        pathname.startsWith('/documents/') &&
        pathname.length > '/documents/'.length

    const isProtected =
        pathname.startsWith('/profile') ||
        pathname.startsWith('/manage-profile') ||
        pathname.startsWith('/dashboard') ||
        isDocumentSubPath  // /documents root excluded — it's public

    // [GATE 1] Auth check — redirect anonymous users to /login
    if (isProtected && !token) {
        console.log(`[PROXY OUTCOME] 🛑 Anonymous -> /login from ${pathname}`)
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // [GATE 2] Subscription check — only for /documents sub-paths
    if (isDocumentSubPath && token) {
        console.log(`\n--- 🔍 PROXY LIVE CHECK FOR PATH: ${pathname} ---`)
        console.log(`[USER TOKEN] ID: ${token.id ?? token.sub} | Email: ${token.email}`)

        const host = request.headers.get('host') ?? 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const refreshUrl = `${protocol}://${host}/api/auth/refresh`

        console.log(`[FETCHING DB STATUS] Pinging: ${refreshUrl}`)

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), REFRESH_TIMEOUT_MS)

        try {
            const dbRes = await fetch(refreshUrl, {
                method: 'GET',
                headers: {
                    cookie: request.headers.get('cookie') ?? '',
                    'Cache-Control': 'no-cache, no-store, must-revalidate',
                    'Pragma': 'no-cache',
                },
                cache: 'no-store',
                signal: controller.signal,
            })

            clearTimeout(timeoutId)

            console.log(`[DB RESPONSE STATUS] HTTP Code: ${dbRes.status}`)

            if (dbRes.ok) {
                const data = await dbRes.json()
                console.log(`[DB RAW DATA RECEIVED]:`, JSON.stringify(data))

                const isPaid = data.isPaid === true
                const paidUntilVal: string | null = data.paidUntil ?? null
                const isAdmin = data.role === 'admin'

                const isExpired = isAdmin
                    ? false
                    : paidUntilVal === null || new Date(paidUntilVal) < new Date()

                console.log(`[EVALUATION LOGIC]:`)
                console.log(` -> isPaid === true? ${isPaid}`)
                console.log(` -> paidUntil: ${paidUntilVal}`)
                console.log(` -> isAdmin? ${isAdmin}`)
                console.log(` -> Is Subscription Expired? ${isExpired}`)

                if (!isPaid || isExpired) {
                    console.log(`[PROXY OUTCOME] ❌ ACCESS DENIED -> /payment`)
                    const paymentUrl = new URL('/payment', request.url)
                    paymentUrl.searchParams.set('callbackUrl', pathname)
                    const response = NextResponse.redirect(paymentUrl)
                    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
                    response.headers.set('Pragma', 'no-cache')
                    response.headers.set('Expires', '0')
                    return response
                }

                console.log(`[PROXY OUTCOME] ✅ ACCESS GRANTED.`)
                const response = NextResponse.next()
                response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
                return response

            } else {
                const errorText = await dbRes.text().catch(() => 'No text body')
                console.error(`[PROXY OUTCOME] 🛑 Refresh API non-200. Body: ${errorText}`)
                return NextResponse.redirect(new URL('/error?reason=server_error', request.url))
            }

        } catch (error) {
            clearTimeout(timeoutId)
            const isTimeout = error instanceof Error && error.name === 'AbortError'
            console.error(
                isTimeout
                    ? `[PROXY CRITICAL ERROR] Timed out after ${REFRESH_TIMEOUT_MS}ms`
                    : `[PROXY CRITICAL ERROR] Exception:`,
                error
            )
            const reason = isTimeout ? 'timeout' : 'server_error'
            return NextResponse.redirect(new URL(`/error?reason=${reason}`, request.url))
        }
    }

    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL('/profile', request.url))
    }

    return NextResponse.next()
}