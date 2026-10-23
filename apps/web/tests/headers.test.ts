import { NextRequest } from 'next/server'
import { describe, expect, test } from 'vitest'
import { config, proxy } from '../src/proxy.ts'
import { securityHeaders } from '../src/server/security/headers.ts'

const EXPECTED = [
  'content-security-policy',
  'x-content-type-options',
  'referrer-policy',
  'x-frame-options',
  'cross-origin-opener-policy',
  'cross-origin-resource-policy',
  'permissions-policy',
]

describe('security headers', () => {
  test('S0A.14: an ordinary page and a missing page both get every header', () => {
    for (const path of ['/', '/no/such/page']) {
      const response = proxy(new NextRequest(`http://localhost:3000${path}`))
      for (const name of EXPECTED) expect(response.headers.get(name), `${path} ${name}`).toBeTruthy()
    }
  })

  test('S0A.14: the proxy matcher covers pages and skips only static assets', () => {
    const pattern = new RegExp(`^${config.matcher[0]}$`)
    expect(pattern.test('/')).toBe(true)
    expect(pattern.test('/no/such/page')).toBe(true)
    expect(pattern.test('/api/health/live')).toBe(true)
    expect(pattern.test('/_next/static/chunk.js')).toBe(false)
  })

  test('S0A.14: CSP uses a fresh nonce per request and no unsafe-inline in production', () => {
    const a = proxy(new NextRequest('http://localhost:3000/')).headers.get('content-security-policy')
    const b = proxy(new NextRequest('http://localhost:3000/')).headers.get('content-security-policy')
    expect(a).not.toBe(b)
    const production = securityHeaders('abc', false)['Content-Security-Policy']!
    expect(production).toContain("script-src 'self' 'nonce-abc'")
    expect(production).toContain("style-src 'self'")
    expect(production).not.toContain('unsafe')
    expect(production).toContain("frame-ancestors 'none'")
    expect(securityHeaders('abc', true)['Content-Security-Policy']).toContain("'unsafe-eval'")
  })
})
