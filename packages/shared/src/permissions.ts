import type { Batch, BatchPublic, Role } from './types.ts'
import type { Balance } from './stock.ts'

// yes: allowed. own: only for records owned by the user. limited: reduced scope. no: denied.
export type Grant = 'yes' | 'own' | 'limited' | 'no'

export type Permission =
  | 'admin.manage'
  | 'product.read'
  | 'product.write'
  | 'client.read'
  | 'client.write'
  | 'rate.read'
  | 'rate.write'
  | 'batch.read'
  | 'batch.write_p'
  | 'batch.write_f'
  | 'stock.read_full'
  | 'stock.read_public'
  | 'deal.read'
  | 'deal.create'
  | 'deal.update_payment'
  | 'deal.update_other'
  | 'quote.read'
  | 'quote.write'
  | 'dashboard.view'

type Row = readonly [admin: Grant, accountant: Grant, buyer: Grant, sales: Grant]

const MATRIX: Readonly<Record<Permission, Row>> = {
  'admin.manage': ['yes', 'no', 'no', 'no'],
  'product.read': ['yes', 'yes', 'yes', 'yes'],
  'product.write': ['yes', 'no', 'yes', 'no'],
  'client.read': ['yes', 'yes', 'yes', 'yes'],
  'client.write': ['yes', 'yes', 'no', 'yes'],
  'rate.read': ['yes', 'yes', 'yes', 'no'],
  'rate.write': ['yes', 'yes', 'yes', 'no'],
  'batch.read': ['yes', 'yes', 'yes', 'no'],
  'batch.write_p': ['yes', 'no', 'yes', 'no'],
  'batch.write_f': ['yes', 'yes', 'no', 'no'],
  'stock.read_full': ['yes', 'yes', 'yes', 'no'],
  'stock.read_public': ['yes', 'yes', 'yes', 'yes'],
  'deal.read': ['yes', 'yes', 'no', 'own'],
  'deal.create': ['yes', 'yes', 'no', 'yes'],
  'deal.update_payment': ['yes', 'yes', 'no', 'no'],
  'deal.update_other': ['yes', 'no', 'no', 'own'],
  'quote.read': ['yes', 'yes', 'no', 'own'],
  'quote.write': ['yes', 'no', 'no', 'own'],
  'dashboard.view': ['yes', 'yes', 'limited', 'own'],
}

const ROLE_COLUMN: Readonly<Record<Role, 0 | 1 | 2 | 3>> = {
  admin: 0,
  accountant: 1,
  buyer: 2,
  sales: 3,
}

export function grantFor(role: Role, permission: Permission): Grant {
  return MATRIX[permission][ROLE_COLUMN[role]]
}

// Builds the reduced batch by listing the allowed fields, so a new Batch field
// never leaks into the sales view by accident.
export function toPublicBatch(batch: Batch, balance: Balance): BatchPublic {
  return {
    id: batch.id,
    batch_number: batch.batch_number,
    product_id: batch.product_id,
    price_kp_rub: batch.price_kp_rub,
    version: batch.version,
    updated_at: batch.updated_at,
    received: balance.received,
    sold: balance.sold,
    balance: balance.balance,
  }
}
