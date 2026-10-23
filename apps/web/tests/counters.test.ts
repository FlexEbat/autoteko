import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { nextNumber, peekNumber } from '../src/server/data/counters.ts'
import { createTestDb, resetDb, type TestDb } from './helpers/db.ts'

let ctx: TestDb
beforeAll(async () => {
  ctx = await createTestDb()
})
afterAll(async () => {
  await ctx.destroy()
})
beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('document counters', () => {
  test('numbers follow the contract formats and increase', async () => {
    expect(await nextNumber(ctx.db, 'deal', 2026)).toBe('R-001')
    expect(await nextNumber(ctx.db, 'deal', 2027)).toBe('R-002')
    expect(await nextNumber(ctx.db, 'quote', 2026)).toBe('KP-2026-0001')
    expect(await nextNumber(ctx.db, 'batch', 2026)).toBe('P-2026-01')
    expect(await nextNumber(ctx.db, 'batch', 2027)).toBe('P-2027-01')
  })

  test('peekNumber shows the next number without taking it', async () => {
    expect(await peekNumber(ctx.db, 'quote', 2026)).toBe('KP-2026-0001')
    expect(await peekNumber(ctx.db, 'quote', 2026)).toBe('KP-2026-0001')
    await nextNumber(ctx.db, 'quote', 2026)
    expect(await peekNumber(ctx.db, 'quote', 2026)).toBe('KP-2026-0002')
  })

  test('parallel callers never get the same number', async () => {
    const numbers = await Promise.all(Array.from({ length: 10 }, () => nextNumber(ctx.db, 'deal', 2026)))
    expect(new Set(numbers).size).toBe(10)
  })
})
