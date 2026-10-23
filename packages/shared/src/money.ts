import type { Decimal } from './types.ts'

// Exact decimal: value = units / 10^scale. All money math runs on bigint, never on float.
export interface Dec {
  units: bigint
  scale: number
}

// Exact fraction used for intermediate results. Rounding happens once, at the end.
export interface Ratio {
  n: bigint
  d: bigint
}

const DECIMAL_PATTERN = /^(-?)(\d+)(?:\.(\d+))?$/

export function parse(text: string): Dec | undefined {
  const m = DECIMAL_PATTERN.exec(text)
  if (!m) return undefined
  const fraction = m[3] ?? ''
  const units = BigInt(`${m[2]}${fraction}`)
  return { units: m[1] === '-' ? -units : units, scale: fraction.length }
}

export function format(value: Dec): Decimal {
  const negative = value.units < 0n
  const digits = (negative ? -value.units : value.units).toString().padStart(value.scale + 1, '0')
  const whole = digits.slice(0, digits.length - value.scale)
  const fraction = digits.slice(digits.length - value.scale)
  const body = value.scale === 0 ? whole : `${whole}.${fraction}`
  return negative ? `-${body}` : body
}

function pow10(exponent: number): bigint {
  return 10n ** BigInt(exponent)
}

export function ratio(value: Dec): Ratio {
  return { n: value.units, d: pow10(value.scale) }
}

export function ratioFromInt(value: number): Ratio {
  return { n: BigInt(value), d: 1n }
}

export function add(a: Ratio, b: Ratio): Ratio {
  return { n: a.n * b.d + b.n * a.d, d: a.d * b.d }
}

export function mul(a: Ratio, b: Ratio): Ratio {
  return { n: a.n * b.n, d: a.d * b.d }
}

export function div(a: Ratio, b: Ratio): Ratio {
  return { n: a.n * b.d, d: a.d * b.n }
}

// Floor division for bigint with a positive or negative divisor.
function floorDiv(a: bigint, b: bigint): bigint {
  const q = a / b
  return a % b !== 0n && a < 0n !== b < 0n ? q - 1n : q
}

// Rounds to the nearest hundredth, ties toward positive infinity ("half up").
export function round2(value: Ratio): Dec {
  const d = value.d < 0n ? -value.d : value.d
  const n = value.d < 0n ? -value.n : value.n
  return { units: floorDiv(2n * n * 100n + d, 2n * d), scale: 2 }
}

export function sub(a: Dec, b: Dec): Dec {
  const scale = Math.max(a.scale, b.scale)
  const left = a.units * pow10(scale - a.scale)
  const right = b.units * pow10(scale - b.scale)
  return { units: left - right, scale }
}
