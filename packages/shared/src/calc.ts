import { add, div, format, mul, parse, ratio, ratioFromInt, round2, sub, type Dec } from './money.ts'
import type { Decimal } from './types.ts'

export interface CalcInput {
  price_exw_cny: Decimal
  cny_rate: Decimal
  customs_duty_pct: Decimal
  transport_cost_rub: Decimal
  other_costs_rub: Decimal
  quantity: number
  vat_pct: Decimal
  markup_coefficient: Decimal
  cost_mode: 'calculated' | 'manual'
  cost_price_rub: Decimal // used when cost_mode is manual
  price_mode: 'markup' | 'manual'
  price_kp_rub: Decimal // used when price_mode is manual
}

export interface CalcResult {
  cost_price_rub: Decimal
  price_kp_rub: Decimal
  profit_per_unit_rub: Decimal
}

function need(text: Decimal): Dec {
  const value = parse(text)
  if (!value) throw new RangeError(`not a decimal: ${text}`)
  return value
}

const ONE = ratioFromInt(1)
const HUNDRED = ratioFromInt(100)

// The single place where batch cost, price and profit are computed (tech.md, section 4).
export function calcBatch(input: CalcInput): CalcResult {
  const cost =
    input.cost_mode === 'manual'
      ? round2(ratio(need(input.cost_price_rub)))
      : round2(
          mul(
            add(
              mul(
                mul(ratio(need(input.price_exw_cny)), ratio(need(input.cny_rate))),
                add(ONE, div(ratio(need(input.customs_duty_pct)), HUNDRED)),
              ),
              div(
                add(ratio(need(input.transport_cost_rub)), ratio(need(input.other_costs_rub))),
                ratioFromInt(input.quantity),
              ),
            ),
            add(ONE, div(ratio(need(input.vat_pct)), HUNDRED)),
          ),
        )
  const price =
    input.price_mode === 'manual'
      ? round2(ratio(need(input.price_kp_rub)))
      : round2(mul(ratio(cost), ratio(need(input.markup_coefficient))))
  return {
    cost_price_rub: format(cost),
    price_kp_rub: format(price),
    profit_per_unit_rub: format(sub(price, cost)),
  }
}
