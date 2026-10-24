import { readFileSync } from 'node:fs'

const FORMAT = /^(feat|fix|test|refactor|chore|docs)\(([a-z0-9-]+)\): (.+)$/
const SERVICE = /^(Merge |Revert ")/
const MAX_SUMMARY = 50

// Returns an error text, or undefined when the first line follows the convention (tech.md, section 11).
export function checkCommitMessage(message: string): string | undefined {
  const first = message
    .split('\n')
    .map((line) => line.trimEnd())
    .find((line) => line !== '' && !line.startsWith('#'))
  if (first === undefined) return 'empty commit message'
  if (SERVICE.test(first)) return undefined
  const match = FORMAT.exec(first)
  if (!match)
    return 'expected "type(scope): summary" with type feat|fix|test|refactor|chore|docs and a lowercase scope'
  const summary = match[3] ?? ''
  if (/^\p{Lu}/u.test(summary)) return 'summary must start with a lowercase letter'
  if (summary.endsWith('.')) return 'summary must not end with a period'
  if ([...summary].length > MAX_SUMMARY) return `summary is longer than ${MAX_SUMMARY} characters`
  return undefined
}

/* v8 ignore start -- command-line entry, run by the commit-msg hook */
if (import.meta.main) {
  const file = process.argv[2]
  const problem = checkCommitMessage(file ? readFileSync(file, 'utf8') : '')
  if (problem) {
    process.stderr.write(`commit message rejected: ${problem}\n`)
    process.exitCode = 1
  }
}
/* v8 ignore stop */
