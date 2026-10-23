import type { Uuid } from './types.ts'

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

// Accepts only a canonical UUID string; returns it in lower case.
export function parseUuid(raw: unknown): Uuid | undefined {
  if (typeof raw !== 'string' || !UUID_PATTERN.test(raw)) return undefined
  return raw.toLowerCase()
}
