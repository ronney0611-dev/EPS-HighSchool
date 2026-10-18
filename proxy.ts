import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const REFRESH_TIMEOUT_MS = 3000

// After a successful subscription check, the result is remembered for 15 min
// in a signed cookie. During that time /documents pages do NOT call
// /api/auth/refresh again (= far fewer function calls + MongoDB queries).
// - Only a SUCCESS is remembered: a teacher who just paid is unlocked immediately.
// - The cookie is signed with NEXTAUTH_SECRET and bound to the user id:
//   it cannot be faked or reused by another account.
// - It never outlives paidUntil.
const ACCESS_COOKIE = 'eps_access'
const ACCESS_TTL_MS = 15 * 60 * 1000

const encoder = new TextEncoder()

const toBase64Url = (buf: ArrayBuffer) =>
    btoa(String.fromCharCode(...new Uint8Array(buf)))
        .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

async function sign(payload: string): Promise<string> {
    const key = await crypto.subtle.importKey(
        'raw',
        encoder.encode(process.env.NEXTAUTH_SECRET ?? ''),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
    )
    return toBase64Url(await crypto.subtle.sign('HMAC', key, encoder.encode(payload)))
}

// cookie format: <userId>.<expiresAtMs>.<signature>
async function hasValidAccessCookie(request: NextRequest, userId: string): Promise<boolean> {
    const raw = request.cookies.get(ACCESS_COOKIE)?.value
    if (!raw) return false
    const parts = raw.split('.')
    if (parts.length !== 3) return false
    const [uid, exp, sig] = parts
    if (uid !== userId) return false
    const expMs = Number(exp)
    if (!Number.isFinite(expMs) || expMs < Date.now()) return false
    return (await sign(`${uid}.${exp}`)) === sig
}

async function setAccessCookie(response: NextResponse, userId: string, paidUntil: string | null, isAdmin: boolean) {
    let expMs = Date.now() + ACCESS_TTL_MS
    if (!isAdmin && paidUntil) expMs = Math.min(expMs, new Date(paidUntil).getTime())
    const exp = String(expMs)
    response.cookies.set(ACCESS_COOKIE, `${userId}.${exp}.${await sign(`${userId}.${exp}`)}`, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: Math.max(0, Math.floor((expMs - Date.now()) / 1000)),
    })
}

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
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(loginUrl)
    }

    // [GATE 2] Subscription check — only for /documents sub-paths
    if (isDocumentSubPath && token) {
        const userId = String(token.id ?? token.sub ?? '')

        // already verified in the last 15 min -> no call to /api/auth/refresh
        if (userId && await hasValidAccessCookie(request, userId)) {
            const response = NextResponse.next()
            response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
            return response
        }

        const host = request.headers.get('host') ?? 'localhost:3000'
        const protocol = host.includes('localhost') ? 'http' : 'https'
        const refreshUrl = `${protocol}://${host}/api/auth/refresh`

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

            if (dbRes.ok) {
                const data = await dbRes.json()

                const isPaid = data.isPaid === true
                const paidUntilVal: string | null = data.paidUntil ?? null
                const isAdmin = data.role === 'admin'

                const isExpired = isAdmin
                    ? false
                    : paidUntilVal === null || new Date(paidUntilVal) < new Date()

                if (!isPaid || isExpired) {
                    const paymentUrl = new URL('/payment', request.url)
                    paymentUrl.searchParams.set('callbackUrl', pathname)
                    const response = NextResponse.redirect(paymentUrl)
                    response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
                    response.headers.set('Pragma', 'no-cache')
                    response.headers.set('Expires', '0')
                    // make sure no old "access OK" cookie survives
                    response.cookies.delete(ACCESS_COOKIE)
                    return response
                }

                const response = NextResponse.next()
                response.headers.set('Cache-Control', 'no-store, max-age=0, must-revalidate')
                if (userId) await setAccessCookie(response, userId, paidUntilVal, isAdmin)
                return response

            } else {
                const errorText = await dbRes.text().catch(() => 'No text body')
                console.error(`[PROXY] Refresh API non-200 (${dbRes.status}). Body: ${errorText}`)
                return NextResponse.redirect(new URL('/error?reason=server_error', request.url))
            }

        } catch (error) {
            clearTimeout(timeoutId)
            const isTimeout = error instanceof Error && error.name === 'AbortError'
            console.error(
                isTimeout
                    ? `[PROXY] Timed out after ${REFRESH_TIMEOUT_MS}ms`
                    : `[PROXY] Exception:`,
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