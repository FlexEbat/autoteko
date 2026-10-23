import { NextResponse, type NextRequest } from 'next/server'
import { newNonce, securityHeaders } from './server/security/headers.ts'

// A fresh nonce per request. Next.js reads it from the request CSP header and stamps its own scripts.
export function proxy(request: NextRequest): NextResponse {
  const nonce = newNonce()
  const headers = securityHeaders(nonce, process.env.NODE_ENV === 'development')
  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  requestHeaders.set('Content-Security-Policy', headers['Content-Security-Policy'] ?? '')
  const response = NextResponse.next({ request: { headers: requestHeaders } })
  for (const [name, value] of Object.entries(headers)) response.headers.set(name, value)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
