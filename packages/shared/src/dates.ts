import type { DealStatus, IsoDate } from './types.ts'

// Calendar date of `now` in the business time zone, as YYYY-MM-DD.
export function today(timeZone: string, now: Date = new Date()): IsoDate {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(now)
  const pick = (type: string): string => parts.find((part) => part.type === type)?.value ?? ''
  return `${pick('year')}-${pick('month')}-${pick('day')}`
}

// A deal is overdue when the deadline is before today, nothing was delivered
// and the deal is neither done nor cancelled.
export function isOverdue(
  deal: {
    delivery_deadline: IsoDate | null
    actual_delivery_date: IsoDate | null
    status: DealStatus
  },
  todayDate: IsoDate,
): boolean {
  if (deal.status === 'done' || deal.status === 'cancelled') return false
  if (deal.actual_delivery_date !== null) return false
  return deal.delivery_deadline !== null && deal.delivery_deadline < todayDate
}
