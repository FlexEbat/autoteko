import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { add, div, format, mul, parse, ratio, ratioFromInt, round2, sub } from '../src/money.ts'

function r2(text: string): string {
  const value = parse(text)
  if (!value) throw new Error('bad fixture')
  return format(round2(ratio(value)))
}

describe('money', () => {
  test('S0A.7: parse and format keep the digits of a decimal string', () => {
    const cases = ['0', '0.00', '1234.50', '-0.01', '9000000000000.00', '5', '0.0001', '-12.5']
    for (const text of cases) {
      const value = parse(text)
      expect(value).toBeDefined()
      expect(format(value!)).toBe(text)
    }
  })

  test('S0A.7: parse rejects text that is not a plain decimal', () => {
    for (const text of ['', ' 1', '1 ', '1,5', '1e5', '.5', '5.', '--1', '+1', 'abc', '1.2.3']) {
      expect(parse(text)).toBeUndefined()
    }
  })

  test('S0A.7: add, sub and mul are exact', () => {
    const a = parse('0.10')!
    const b = parse('0.20')!
    expect(format(round2(add(ratio(a), ratio(b))))).toBe('0.30')
    expect(format(sub(parse('1.00')!, parse('0.01')!))).toBe('0.99')
    expect(format(sub(parse('1.5')!, parse('0.25')!))).toBe('1.25')
    expect(format(round2(mul(ratio(parse('1234567.89')!), ratio(parse('3')!))))).toBe('3703703.67')
    expect(format(round2(div(ratioFromInt(1), ratioFromInt(3))))).toBe('0.33')
  })

  test('S0A.7: round2 rounds half up', () => {
    expect(r2('2279.875')).toBe('2279.88')
    expect(r2('0.005')).toBe('0.01')
    expect(r2('0.004')).toBe('0.00')
    expect(r2('1.004999')).toBe('1.00')
    expect(r2('-0.005')).toBe('0.00')
    expect(r2('-0.006')).toBe('-0.01')
    expect(format(round2(div(ratioFromInt(5), ratioFromInt(-1000))))).toBe('0.00')
    expect(format(round2(div(ratioFromInt(-1), ratioFromInt(-3))))).toBe('0.33')
  })

  test('S0A.7: values up to 9 000 000 000 000.00 stay exact', () => {
    const big = parse('9000000000000.00')!
    expect(format(sub(big, parse('0.01')!))).toBe('8999999999999.99')
    expect(format(round2(add(ratio(big), ratio(parse('0.01')!))))).toBe('9000000000000.01')
  })

  test('S0A.7: format(parse(x)) === x for canonical decimals', () => {
    const canonical = fc
      .tuple(
        fc.boolean(),
        fc.bigInt({ min: 0n, max: 9_000_000_000_000n }),
        fc.option(fc.stringMatching(/^[0-9]{1,6}$/), { nil: undefined }),
      )
      .map(([negative, whole, fraction]) => {
        const body = fraction === undefined ? `${whole}` : `${whole}.${fraction}`
        const isZero = /^0(\.0*)?$/.test(body)
        return negative && !isZero ? `-${body}` : body
      })
    fc.assert(
      fc.property(canonical, (text) => {
        expect(format(parse(text)!)).toBe(text)
      }),
    )
  })

  test('S0A.7: addition does not depend on operand order', () => {
    const decimal = fc
      .integer({ min: 0, max: 99_999_999 })
      .map((units) => ({ units: BigInt(units), scale: 2 }))
    fc.assert(
      fc.property(decimal, decimal, decimal, (a, b, c) => {
        const left = format(round2(add(add(ratio(a), ratio(b)), ratio(c))))
        const right = format(round2(add(ratio(c), add(ratio(b), ratio(a)))))
        expect(left).toBe(right)
      }),
    )
  })
})
