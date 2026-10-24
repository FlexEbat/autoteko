import { describe, expect, test } from 'vitest'
import { DOMAIN_ERROR_CODES, error, ok } from '../src/errors.ts'

describe('errors', () => {
  test('ok wraps a value and error wraps a code', () => {
    expect(ok(5)).toEqual({ ok: true, value: 5 })
    expect(error('forbidden')).toEqual({ ok: false, error: 'forbidden' })
  })

  test('domain error codes are unique', () => {
    expect(new Set(DOMAIN_ERROR_CODES).size).toBe(DOMAIN_ERROR_CODES.length)
  })
})
