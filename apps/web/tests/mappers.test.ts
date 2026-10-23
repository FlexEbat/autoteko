import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { toBool, toDecimal, toEnum, toInt, toIsoDate, toIsoDateTime } from '../src/server/data/mappers.ts'
import { sql } from '../src/server/data/sql.ts'
import { createTestDb, type TestDb } from './helpers/db.ts'

let ctx: TestDb
const originalTz = process.env['TZ']
beforeAll(async () => {
  ctx = await createTestDb()
})
afterAll(async () => {
  if (originalTz === undefined) delete process.env['TZ']
  else process.env['TZ'] = originalTz
  await ctx.destroy()
})

describe('mappers', () => {
  test('S0A.5: numeric arrives as a string with every digit', async () => {
    const row = await ctx.db.one<{ n: string }>(sql`select 12345678901234.5600::numeric(20,4) as n`)
    expect(toDecimal(row!.n)).toBe('12345678901234.5600')
    expect(() => toDecimal(1.5)).toThrow(TypeError)
    expect(() => toDecimal('1,5')).toThrow(RangeError)
  })

  test('S0A.5: timestamptz becomes ISO 8601 with Z', async () => {
    for (const tz of ['UTC', 'America/Los_Angeles', 'Asia/Vladivostok']) {
      process.env['TZ'] = tz
      const row = await ctx.db.one<{ t: Date }>(sql`select '2026-10-11 10:15:00+03'::timestamptz as t`)
      expect(toIsoDateTime(row!.t)).toBe('2026-10-11T07:15:00Z')
    }
    expect(toIsoDateTime('2026-10-11T07:15:00.123Z')).toBe('2026-10-11T07:15:00Z')
    expect(() => toIsoDateTime('nonsense')).toThrow(RangeError)
  })

  test('S0A.5: date stays YYYY-MM-DD under TZ=America/Los_Angeles and Asia/Vladivostok', async () => {
    for (const tz of ['America/Los_Angeles', 'Asia/Vladivostok', 'UTC']) {
      process.env['TZ'] = tz
      const row = await ctx.db.one<{ d: string }>(sql`select '2026-10-11'::date as d`)
      expect(toIsoDate(row!.d)).toBe('2026-10-11')
      expect(toIsoDate(new Date(2026, 9, 11))).toBe('2026-10-11')
    }
    expect(() => toIsoDate('11.10.2026')).toThrow(RangeError)
  })

  test('S0A.5: booleans, integers and enums are checked', () => {
    expect(toBool(true)).toBe(true)
    expect(() => toBool('t')).toThrow(TypeError)
    expect(toInt('42')).toBe(42)
    expect(toInt(7)).toBe(7)
    expect(() => toInt('1.5')).toThrow(RangeError)
    expect(toEnum('a', ['a', 'b'] as const)).toBe('a')
    expect(() => toEnum('z', ['a', 'b'] as const)).toThrow(RangeError)
  })
})
