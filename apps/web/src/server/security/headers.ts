import { randomBytes } from 'node:crypto'

export function newNonce(): string {
  return randomBytes(16).toString('base64')
}

// Next.js dev mode evaluates code for hot reload, so development needs 'unsafe-eval'. Production does not.
export function contentSecurityPolicy(nonce: string, development: boolean): string {
  const script = ["'self'", `'nonce-${nonce}'`, ...(development ? ["'unsafe-eval'"] : [])].join(' ')
  return [
    "default-src 'self'",
    `script-src ${script}`,
    // Next.js dev mode injects inline styles for hot reload; production serves one stylesheet.
    `style-src 'self'${development ? " 'unsafe-inline'" : ''}`,
    "img-src 'self' data:",
    "font-src 'self'",
    "connect-src 'self'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "worker-src 'self'",
    "manifest-src 'self'",
  ].join('; ')
}

// Headers the application sets on every framework response (tech.md, section 18).
export function securityHeaders(nonce: string, development: boolean): Record<string, string> {
  return {
    'Content-Security-Policy': contentSecurityPolicy(nonce, development),
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'no-referrer',
    'X-Frame-Options': 'DENY',
    'Cross-Origin-Opener-Policy': 'same-origin',
    'Cross-Origin-Resource-Policy': 'same-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), payment=()',
  }
}
