import { createHash } from 'node:crypto'
import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { SPEC_FORMAT } from '../packages/shared/src/domain-literals.ts'

export const DOCUMENTS = [
  'tech.md',
  'README.md',
  'CONTRIBUTING.md',
  'SECURITY.md',
  'CHANGELOG.md',
  'docs/OPERATIONS.md',
]

const MODE_LINE = new RegExp(`^\\**${SPEC_FORMAT.localization}:\\s*([^*\\n]*?)\\s*\\**\\s*$`, 'm')
const VERSION_LINE = new RegExp(`^\\*\\*${SPEC_FORMAT.version}:[^\\n]*$`, 'm')
const HASH_LINE = /^<!-- i18n-source: (\S+) sha256:([0-9a-f]{12}) -->/

function normalize(text: string): string {
  return text.replaceAll('\r\n', '\n')
}

function hashOf(text: string): string {
  return createHash('sha256').update(normalize(text)).digest('hex').slice(0, 12)
}

function tableValue(spec: string, label: string): string | undefined {
  const row = spec.split('\n').find((line) => line.startsWith(`| ${label}`))
  return row?.split('|')[2]?.trim()
}

// Headings and code blocks outside fenced blocks, in order.
function structure(text: string): { headings: string[]; fences: number } {
  const headings: string[] = []
  let fences = 0
  let inFence = false
  for (const line of normalize(text).split('\n')) {
    if (line.startsWith('```')) {
      if (!inFence) fences += 1
      inFence = !inFence
    } else if (!inFence && /^#{1,6} /.test(line)) {
      headings.push(/^#+/.exec(line)?.[0] ?? '')
    }
  }
  return { headings, fences }
}

// Checks tech.md and, when localization is enabled, its translations. `files` maps a path
// relative to the repository root to its text. Returns one message per problem.
export function checkDocs(spec: string, files: Readonly<Record<string, string>> = {}): string[] {
  const problems: string[] = []
  const mode = MODE_LINE.exec(spec)?.[1]
  if (mode !== SPEC_FORMAT.deferred && mode !== SPEC_FORMAT.enabled) {
    problems.push(
      `localization mode must be "${SPEC_FORMAT.deferred}" or "${SPEC_FORMAT.enabled}", found "${mode ?? 'nothing'}"`,
    )
  }
  if (spec.includes('{{')) problems.push('tech.md has an unfilled placeholder')
  if (new RegExp(`^${SPEC_FORMAT.templateMark}:`, 'm').test(spec))
    problems.push('tech.md has a template mark at the start of a line')
  if (mode !== SPEC_FORMAT.enabled) return problems

  const source = tableValue(spec, SPEC_FORMAT.sourceLanguage)?.replaceAll('`', '') ?? ''
  const languages = (tableValue(spec, SPEC_FORMAT.documentLanguages) ?? '').split(/[,\s]+/).filter(Boolean)
  for (const language of languages.filter((l) => l !== source)) {
    for (const doc of DOCUMENTS) {
      const original = doc === 'tech.md' ? spec : files[doc]
      if (original === undefined) continue
      const translationPath = doc.replace(/\.md$/, `.${language}.md`)
      const translation = files[translationPath]
      if (translation === undefined) {
        problems.push(`${translationPath}: translation is missing`)
        continue
      }
      const hash = HASH_LINE.exec(normalize(translation).split('\n')[0] ?? '')?.[2]
      if (hash !== hashOf(original))
        problems.push(`${translationPath}: source hash in the header is out of date`)
      const a = structure(original)
      const b = structure(translation)
      if (a.headings.join(',') !== b.headings.join(','))
        problems.push(`${translationPath}: heading structure differs from the source`)
      if (a.fences !== b.fences)
        problems.push(`${translationPath}: number of code blocks differs from the source`)
      if (VERSION_LINE.exec(normalize(original))?.[0] !== VERSION_LINE.exec(normalize(translation))?.[0]) {
        problems.push(`${translationPath}: version line differs from the source`)
      }
    }
  }
  return problems
}

/* v8 ignore start -- command-line entry, exercised by the `docs` npm task in CI */
if (import.meta.main) {
  const root = path.resolve(import.meta.dirname, '..')
  const read = (file: string): string | undefined => {
    const full = path.join(root, file)
    return existsSync(full) ? readFileSync(full, 'utf8') : undefined
  }
  const files: Record<string, string> = {}
  for (const doc of DOCUMENTS) {
    for (const name of [
      doc,
      ...['en', 'de', 'fr', 'es', 'zh'].map((l) => doc.replace(/\.md$/, `.${l}.md`)),
    ]) {
      const text = read(name)
      if (text !== undefined) files[name] = text
    }
  }
  const problems = checkDocs(read('tech.md') ?? '', files)
  if (problems.length > 0) {
    process.stderr.write(`${problems.join('\n')}\n`)
    process.exitCode = 1
  }
}
/* v8 ignore stop */
