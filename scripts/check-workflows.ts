import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

const PINNED = /^\s*-?\s*uses:\s*([^\s#]+)@([0-9a-f]{40})\s+#\s*\S+/
const USES = /^\s*-?\s*uses:\s*(\S+)/

// Checks workflow files (name -> text) and returns one message per problem (tech.md, section 20).
export function checkWorkflows(files: Readonly<Record<string, string>>): string[] {
  const problems: string[] = []
  for (const [name, text] of Object.entries(files)) {
    const lines = text.split('\n')
    lines.forEach((line, index) => {
      const where = `${name}:${index + 1}`
      const uses = USES.exec(line)
      if (uses && !uses[1]?.startsWith('./') && !PINNED.test(line)) {
        problems.push(`${where}: action must be pinned to a full commit SHA with the version in a comment`)
      }
      if (/pull_request_target/.test(line)) problems.push(`${where}: pull_request_target is forbidden`)
      if (/write-all/.test(line)) problems.push(`${where}: write-all is forbidden`)
    })
    const start = lines.findIndex((line) => /^permissions:/.test(line))
    if (start === -1) {
      problems.push(`${name}: top-level permissions are missing`)
      continue
    }
    const body: string[] = []
    for (const line of lines.slice(start + 1)) {
      if (line.trim() === '') continue
      if (!/^\s/.test(line)) break
      body.push(line.trim())
    }
    const inline = (lines[start] ?? '').slice('permissions:'.length).trim()
    if (inline !== '' || body.length !== 1 || body[0] !== 'contents: read') {
      problems.push(`${name}: top-level permissions must be exactly "contents: read"`)
    }
  }
  return problems
}

/* v8 ignore start -- command-line entry, exercised by the `gate` npm task in CI */
if (import.meta.main) {
  const dir = path.resolve(import.meta.dirname, '../.github/workflows')
  const files = Object.fromEntries(
    readdirSync(dir)
      .filter((file) => /\.ya?ml$/.test(file))
      .map((file) => [file, readFileSync(path.join(dir, file), 'utf8')]),
  )
  const problems = checkWorkflows(files)
  if (problems.length > 0) {
    process.stderr.write(`${problems.join('\n')}\n`)
    process.exitCode = 1
  }
}
/* v8 ignore stop */
