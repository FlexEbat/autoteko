import { readFileSync } from 'node:fs'
import path from 'node:path'
import { ESLint } from 'eslint'
import { beforeAll, describe, expect, test } from 'vitest'

const ROOT = path.resolve(import.meta.dirname, '../../..')
let eslint: ESLint

beforeAll(() => {
  eslint = new ESLint({ cwd: ROOT })
})

async function messages(fixture: string, virtualPath: string): Promise<string[]> {
  const code = readFileSync(path.join(import.meta.dirname, 'fixtures/lint', fixture), 'utf8')
  const [result] = await eslint.lintText(code, { filePath: path.join(ROOT, virtualPath) })
  return (result?.messages ?? []).map((m) => `${m.ruleId ?? 'parse'}: ${m.message}`)
}

const SERVER = 'apps/web/src/server/data/sample.ts'
const SCREEN = 'apps/web/src/components/ui/Sample.tsx'
const TEST = 'apps/web/tests/sample.test.ts'

describe('lint rules for unsafe constructs', () => {
  const rejected: [string, string, string, RegExp][] = [
    ['escaping bypass', 'jsx-html.fixture', SCREEN, /Escaping bypass/],
    ['template string in query', 'query-template.fixture', SERVER, /sql tag/],
    ['concatenation in query', 'query-concat.fixture', SERVER, /sql tag/],
    ['eval', 'eval.fixture', SERVER, /no-eval|no-implied-eval/],
    ['new Function', 'new-function.fixture', SERVER, /no-new-func/],
    ['child_process exec', 'exec.fixture', SERVER, /execFile/],
    ['forbidden xlsx import', 'forbidden-import.fixture', SERVER, /forbidden/],
    ['forbidden jsonwebtoken import', 'forbidden-import2.fixture', SERVER, /forbidden/],
    ['Math.random in server code', 'math-random.fixture', SERVER, /node:crypto/],
    ['console in server code', 'console.fixture', SERVER, /no-console/],
    ['test.skip', 'skip.fixture', TEST, /skip, only and todo/],
    ['describe.only', 'only.fixture', TEST, /skip, only and todo/],
    ['TODO comment', 'todo-comment.fixture', SERVER, /no-warning-comments/],
    ['FIXME comment', 'fixme-comment.fixture', SERVER, /no-warning-comments/],
    ['stub', 'stub.fixture', SERVER, /Stubs are forbidden/],
    ['non-Latin literal in code', 'non-latin.fixture', SERVER, /dictionary or domain-literals/],
  ]

  for (const [name, fixture, where, pattern] of rejected) {
    test(`S0A.15: ${name} is an error`, async () => {
      const found = await messages(fixture, where)
      expect(
        found.some((m) => pattern.test(m)),
        found.join(' | '),
      ).toBe(true)
    })
  }

  test('S0A.15: safe constructs pass', async () => {
    expect(await messages('query-sql-tag.fixture', SERVER)).toEqual([])
    expect(await messages('exec-file.fixture', SERVER)).toEqual([])
    expect(await messages('clean.fixture', SERVER)).toEqual([])
    expect(await messages('console.fixture', SCREEN)).toEqual([])
    expect(await messages('math-random.fixture', SCREEN)).toEqual([])
  })

  test('S0A.15: non-Latin text is allowed in dictionaries and domain-literals.ts only', async () => {
    expect(await messages('non-latin.fixture', 'apps/web/src/i18n/ru.ts')).toEqual([])
    expect(await messages('non-latin.fixture', 'packages/shared/src/domain-literals.ts')).toEqual([])
    expect((await messages('non-latin.fixture', 'apps/web/tests/x.test.ts')).length).toBeGreaterThan(0)
  })
})
