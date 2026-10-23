import type { Decimal, IsoDate, IsoDateTime } from '@auteko/shared/types'

// The only place where driver values become application values (tech.md, section 4).

export function toIsoDateTime(value: Date | string): IsoDateTime {
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) throw new RangeError(`not a timestamp: ${String(value)}`)
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z')
}

// A date column arrives as text. A Date is read in local time, as the driver builds it.
export function toIsoDate(value: Date | string): IsoDate {
  if (value instanceof Date) {
    const pad = (n: number): string => String(n).padStart(2, '0')
    return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) throw new RangeError(`not a date: ${value}`)
  return value
}

// numeric arrives as text and stays text, so no digit is lost.
export function toDecimal(value: string | number): Decimal {
  if (typeof value === 'number') throw new TypeError('numeric must not be read as a float')
  if (!/^-?\d+(\.\d+)?$/.test(value)) throw new RangeError(`not a decimal: ${value}`)
  return value
}

export function toInt(value: string | number): number {
  const number = typeof value === 'number' ? value : Number(value)
  if (!Number.isSafeInteger(number)) throw new RangeError(`not a safe integer: ${String(value)}`)
  return number
}

export function toBool(value: unknown): boolean {
  if (typeof value !== 'boolean') throw new TypeError('expected a boolean')
  return value
}

export function toEnum<T extends string>(value: unknown, allowed: readonly T[]): T {
  const found = allowed.find((candidate) => candidate === value)
  if (found === undefined) throw new RangeError(`unexpected value: ${String(value)}`)
  return found
}
