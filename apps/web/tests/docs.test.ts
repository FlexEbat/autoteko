import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { SPEC_FORMAT } from '../../../packages/shared/src/domain-literals.ts'
import { checkDocs } from '../../../scripts/check-docs.ts'

const F = SPEC_FORMAT
const spec = (mode: string, extra = '', languages = 'ru, en'): string =>
  [
    `# tech`,
    `**${F.version}: v2** (2026-10-12)`,
    `**${F.localization}: ${mode}**`,
    `| ${F.sourceLanguage} \`tech.md\` | ru |`,
    `| ${F.documentLanguages} | ${languages} |`,
    '## One',
    '```',
    'code',
    '```',
    extra,
  ].join('\n')

const hash = (text: string): string =>
  createHash('sha256').update(text.replaceAll('\r\n', '\n')).digest('hex').slice(0, 12)
const header = (source: string): string => `<!-- i18n-source: tech.md sha256:${hash(source)} -->`

describe('check-docs', () => {
  test('S0B.2: the deferred mode passes when there are no placeholders', () => {
    expect(checkDocs(spec(F.deferred))).toEqual([])
  })

  test('S0B.2: any mode value other than deferred or enabled is an error', () => {
    for (const mode of ['draft', '', 'on']) expect(checkDocs(spec(mode)).join()).toMatch(/localization mode/)
    expect(checkDocs('no mode line here').join()).toMatch(/found "nothing"/)
  })

  test('S0B.2: an unfilled placeholder is an error in every mode', () => {
    for (const mode of [F.deferred, F.enabled])
      expect(checkDocs(spec(mode, '{{name}}')).join()).toMatch(/placeholder/)
  })

  test('S0B.2: a template mark at the start of a line is an error in every mode', () => {
    for (const mode of [F.deferred, F.enabled])
      expect(checkDocs(spec(mode, `${F.templateMark}: remove me`)).join()).toMatch(/template mark/)
    expect(checkDocs(spec(F.deferred, `text ${F.templateMark}: inside`))).toEqual([])
  })

  const original = spec(F.enabled)
  const translation = (changes: (text: string) => string = (t) => t): string =>
    `${header(original)}\n${changes(original)}`

  test('S0B.2: enabled mode accepts a matching translation', () => {
    expect(checkDocs(original, { 'tech.en.md': translation() })).toEqual([])
  })

  test('S0B.2: enabled mode reports a missing translation', () => {
    expect(checkDocs(original, {}).join()).toMatch(/tech\.en\.md: translation is missing/)
  })

  test('S0B.2: enabled mode reports a stale source hash', () => {
    const stale = `<!-- i18n-source: tech.md sha256:000000000000 -->\n${original}`
    expect(checkDocs(original, { 'tech.en.md': stale }).join()).toMatch(/hash/)
    expect(checkDocs(original, { 'tech.en.md': original }).join()).toMatch(/hash/)
  })

  test('S0B.2: enabled mode reports a different heading structure', () => {
    expect(checkDocs(original, { 'tech.en.md': translation((t) => `${t}\n### extra`) }).join()).toMatch(
      /heading structure/,
    )
  })

  test('S0B.2: enabled mode reports a different number of code blocks', () => {
    expect(
      checkDocs(original, { 'tech.en.md': translation((t) => `${t}\n\`\`\`\nmore\n\`\`\``) }).join(),
    ).toMatch(/code blocks/)
  })

  test('S0B.2: enabled mode reports a different version line', () => {
    expect(checkDocs(original, { 'tech.en.md': translation((t) => t.replace('v2', 'v3')) }).join()).toMatch(
      /version line/,
    )
  })

  test('S0B.2: the hash ignores the line ending style of the source', () => {
    const crlf = original.replaceAll('\n', '\r\n')
    expect(checkDocs(crlf, { 'tech.en.md': `${header(original)}\n${original}` })).toEqual([])
  })

  test('S0B.2: enabled mode checks the other documents that exist', () => {
    const readme = '# Readme\n'
    const files = { 'README.md': readme, 'tech.en.md': translation() }
    expect(checkDocs(original, files).join()).toMatch(/README\.en\.md: translation is missing/)
    const ok = {
      ...files,
      'README.en.md': `<!-- i18n-source: README.md sha256:${hash(readme)} -->\n# Readme\n`,
    }
    expect(checkDocs(original, ok)).toEqual([])
  })

  test('S0B.2: a single language needs no translations', () => {
    expect(checkDocs(spec(F.enabled, '', 'ru'))).toEqual([])
  })

  test('S0B.11: the real tech.md passes', () => {
    const text = readFileSync(path.resolve(import.meta.dirname, '../../../tech.md'), 'utf8')
    expect(checkDocs(text)).toEqual([])
  })
})
