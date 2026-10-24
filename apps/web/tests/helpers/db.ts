import { randomBytes } from 'node:crypto'
import pg from 'pg'
import { openPool } from '../../src/server/data/db.ts'
import { migrate } from '../../src/server/data/migrate.ts'
import { sql } from '../../src/server/data/sql.ts'
import type { Db } from '../../src/server/data/db.ts'

export const TEMPLATE_NAME = 'auteko_template_test'

function baseUrl(): URL {
  const raw = process.env['TEST_DATABASE_URL']
  if (!raw) throw new Error('TEST_DATABASE_URL is not set')
  const url = new URL(raw)
  if (!url.pathname.slice(1).endsWith('_test')) {
    throw new Error('TEST_DATABASE_URL must point to a database whose name ends with _test')
  }
  return url
}

export function urlFor(database: string): string {
  const url = baseUrl()
  url.pathname = `/${database}`
  return url.toString()
}

async function adminStatement(statement: string): Promise<void> {
  const client = new pg.Client({ connectionString: urlFor('postgres') })
  await client.connect()
  try {
    await client.query(statement)
  } finally {
    await client.end()
  }
}

// Builds the migrated template once per test run. Every test file copies it.
export async function createTemplate(): Promise<void> {
  await adminStatement(`drop database if exists ${TEMPLATE_NAME} with (force)`)
  await adminStatement(`create database ${TEMPLATE_NAME}`)
  const pool = openPool(urlFor(TEMPLATE_NAME))
  try {
    await migrate(pool)
  } finally {
    await pool.close()
  }
}

export async function dropTemplate(): Promise<void> {
  await adminStatement(`drop database if exists ${TEMPLATE_NAME} with (force)`)
}

export interface TestDb {
  db: ReturnType<typeof openPool>
  name: string
  url: string
  destroy(): Promise<void>
}

// A fresh database for one test file, copied from the migrated template.
export async function createTestDb(): Promise<TestDb> {
  const name = `auteko_${randomBytes(6).toString('hex')}_test`
  await adminStatement(`create database ${name} template ${TEMPLATE_NAME}`)
  const url = urlFor(name)
  const db = openPool(url)
  return {
    db,
    name,
    url,
    async destroy() {
      await db.close()
      await adminStatement(`drop database if exists ${name} with (force)`)
    },
  }
}

const SETTING_DEFAULTS = [
  ['low_stock_threshold', '10'],
  ['default_vat_pct', '22'],
  ['default_markup', '1.25'],
  ['quote_validity_days', '14'],
] as const

// Empties every table except the migration log, restarts counters, restores default settings.
export async function resetDb(db: Db): Promise<void> {
  const tables = await db.query<{ table_name: string }>(sql`
    select table_name from information_schema.tables
    where table_schema = 'public' and table_type = 'BASE TABLE' and table_name <> 'schema_migrations'`)
  const names = tables.map((row) => `"${row.table_name}"`).join(', ')
  await db.query({ text: `truncate ${names} restart identity cascade`, values: [] })
  await db.query(sql`alter sequence sync_seq_seq restart`)
  for (const [key, value] of SETTING_DEFAULTS) {
    await db.query(sql`insert into settings (key, value) values (${key}, ${value})`)
  }
}

// Drops and creates a named database, for long-lived instances such as the e2e servers.
export async function recreateDatabase(name: string): Promise<void> {
  if (!name.endsWith('_test')) throw new Error('only databases named *_test may be recreated')
  await adminStatement(`drop database if exists ${name} with (force)`)
  await adminStatement(`create database ${name}`)
}

// A database with no tables, for tests of the migration runner itself.
export async function createEmptyTestDb(): Promise<{
  db: ReturnType<typeof openPool>
  destroy(): Promise<void>
}> {
  const name = `auteko_${randomBytes(6).toString('hex')}_test`
  await adminStatement(`create database ${name}`)
  const db = openPool(urlFor(name))
  return {
    db,
    async destroy() {
      await db.close()
      await adminStatement(`drop database if exists ${name} with (force)`)
    },
  }
}

let counter = 0

// Inserts a minimal product and returns its row.
export async function insertProduct(
  db: Db,
  overrides: Partial<{ article: string; name: string }> = {},
): Promise<{ id: string; sync_seq: string }> {
  counter += 1
  const article = overrides.article ?? `ART-${counter}`
  const row = await db.one<{ id: string; sync_seq: string }>(sql`
    insert into products (auteko_article, name, search_key)
    values (${article}, ${overrides.name ?? 'Test part'}, ${article.toLowerCase()})
    returning id, sync_seq`)
  if (!row) throw new Error('insert returned no row')
  return row
}
