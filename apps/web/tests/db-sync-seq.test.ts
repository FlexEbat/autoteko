import { afterAll, beforeAll, beforeEach, describe, expect, test } from 'vitest'
import pg from 'pg'
import { sql } from '../src/server/data/sql.ts'
import { createTestDb, insertProduct, resetDb, type TestDb } from './helpers/db.ts'

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

const seq = async (id: string): Promise<number> =>
  Number((await ctx.db.one<{ s: string }>(sql`select sync_seq as s from products where id = ${id}`))?.s)

describe('sync_seq trigger', () => {
  test('S0A.4: every insert and update gets a larger value', async () => {
    const a = await insertProduct(ctx.db)
    const b = await insertProduct(ctx.db)
    expect(Number(b.sync_seq)).toBeGreaterThan(Number(a.sync_seq))
    const before = await seq(a.id)
    await ctx.db.query(sql`update products set name = 'changed' where id = ${a.id}`)
    const after = await seq(a.id)
    expect(after).toBeGreaterThan(Number(b.sync_seq))
    expect(after).toBeGreaterThan(before)
  })

  test('S0A.4: two parallel transactions get sync_seq in commit order', async () => {
    const one = new pg.Client({ connectionString: ctx.url })
    const two = new pg.Client({ connectionString: ctx.url })
    await Promise.all([one.connect(), two.connect()])
    try {
      await one.query('begin')
      const first = await one.query(
        "insert into products (auteko_article, name, search_key) values ('P1','n','k') returning sync_seq",
      )
      await two.query('begin')
      let secondDone = false
      const second = two
        .query(
          "insert into products (auteko_article, name, search_key) values ('P2','n','k') returning sync_seq",
        )
        .then((r) => {
          secondDone = true
          return r
        })
      await new Promise((resolve) => setTimeout(resolve, 300))
      expect(secondDone).toBe(false) // waits for the first commit, so it cannot get an earlier value
      await one.query('commit')
      const secondResult = await second
      await two.query('commit')
      expect(Number(secondResult.rows[0].sync_seq)).toBeGreaterThan(Number(first.rows[0].sync_seq))
    } finally {
      await Promise.all([one.end(), two.end()])
    }
  })
})
