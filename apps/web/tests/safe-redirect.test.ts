import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { safeRedirect } from '../src/server/security/safe-redirect.ts'

describe('safeRedirect', () => {
  test('S0A.11: table of accepted and rejected targets', () => {
    const cases: [unknown, string][] = [
      ['/products?page=2', '/products?page=2'],
      ['/a/b#frag', '/a/b'],
      ['/', '/'],
      ['//evil.example', '/'],
      ['/\\evil.example', '/'],
      ['https://evil.example/x', '/'],
      ['javascript:alert(1)', '/'],
      ['relative/path', '/'],
      ['', '/'],
      [undefined, '/'],
      [42, '/'],
      ['/ok\r\nSet-Cookie: x=1', '/'],
      ['/ok\u0000', '/'],
      ['/' + 'a'.repeat(2048), '/'],
      ['/..//evil.example', '/'],
    ]
    for (const [input, expected] of cases)
      expect(safeRedirect(input), String(input).slice(0, 40)).toBe(expected)
    expect(safeRedirect('//x', '/login')).toBe('/login')
  })

  test('S0A.11: any result is a same-site path without control characters', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'binary' }), (raw) => {
        const out = safeRedirect(raw)
        expect(out.startsWith('/')).toBe(true)
        expect(out.startsWith('//')).toBe(false)
        expect(/[\\\r\n]/.test(out)).toBe(false)
        expect(new URL(out, 'https://site.test').origin).toBe('https://site.test')
      }),
      { numRuns: 500 },
    )
  })
})
