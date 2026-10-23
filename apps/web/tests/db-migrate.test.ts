import { afterAll, beforeAll, describe, expect, test } from 'vitest'
import { readdirSync } from 'node:fs'
import path from 'node:path'
import { migrate, schemaVersion } from '../src/server/data/migrate.ts'
import { sql } from '../src/server/data/sql.ts'
import { createEmptyTestDb, createTestDb, type TestDb } from './helpers/db.ts'

const FILES = readdirSync(path.resolve(import.meta.dirname, '../../../db/migrations')).filter((f) =>
  f.endsWith('.sql'),
).length
const EXPECTED_TABLES = [
  'audit_log',
  'batches',
  'clients',
  'deals',
  'doc_counters',
  'exchange_rates',
  'products',
  'quote_items',
  'quotes',
  'schema_migrations',
  'sessions',
  'settings',
  'sync_mutations',
  'users',
]

describe('migrations', () => {
  let ctx: TestDb
  beforeAll(async () => {
    ctx = await createTestDb()
  })
  afterAll(async () => {
    await ctx.destroy()
  })

  test('S0A.3: an empty database gets every table, the version equals the file count, checksums are stored', async () => {
    const empty = await createEmptyTestDb()
    try {
      expect(await schemaVersion(empty.db)).toBe(0)
      expect(await migrate(empty.db)).toEqual({ from: 0, to: FILES })
      expect(await schemaVersion(empty.db)).toBe(FILES)
      const tables = await empty.db.query<{ t: string }>(
        sql`select table_name as t from information_schema.tables where table_schema='public' order by 1`,
      )
      expect(tables.map((r) => r.t)).toEqual(EXPECTED_TABLES)
      const sums = await empty.db.query<{ checksum: string }>(sql`select checksum from schema_migrations`)
      expect(sums).toHaveLength(FILES)
      for (const row of sums) expect(row.checksum).toMatch(/^[0-9a-f]{64}$/)
      expect(await migrate(empty.db)).toEqual({ from: FILES, to: FILES })
    } finally {
      await empty.destroy()
    }
  })

  test('S0A.3: a database of an older version is upgraded without losing existing data', async () => {
    const old = await createEmptyTestDb()
    try {
      await old.db.query(sql`create table legacy_marker (id int primary key, note text)`)
      await old.db.query(sql`insert into legacy_marker values (1, 'keep me')`)
      expect(await migrate(old.db)).toEqual({ from: 0, to: FILES })
      const row = await old.db.one<{ note: string }>(sql`select note from legacy_marker where id = 1`)
      expect(row?.note).toBe('keep me')
    } finally {
      await old.destroy()
    }
  })

  test('S0A.3: a database newer than the application is refused and the error names the version', async () => {
    await ctx.db.query(
      sql`insert into schema_migrations (version, name, checksum) values (9999, 'future', 'x')`,
    )
    try {
      await expect(migrate(ctx.db)).rejects.toThrow(/9999/)
    } finally {
      await ctx.db.query(sql`delete from schema_migrations where version = 9999`)
    }
  })

  test('S0A.3: an edited applied migration fails the checksum check', async () => {
    await ctx.db.query(sql`update schema_migrations set checksum = 'tampered' where version = 1`)
    await expect(migrate(ctx.db)).rejects.toThrow(/checksum mismatch.*0001/)
  })
})
