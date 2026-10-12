import { NextResponse } from 'next/server'
import { resolvePageType } from '@/lib/resolvePageType'
import { useTimezoneRedirect, isInClosedHours } from '@/lib/closedArchiveHours'
import {
  ACCESS_COOKIE,
  ACCESS_PATH,
  getAccessPassword,
  hasValidAccessToken,
  sanitizeNextPath,
} from '@/lib/siteAccess'

// Files from /public (logo, favicons, robots) stay reachable from the gate
const PUBLIC_FILE = /\.(png|jpe?g|gif|svg|ico|webp|avif|txt|xml|webmanifest|js|css|woff2?|otf|ttf)$/i

/** Next.js Link / router.prefetch — 401 + WWW-Authenticate here triggers the browser auth UI on unrelated pages. */
function isNextRouterPrefetch(request) {
  return (
    request.headers.get('Next-Router-Prefetch') === '1' ||
    request.headers.get('Sec-Purpose') === 'prefetch'
  )
}

function noIndex(response) {
  response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}

/**
 * Preview password gate (see src/lib/siteAccess.js). Returns a response when
 * the request must be answered here, null to let it through.
 */
async function handleAccessGate(request, pathname) {
  if (!getAccessPassword()) {
    return pathname === ACCESS_PATH
      ? NextResponse.redirect(new URL('/', request.url))
      : null
  }

  if (pathname !== ACCESS_PATH && PUBLIC_FILE.test(pathname)) return null

  const hasAccess = await hasValidAccessToken(request.cookies.get(ACCESS_COOKIE)?.value)

  if (pathname === ACCESS_PATH) {
    if (!hasAccess) return null
    const next = sanitizeNextPath(request.nextUrl.searchParams.get('next'))
    return noIndex(NextResponse.redirect(new URL(next, request.url)))
  }

  if (hasAccess) return null

  // A prefetch must not land on the gate page
  if (isNextRouterPrefetch(request)) {
    return noIndex(new NextResponse(null, { status: 401 }))
  }

  const gateUrl = new URL(ACCESS_PATH, request.url)
  const next = pathname + request.nextUrl.search
  if (next !== '/') gateUrl.searchParams.set('next', next)
  return noIndex(NextResponse.redirect(gateUrl))
}

export async function middleware(request) {
  const pathname = request.nextUrl.pathname

  const gateResponse = await handleAccessGate(request, pathname)
  if (gateResponse) return gateResponse

  // Returning visitors skip the home intro. Done here rather than in the
  // page: reading the cookie in the page made the home render on every
  // request, and the redirect then cost a second server render.
  if (pathname === '/' && request.cookies.get('oo_visited')?.value === '1') {
    return NextResponse.redirect(new URL('/archive', request.url))
  }

  // Closed archive: redirect by open/closed window (only when useTimezoneRedirect)
  const isArchiveEntryPage = pathname.startsWith('/archive/entry/');
  if (useTimezoneRedirect && pathname.startsWith('/archive') && !isArchiveEntryPage) {
    const closed = isInClosedHours()
    if (pathname === '/archive/closed') {
      if (!closed) return NextResponse.redirect(new URL('/archive', request.url))
    } else if (closed) {
      return NextResponse.redirect(new URL('/archive/closed', request.url))
    }
  }

  // Redirect /studio to Archive entries list
  if (pathname === '/studio' || pathname === '/studio/structure') {
    return NextResponse.redirect(new URL('/studio/structure/archive', request.url))
  }

  // Block vector-store page on deployed environments (only allow on localhost)
  if (pathname.startsWith('/vector-store')) {
    const hostname = request.headers.get('host') || ''
    const isLocalhost = hostname.includes('localhost') || hostname.includes('127.0.0.1')
    
    if (!isLocalhost) {
      return NextResponse.redirect(new URL('/archive', request.url))
    }
  }

  // Widline Cadet page only: Basic auth when SITE_PASSWORD is set. Stops after
  // May 5, 2026 8:30 AM America/Los_Angeles (PDT → 15:30 UTC). Optional: SITE_PASSWORD_UNTIL_MS (epoch ms).
  const isWidlineCadetPath =
    pathname === '/archive/widline-cadet' || pathname.startsWith('/archive/widline-cadet/')
  const sitePassword = process.env.SITE_PASSWORD
  const siteUsername = process.env.SITE_USERNAME || 'admin' // Default username
  const lockEndMs = process.env.SITE_PASSWORD_UNTIL_MS
    ? Number(process.env.SITE_PASSWORD_UNTIL_MS)
    : Date.UTC(2026, 4, 5, 15, 30, 0)

  if (isWidlineCadetPath && sitePassword && Date.now() < lockEndMs) {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Basic ')) {
      // Prefetch only: fail closed without WWW-Authenticate so the browser does not show a login modal.
      if (isNextRouterPrefetch(request)) {
        return new NextResponse(null, { status: 401 })
      }
      return new NextResponse('Authentication required', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Widline Cadet"',
        },
      })
    }

    // Decode the base64 credentials (using atob for Edge runtime compatibility)
    const base64Credentials = authHeader.split(' ')[1]
    const credentials = atob(base64Credentials)
    const [username, password] = credentials.split(':')

    // Verify credentials
    if (username !== siteUsername || password !== sitePassword) {
      return new NextResponse('Invalid credentials', {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Widline Cadet"',
        },
      })
    }
  }

  const pageType = resolvePageType(pathname)
  const response = NextResponse.next()

  const host = request.headers.get('host') || ''
  if (host.endsWith('.netlify.app') || getAccessPassword()) {
    noIndex(response)
  }
  response.headers.set('x-page-type', pageType)
  response.headers.set('x-pathname', pathname)
  // Returning visitor is resolved client-side from localStorage (see HomeContent)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
