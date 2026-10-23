import pg from 'pg'
import type { SqlQuery } from './sql.ts'

export interface Db {
  query<T>(q: SqlQuery): Promise<T[]>
  one<T>(q: SqlQuery): Promise<T | undefined>
}

const POOL = Symbol('auteko.pool')

interface PoolDb extends Db {
  close(): Promise<void>
  [POOL]: pg.Pool
}

const DATE_OID = 1082

// The date type stays raw text so no time zone can shift a calendar date.
// The driver's overloaded typing cannot express this wrapper, hence the cast.
const types: pg.CustomTypesConfig = {
  getTypeParser: ((oid: number, format?: 'text' | 'binary') =>
    oid === DATE_OID
      ? (value: string) => value
      : pg.types.getTypeParser(oid as never, format as never)) as pg.CustomTypesConfig['getTypeParser'],
}

function wrap(runner: { query(text: string, values: unknown[]): Promise<{ rows: unknown[] }> }): Db {
  const query = async <T>(q: SqlQuery): Promise<T[]> => (await runner.query(q.text, q.values)).rows as T[]
  return {
    query,
    async one<T>(q: SqlQuery): Promise<T | undefined> {
      return (await query<T>(q))[0]
    },
  }
}

// One pool per process. An explicit URL opens a separate pool that the caller closes.
export function openPool(url: string | undefined = process.env['DATABASE_URL']): PoolDb {
  if (!url) throw new Error('DATABASE_URL is not set')
  const pool = new pg.Pool({ connectionString: url, types })
  return Object.assign(wrap(pool), {
    close: () => pool.end(),
    [POOL]: pool,
  })
}

// Runs fn in one transaction. Inside an open transaction fn joins it.
export async function withTx<T>(db: Db, fn: (tx: Db) => Promise<T>): Promise<T> {
  const pool = (db as Partial<PoolDb>)[POOL]
  if (!pool) return fn(db)
  const client = await pool.connect()
  try {
    await client.query('begin')
    const result = await fn(wrap(client))
    await client.query('commit')
    return result
  } catch (error) {
    await client.query('rollback')
    throw error
  } finally {
    client.release()
  }
}
