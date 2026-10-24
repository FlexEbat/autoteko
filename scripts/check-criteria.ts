import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { SPEC_FORMAT } from '../packages/shared/src/domain-literals.ts'

export interface Criterion {
  id: string
  slice: string
  number: number
  // Criteria marked as manual or CI are checked by a person or a CI job, not by a test.
  exempt: boolean
}

const ITEM = /^\d+\.\s/
const EXEMPT_MARK = new RegExp(`\\((?:${SPEC_FORMAT.manual}|CI:[^)]*)\\)\\.?\\s*$`)

// Reads section 15 of tech.md and returns one entry per acceptance criterion.
export function parseCriteria(spec: string): Criterion[] {
  const lines = spec.split('\n')
  const result: Criterion[] = []
  let slice: string | undefined
  let inCriteria = false
  let current: { number: number; text: string } | undefined
  const flush = (): void => {
    if (slice !== undefined && current) {
      result.push({
        id: `S${slice}.${current.number}`,
        slice,
        number: current.number,
        exempt: EXEMPT_MARK.test(current.text.trim()),
      })
    }
    current = undefined
  }
  for (const line of lines) {
    const heading = new RegExp(`^### ${SPEC_FORMAT.slice} ([0-9A-Z]+):`).exec(line)
    if (heading || /^#{1,3} /.test(line)) {
      flush()
      slice = heading?.[1]
      inCriteria = false
      continue
    }
    if (line.startsWith('**')) {
      flush()
      inCriteria = line.includes(SPEC_FORMAT.criteria)
      continue
    }
    if (!inCriteria || slice === undefined) continue
    if (ITEM.test(line)) {
      flush()
      current = { number: Number.parseInt(line, 10), text: line }
    } else if (current && line.trim() !== '') {
      current.text += ` ${line.trim()}`
    }
  }
  flush()
  return result
}

function mentions(source: string, criterion: Criterion): boolean {
  const slice = criterion.slice.toLowerCase()
  const pattern = new RegExp(`(^|[^a-z0-9])s${slice}[._]${criterion.number}(?![0-9])`, 'i')
  return pattern.test(source)
}

// Returns the IDs of criteria that have no test. A slice that has no test at all has not been
// started yet and is not reported; once one criterion of a slice has a test, all must have one.
export function findMissing(criteria: readonly Criterion[], testSources: readonly string[]): string[] {
  const started = new Set(
    criteria.filter((c) => testSources.some((source) => mentions(source, c))).map((c) => c.slice),
  )
  return criteria
    .filter((c) => !c.exempt && started.has(c.slice) && !testSources.some((source) => mentions(source, c)))
    .map((c) => c.id)
}

export function listTestFiles(root: string): string[] {
  const found: string[] = []
  const visit = (dir: string): void => {
    for (const name of readdirSync(dir)) {
      if (name === 'node_modules' || name === '.next' || name === 'fixtures') continue
      const full = path.join(dir, name)
      if (statSync(full).isDirectory()) visit(full)
      else if (/\.(test|spec)\.ts$/.test(name)) found.push(full)
    }
  }
  for (const workspace of ['packages', 'apps']) {
    for (const entry of readdirSync(path.join(root, workspace))) {
      for (const dir of ['tests', 'e2e']) {
        const full = path.join(root, workspace, entry, dir)
        try {
          visit(full)
        } catch {
          // The workspace has no such directory.
        }
      }
    }
  }
  return found
}

/* v8 ignore start -- command-line entry, exercised by the `criteria` npm task in CI */
if (import.meta.main) {
  const root = path.resolve(import.meta.dirname, '..')
  const criteria = parseCriteria(readFileSync(path.join(root, 'tech.md'), 'utf8'))
  const sources = listTestFiles(root).map((file) => readFileSync(file, 'utf8'))
  const missing = findMissing(criteria, sources)
  if (missing.length > 0) {
    process.stderr.write(`criteria without a test: ${missing.join(', ')}\n`)
    process.exitCode = 1
  }
}
/* v8 ignore stop */
