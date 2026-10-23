import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { computeBalance, stockStatus } from '../src/stock.ts'

describe('stock', () => {
  test('S0A.9: stockStatus at threshold 10', () => {
    const cases: [number, string][] = [
      [-1, 'red'],
      [0, 'red'],
      [1, 'yellow'],
      [10, 'yellow'],
      [11, 'green'],
    ]
    for (const [balance, status] of cases) expect(stockStatus(balance, 10)).toBe(status)
  })

  test('S0A.9: stockStatus at threshold 3', () => {
    const cases: [number, string][] = [
      [-1, 'red'],
      [0, 'red'],
      [1, 'yellow'],
      [3, 'yellow'],
      [4, 'green'],
      [10, 'green'],
      [11, 'green'],
    ]
    for (const [balance, status] of cases) expect(stockStatus(balance, 3)).toBe(status)
  })

  test('S0A.9: stockStatus is monotonic in the balance', () => {
    const rank = { red: 0, yellow: 1, green: 2 } as const
    fc.assert(
      fc.property(
        fc.integer({ min: -50, max: 1000 }),
        fc.integer({ min: 1, max: 100 }),
        fc.integer({ min: 0, max: 50 }),
        (balance, threshold, extra) => {
          expect(rank[stockStatus(balance + extra, threshold)]).toBeGreaterThanOrEqual(
            rank[stockStatus(balance, threshold)],
          )
        },
      ),
    )
  })

  test('S0A.9: computeBalance ignores cancelled deals', () => {
    const result = computeBalance(100, [
      { quantity: 30, status: 'new' },
      { quantity: 20, status: 'done' },
      { quantity: 50, status: 'cancelled' },
    ])
    expect(result).toEqual({ received: 100, sold: 50, balance: 50 })
  })

  test('S0A.9: computeBalance with no deals returns the whole batch', () => {
    expect(computeBalance(7, [])).toEqual({ received: 7, sold: 0, balance: 7 })
  })

  test('S0A.9: computeBalance can go negative when deals exceed the batch', () => {
    expect(computeBalance(5, [{ quantity: 8, status: 'confirmed' }]).balance).toBe(-3)
  })
})
