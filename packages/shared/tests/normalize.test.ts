import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { parseUuid } from '../src/ids.ts'
import { normalizeEngineModel, normalizeKey } from '../src/normalize.ts'

describe('ids', () => {
  const lower = '0190a5e2-7c3d-7abc-8def-0123456789ab'

  test('S0A.11: parseUuid accepts canonical lower and upper case', () => {
    expect(parseUuid(lower)).toBe(lower)
    expect(parseUuid(lower.toUpperCase())).toBe(lower)
  })

  test('S0A.11: parseUuid rejects everything else', () => {
    const rejected: unknown[] = [
      'abc',
      '1',
      ' ',
      '',
      `${lower}x`,
      ` ${lower}`,
      lower.replaceAll('-', ''),
      5,
      null,
      undefined,
      {},
      [lower],
    ]
    for (const raw of rejected) expect(parseUuid(raw)).toBeUndefined()
  })

  test('S0A.11: parseUuid result equals the lower case input when defined', () => {
    fc.assert(
      fc.property(fc.string(), (raw) => {
        const parsed = parseUuid(raw)
        if (parsed !== undefined) expect(parsed).toBe(raw.toLowerCase())
      }),
    )
    fc.assert(
      fc.property(fc.uuid(), (id) => {
        expect(parseUuid(id.toUpperCase())).toBe(id.toLowerCase())
      }),
    )
  })
})

describe('normalize', () => {
  // Built at runtime: the lint rule forbids non-Latin literals outside dictionaries.
  const cyr = (...codes: number[]): string => String.fromCodePoint(...codes)
  const cyrillicA = cyr(0x410)
  const cyrillicM = cyr(0x41c)

  test('S0A.11: normalizeKey folds case, separators and look-alikes', () => {
    expect(normalizeKey('AB-12.3/4 x')).toBe('ab1234x')
    expect(normalizeKey(`${cyrillicA}B 12`)).toBe(normalizeKey('AB12'))
    expect(normalizeKey(cyr(0x43a, 0x435, 0x43d, 0x442))).toBe('keht')
  })

  test('S0A.11: normalizeKey treats NFC and NFD forms as one key', () => {
    const composed = cyr(0x439)
    const decomposed = cyr(0x438, 0x306)
    expect(normalizeKey(composed)).toBe(normalizeKey(decomposed))
  })

  test('S0A.11: normalizeKey is idempotent', () => {
    fc.assert(
      fc.property(fc.string({ unit: 'binary' }), (text) => {
        expect(normalizeKey(normalizeKey(text))).toBe(normalizeKey(text))
      }),
    )
  })

  test('S0A.11: normalizeKey keeps special query characters out of the key separators it does not list', () => {
    expect(normalizeKey("a%b'c")).toBe("a%b'c")
  })

  test('S0A.11: normalizeEngineModel turns the Latin M into the Cyrillic M', () => {
    expect(normalizeEngineModel('12M55')).toBe(`12${cyrillicM}55`)
    expect(normalizeEngineModel(' 12m33 ')).toBe(`12${cyrillicM}33`)
    expect(normalizeEngineModel(`12-16${cyrillicM}33`)).toBe(`12-16${cyrillicM}33`)
  })

  test('S0A.11: normalizeEngineModel keeps the all-models marker', () => {
    const marker = cyr(0x432, 0x441, 0x435)
    expect(normalizeEngineModel(marker.toUpperCase())).toBe(marker)
    expect(normalizeEngineModel(` ${cyr(0x412, 0x441, 0x435)} `)).toBe(marker)
  })
})
