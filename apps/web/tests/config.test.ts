import { describe, expect, test } from 'vitest'
import { loadConfig } from '../src/server/config.ts'
import { createLogger } from '../src/server/logger.ts'
import { AppError, statusFor } from '../src/server/errors.ts'

describe('config', () => {
  test('defaults apply when nothing is set', () => {
    expect(loadConfig({})).toEqual({
      deployMode: 'internal',
      timezone: 'Europe/Moscow',
      databaseUrl: undefined,
      logLevel: 'info',
    })
  })

  test('explicit values are read', () => {
    const config = loadConfig({
      DEPLOY_MODE: 'public',
      APP_TIMEZONE: 'UTC',
      DATABASE_URL: 'postgres://x',
      LOG_LEVEL: 'debug',
    })
    expect(config).toEqual({
      deployMode: 'public',
      timezone: 'UTC',
      databaseUrl: 'postgres://x',
      logLevel: 'debug',
    })
  })

  test('invalid values stop the start with a message naming the variable', () => {
    expect(() => loadConfig({ DEPLOY_MODE: 'open' })).toThrow(/DEPLOY_MODE/)
    expect(() => loadConfig({ APP_TIMEZONE: 'Mars/Base' })).toThrow(/APP_TIMEZONE/)
    expect(() => loadConfig({ LOG_LEVEL: 'loud' })).toThrow(/LOG_LEVEL/)
  })
})

describe('logger', () => {
  test('secrets are redacted in the JSON line', () => {
    const lines: string[] = []
    const logger = createLogger('info', { write: (chunk: string) => void lines.push(chunk) })
    logger.info({ password: 'hunter2', nested: { token: 'abc' }, ok: 1 }, 'event')
    const line = lines.join('')
    expect(line).not.toContain('hunter2')
    expect(line).not.toContain('abc')
    expect(line).toContain('[redacted]')
    expect(line).toContain('"ok":1')
  })
})

describe('errors', () => {
  test('status codes follow the contract', () => {
    const table: [string, number][] = [
      ['unauthenticated', 401],
      ['session_revoked', 401],
      ['forbidden', 403],
      ['ip_not_allowed', 403],
      ['not_found', 404],
      ['invalid_id', 404],
      ['version_conflict', 409],
      ['insufficient_stock', 409],
      ['body_too_large', 413],
      ['rate_limited', 429],
      ['maintenance', 503],
      ['name_required', 400],
    ]
    for (const [code, status] of table) expect(statusFor(code), code).toBe(status)
  })

  test('AppError keeps the code and details', () => {
    const error = new AppError('forbidden', { need: 'admin' })
    expect(error.code).toBe('forbidden')
    expect(error.details).toEqual({ need: 'admin' })
    expect(error.message).toBe('forbidden')
  })
})
