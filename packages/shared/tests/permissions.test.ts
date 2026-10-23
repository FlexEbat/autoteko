import fc from 'fast-check'
import { describe, expect, test } from 'vitest'
import { grantFor, toPublicBatch, type Grant, type Permission } from '../src/permissions.ts'
import { isRole, ROLES } from '../src/roles.ts'
import type { Batch, Role } from '../src/types.ts'

// Written from the matrix in tech.md, section 4, not from the implementation.
const EXPECTED: Record<Permission, Record<Role, Grant>> = {
  'admin.manage': { admin: 'yes', accountant: 'no', buyer: 'no', sales: 'no' },
  'product.read': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'yes' },
  'product.write': { admin: 'yes', accountant: 'no', buyer: 'yes', sales: 'no' },
  'client.read': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'yes' },
  'client.write': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'yes' },
  'rate.read': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'no' },
  'rate.write': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'no' },
  'batch.read': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'no' },
  'batch.write_p': { admin: 'yes', accountant: 'no', buyer: 'yes', sales: 'no' },
  'batch.write_f': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'no' },
  'stock.read_full': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'no' },
  'stock.read_public': { admin: 'yes', accountant: 'yes', buyer: 'yes', sales: 'yes' },
  'deal.read': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'own' },
  'deal.create': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'yes' },
  'deal.update_payment': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'no' },
  'deal.update_other': { admin: 'yes', accountant: 'no', buyer: 'no', sales: 'own' },
  'quote.read': { admin: 'yes', accountant: 'yes', buyer: 'no', sales: 'own' },
  'quote.write': { admin: 'yes', accountant: 'no', buyer: 'no', sales: 'own' },
  'dashboard.view': { admin: 'yes', accountant: 'yes', buyer: 'limited', sales: 'own' },
}

const HIDDEN_FROM_SALES = [
  'price_exw_cny',
  'cny_rate',
  'cny_rate_date',
  'customs_duty_pct',
  'vat_pct',
  'transport_cost_rub',
  'other_costs_rub',
  'cost_mode',
  'cost_price_rub',
  'markup_coefficient',
  'price_mode',
  'profit_per_unit_rub',
  'gtd_number',
  'gtd_date',
]

describe('permissions', () => {
  test('S0A.12: every cell of the matrix matches the contract', () => {
    for (const permission of Object.keys(EXPECTED) as Permission[]) {
      for (const role of ROLES) {
        expect(grantFor(role, permission), `${role} ${permission}`).toBe(EXPECTED[permission][role])
      }
    }
  })

  test('S0A.12: the role list has the four contract roles', () => {
    expect([...ROLES]).toEqual(['admin', 'accountant', 'buyer', 'sales'])
    expect(isRole('sales')).toBe(true)
    expect(isRole('root')).toBe(false)
    expect(isRole(1)).toBe(false)
  })

  const decimal = fc
    .integer({ min: 1, max: 10_000_000 })
    .map((units) => `${Math.floor(units / 100)}.${String(units % 100).padStart(2, '0')}`)
  const batch = fc.record({
    id: fc.uuid(),
    batch_number: fc.constant('P-2026-01'),
    product_id: fc.uuid(),
    quantity: fc.integer({ min: 1, max: 1000 }),
    price_exw_cny: decimal,
    cny_rate: decimal,
    cny_rate_date: fc.constant('2026-10-01'),
    customs_duty_pct: decimal,
    vat_pct: decimal,
    transport_cost_rub: decimal,
    other_costs_rub: decimal,
    cost_mode: fc.constantFrom('calculated', 'manual'),
    cost_price_rub: decimal,
    markup_coefficient: decimal,
    price_mode: fc.constantFrom('markup', 'manual'),
    price_kp_rub: decimal,
    profit_per_unit_rub: decimal,
    gtd_number: fc.option(fc.constant('10210020/051026/0012345'), { nil: null }),
    gtd_date: fc.option(fc.constant('2026-10-05'), { nil: null }),
    notes: fc.option(fc.string(), { nil: null }),
    version: fc.integer({ min: 1, max: 100 }),
    created_at: fc.constant('2026-10-01T00:00:00Z'),
    updated_at: fc.constant('2026-10-02T00:00:00Z'),
  }) as fc.Arbitrary<Batch>

  test('S0A.12: toPublicBatch removes every field hidden from sales', () => {
    fc.assert(
      fc.property(batch, fc.integer({ min: 0, max: 1000 }), (full, sold) => {
        const publicBatch = toPublicBatch(full, {
          received: full.quantity,
          sold,
          balance: full.quantity - sold,
        })
        const keys = Object.keys(publicBatch).sort()
        expect(keys).toEqual(
          [
            'balance',
            'batch_number',
            'id',
            'price_kp_rub',
            'product_id',
            'received',
            'sold',
            'updated_at',
            'version',
          ].sort(),
        )
        for (const hidden of HIDDEN_FROM_SALES) expect(publicBatch).not.toHaveProperty(hidden)
      }),
    )
  })

  test('S0A.12: toPublicBatch ignores extra fields added to the input object', () => {
    const extra = {
      ...({} as Batch),
      id: 'a',
      batch_number: 'P-2026-01',
      product_id: 'b',
      price_kp_rub: '1.00',
      version: 1,
      updated_at: 'x',
      secret_cost: '5.00',
    }
    const result = toPublicBatch(extra, { received: 1, sold: 0, balance: 1 })
    expect(result).not.toHaveProperty('secret_cost')
  })
})
