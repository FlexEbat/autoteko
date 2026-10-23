import { createHash } from 'node:crypto'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { openPool, withTx, type Db } from './db.ts'
import { sql } from './sql.ts'

const MIGRATIONS_DIR = path.resolve(import.meta.dirname, '../../../../../db/migrations')
const FILE_NAME = /^(\d{4})_([a-z0-9_]+)\.sql$/
// Serialises concurrent starters so two instances never migrate at once.
const MIGRATION_LOCK = 7243002

interface MigrationFile {
  version: number
  name: string
  checksum: string
  body: string
}

function checksumOf(body: string): string {
  return createHash('sha256').update(body.replaceAll('\r\n', '\n')).digest('hex')
}

function readMigrationFiles(): MigrationFile[] {
  const files = readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .map((file) => {
      const match = FILE_NAME.exec(file)
      if (!match) throw new Error(`migration file name does not match NNNN_name.sql: ${file}`)
      const body = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      return { version: Number(match[1]), name: match[2] ?? '', checksum: checksumOf(body), body }
    })
  files.forEach((file, index) => {
    if (file.version !== index + 1)
      throw new Error(`migration versions must run 1..N without gaps, found ${file.version}`)
  })
  return files
}

export async function schemaVersion(db: Db): Promise<number> {
  const table = await db.one<{ found: string | null }>(
    sql`select to_regclass('schema_migrations')::text as found`,
  )
  if (!table?.found) return 0
  const row = await db.one<{ version: number }>(
    sql`select coalesce(max(version), 0)::int as version from schema_migrations`,
  )
  return row?.version ?? 0
}

// Applies pending migrations in one transaction.
// A database newer than the application, or an edited applied file, stops the run.
export async function migrate(db: Db): Promise<{ from: number; to: number }> {
  const files = readMigrationFiles()
  const latest = files.length
  return withTx(db, async (tx) => {
    await tx.query(sql`select pg_advisory_xact_lock(${MIGRATION_LOCK})`)
    await tx.query(sql`
      create table if not exists schema_migrations (
        version integer primary key,
        name text not null,
        applied_at timestamptz not null default now(),
        checksum text not null
      )`)
    const applied = await tx.query<{ version: number; checksum: string }>(
      sql`select version, checksum from schema_migrations order by version`,
    )
    const current = applied.reduce((max, row) => Math.max(max, row.version), 0)
    if (current > latest) {
      throw new Error(`database schema version ${current} is newer than this application (latest ${latest})`)
    }
    for (const row of applied) {
      if (files[row.version - 1]?.checksum !== row.checksum) {
        throw new Error(`checksum mismatch for applied migration ${String(row.version).padStart(4, '0')}`)
      }
    }
    for (const file of files.slice(current)) {
      await tx.query({ text: file.body, values: [] })
      await tx.query(
        sql`insert into schema_migrations (version, name, checksum) values (${file.version}, ${file.name}, ${file.checksum})`,
      )
    }
    return { from: current, to: latest }
  })
}

// `npm run db:migrate`: runs under the migrator role.
if (import.meta.main) {
  const url = process.env['DATABASE_MIGRATOR_URL'] ?? process.env['DATABASE_URL']
  const pool = openPool(url)
  try {
    const result = await migrate(pool)
    process.stdout.write(`schema version ${result.from} -> ${result.to}\n`)
  } finally {
    await pool.close()
  }
}
