import type { Db } from './db.ts'
import { sql } from './sql.ts'

export type CounterKind = 'deal' | 'quote' | 'batch'

function format(kind: CounterKind, year: number, value: number): string {
  switch (kind) {
    case 'deal':
      return `R-${String(value).padStart(3, '0')}`
    case 'quote':
      return `KP-${year}-${String(value).padStart(4, '0')}`
    case 'batch':
      return `P-${year}-${String(value).padStart(2, '0')}`
  }
}

// Deal numbers run through all years, so their counter row uses year 0.
function counterYear(kind: CounterKind, year: number): number {
  return kind === 'deal' ? 0 : year
}

// Takes the next number. Call inside the transaction that stores the document.
export async function nextNumber(tx: Db, kind: CounterKind, year: number): Promise<string> {
  const counterRow = counterYear(kind, year)
  // The upsert always returns its row.
  const row = await tx.one<{ last: number }>(sql`
    insert into doc_counters (kind, year, last) values (${kind}, ${counterRow}, 1)
    on conflict (kind, year) do update set last = doc_counters.last + 1
    returning last`)
  return format(kind, year, row!.last)
}

// Shows the number nextNumber would return, without taking it.
export async function peekNumber(db: Db, kind: CounterKind, year: number): Promise<string> {
  const row = await db.one<{ last: number }>(sql`
    select last from doc_counters where kind = ${kind} and year = ${counterYear(kind, year)}`)
  return format(kind, year, (row?.last ?? 0) + 1)
}
