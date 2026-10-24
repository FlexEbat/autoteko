import { spawn } from 'node:child_process'
import path from 'node:path'
import { openPool } from '../src/server/data/db.ts'
import { migrate } from '../src/server/data/migrate.ts'
import { recreateDatabase, urlFor } from '../tests/helpers/db.ts'

// Starts the built app over its own migrated test database: `serve.ts <main|empty> <port>`.
// Both instances start empty of business data; the files named empty.* rely on that.
const [kind, port] = process.argv.slice(2)
if (!kind || !port) throw new Error('usage: serve.ts <main|empty> <port>')

const name = `auteko_e2e_${kind}_test`
await recreateDatabase(name)
const pool = openPool(urlFor(name))
await migrate(pool)
await pool.close()

const root = path.resolve(import.meta.dirname, '../../..')
const child = spawn(
  process.execPath,
  [path.join(root, 'node_modules/next/dist/bin/next'), 'start', '-H', '127.0.0.1', '-p', port],
  {
    cwd: path.join(root, 'apps/web'),
    stdio: 'inherit',
    env: { ...process.env, DATABASE_URL: urlFor(name), PORT: port, HOST: '127.0.0.1' },
  },
)
for (const signal of ['SIGINT', 'SIGTERM'] as const) process.on(signal, () => child.kill(signal))
child.on('exit', (code) => process.exit(code ?? 1))
