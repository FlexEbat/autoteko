import type { Role } from './types.ts'

export const ROLES: readonly Role[] = ['admin', 'accountant', 'buyer', 'sales']

export function isRole(value: unknown): value is Role {
  return typeof value === 'string' && (ROLES as readonly string[]).includes(value)
}
