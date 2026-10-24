import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import { ident, sql } from '../src/server/data/sql.ts'
import { withTx } from '../src/server/data/db.ts'
import { createTestDb, resetDb, type TestDb } from './helpers/db.ts'

let ctx: TestDb
beforeAll(async () => {
  ctx = await createTestDb()
})
afterAll(async () => {
  await ctx.destroy()
})
beforeEach(async () => {
  await resetDb(ctx.db)
})

describe('sql tag', () => {
  test('S0A.6: values become numbered parameters, never text', () => {
    const q = sql`select * from t where a = ${'x'} and b = ${5}`
    expect(q.text).toBe('select * from t where a = $1 and b = $2')
    expect(q.values).toEqual(['x', 5])
  })

  test('S0A.6: nested fragments are spliced with renumbered parameters', () => {
    const inner = sql`b = ${2} and c = ${3}`
    const q = sql`select ${1}::int where ${inner} and d = ${4}`
    expect(q.text).toBe('select $1::int where b = $2 and c = $3 and d = $4')
    expect(q.values).toEqual([1, 2, 3, 4])
  })

  test('S0A.6: hostile strings are stored and read back literally', async () => {
    const hostile = ["'", ';--', '%', '_', '\\', "' OR 1=1 --", "x'); drop table products; --"]
    for (const value of hostile) {
      const row = await ctx.db.one<{ v: string }>(sql`select ${value}::text as v`)
      expect(row?.v).toBe(value)
      await ctx.db.query(
        sql`insert into products (auteko_article, name, search_key) values (${`A${hostile.indexOf(value)}`}, ${value}, 'k')`,
      )
    }
    const names = await ctx.db.query<{ name: string }>(sql`select name from products order by auteko_article`)
    expect(names.map((r) => r.name)).toEqual(hostile)
    const like = await ctx.db.query(sql`select 1 from products where strpos(name, ${'%'}) > 0`)
    expect(like.length).toBe(1)
  })

  test('S0A.6: ident accepts only names from the allow list', () => {
    expect(ident('name', ['name', 'id']).text).toBe('"name"')
    expect(() => ident('name; drop table x', ['name'])).toThrow(RangeError)
    expect(() => ident('other', ['name'])).toThrow(RangeError)
    expect(() => ident('Bad-Name', ['Bad-Name'])).toThrow(RangeError)
  })

  test('S0A.6: ident works inside a query', async () => {
    const row = await ctx.db.one<{ n: number }>(
      sql`select count(*)::int as n from products order by ${ident('n', ['n'])}`,
    )
    expect(row?.n).toBe(0)
  })

  test('withTx commits on success, rolls back on error, and joins an open transaction', async () => {
    await withTx(ctx.db, (tx) =>
      tx.query(sql`insert into products (auteko_article, name, search_key) values ('T1', 'n', 'k')`),
    )
    await expect(
      withTx(ctx.db, async (tx) => {
        await tx.query(sql`insert into products (auteko_article, name, search_key) values ('T2', 'n', 'k')`)
        throw new Error('boom')
      }),
    ).rejects.toThrow('boom')
    await withTx(ctx.db, (outer) =>
      withTx(outer, (inner) =>
        inner.query(sql`insert into products (auteko_article, name, search_key) values ('T3', 'n', 'k')`),
      ),
    )
    const rows = await ctx.db.query<{ a: string }>(sql`select auteko_article as a from products order by 1`)
    expect(rows.map((r) => r.a)).toEqual(['T1', 'T3'])
  })
})

describe('openPool', () => {
  test('refuses to open without an address', async () => {
    const { openPool } = await import('../src/server/data/db.ts')
    const saved = process.env['DATABASE_URL']
    delete process.env['DATABASE_URL']
    try {
      expect(() => openPool()).toThrow(/DATABASE_URL/)
    } finally {
      if (saved !== undefined) process.env['DATABASE_URL'] = saved
    }
  })
})
