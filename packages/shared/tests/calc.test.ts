import { describe, expect, test } from 'vitest'
import { calcBatch, type CalcInput } from '../src/calc.ts'

const base: CalcInput = {
  price_exw_cny: '100',
  cny_rate: '12.5',
  customs_duty_pct: '10',
  transport_cost_rub: '10000',
  other_costs_rub: '2000',
  quantity: 100,
  vat_pct: '22',
  markup_coefficient: '1.25',
  cost_mode: 'calculated',
  cost_price_rub: '0',
  price_mode: 'markup',
  price_kp_rub: '0',
}

describe('calc', () => {
  test('S0A.8: calculated cost with markup matches the reference example', () => {
    expect(calcBatch(base)).toEqual({
      cost_price_rub: '1823.90',
      price_kp_rub: '2279.88',
      profit_per_unit_rub: '455.98',
    })
  })

  test('S0A.8: manual cost mode takes the entered cost and ignores purchase fields', () => {
    const result = calcBatch({
      ...base,
      cost_mode: 'manual',
      cost_price_rub: '1000.00',
      price_exw_cny: '999999',
    })
    expect(result).toEqual({
      cost_price_rub: '1000.00',
      price_kp_rub: '1250.00',
      profit_per_unit_rub: '250.00',
    })
  })

  test('S0A.8: manual price mode takes the entered price and ignores the markup', () => {
    const result = calcBatch({
      ...base,
      price_mode: 'manual',
      price_kp_rub: '2000.00',
      markup_coefficient: '9',
    })
    expect(result).toEqual({
      cost_price_rub: '1823.90',
      price_kp_rub: '2000.00',
      profit_per_unit_rub: '176.10',
    })
  })

  test('S0A.8: both modes manual', () => {
    const result = calcBatch({
      ...base,
      cost_mode: 'manual',
      cost_price_rub: '500',
      price_mode: 'manual',
      price_kp_rub: '700.50',
    })
    expect(result).toEqual({
      cost_price_rub: '500.00',
      price_kp_rub: '700.50',
      profit_per_unit_rub: '200.50',
    })
  })

  test('S0A.8: a manual price below cost gives a negative profit', () => {
    const result = calcBatch({ ...base, price_mode: 'manual', price_kp_rub: '1500.00' })
    expect(result.profit_per_unit_rub).toBe('-323.90')
  })

  test('S0A.8: quantity 1 carries the whole shipment cost on one unit', () => {
    const result = calcBatch({ ...base, quantity: 1, markup_coefficient: '1' })
    expect(result.cost_price_rub).toBe('16317.50')
    expect(result.price_kp_rub).toBe('16317.50')
    expect(result.profit_per_unit_rub).toBe('0.00')
  })

  test('S0A.8: rounding happens once at the end, not per step', () => {
    // exw*rate = 0.3333 * 3.0001 = 0.99996333; per-step rounding to 2 places would give 1.00 * 1.22.
    const result = calcBatch({
      ...base,
      price_exw_cny: '0.3333',
      cny_rate: '3.0001',
      customs_duty_pct: '0',
      transport_cost_rub: '0',
      other_costs_rub: '0',
      quantity: 1,
      vat_pct: '22',
      markup_coefficient: '1',
    })
    expect(result.cost_price_rub).toBe('1.22')
  })

  test('S0A.8: a value that is not a decimal throws', () => {
    expect(() => calcBatch({ ...base, price_exw_cny: 'abc' })).toThrow(RangeError)
  })
})
