import { describe, expect, test } from 'vitest'
import { isOverdue, today } from '../src/dates.ts'

describe('dates', () => {
  test('S0A.10: today follows the business time zone', () => {
    const moment = new Date('2026-10-11T21:30:00Z')
    expect(today('Europe/Moscow', moment)).toBe('2026-10-12')
    expect(today('UTC', moment)).toBe('2026-10-11')
    expect(today('America/Los_Angeles', moment)).toBe('2026-10-11')
    expect(today('Asia/Vladivostok', moment)).toBe('2026-10-12')
  })

  test('S0A.10: today without a moment uses the current time', () => {
    expect(today('UTC')).toMatch(/^\d{4}-\d{2}-\d{2}$/)
  })

  const open = { delivery_deadline: '2026-10-10', actual_delivery_date: null, status: 'confirmed' } as const

  test('S0A.10: isOverdue table', () => {
    expect(isOverdue(open, '2026-10-11')).toBe(true)
    expect(isOverdue(open, '2026-10-10')).toBe(false) // the deadline day itself is not overdue
    expect(isOverdue(open, '2026-10-09')).toBe(false)
    expect(isOverdue({ ...open, status: 'done' }, '2026-10-11')).toBe(false)
    expect(isOverdue({ ...open, status: 'cancelled' }, '2026-10-11')).toBe(false)
    expect(isOverdue({ ...open, actual_delivery_date: '2026-10-09' }, '2026-10-11')).toBe(false)
    expect(isOverdue({ ...open, delivery_deadline: null }, '2026-10-11')).toBe(false)
    expect(isOverdue({ ...open, status: 'new' }, '2026-10-11')).toBe(true)
    expect(isOverdue({ ...open, status: 'shipped' }, '2026-10-11')).toBe(true)
  })
})
