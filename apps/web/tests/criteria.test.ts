import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { SPEC_FORMAT } from '../../../packages/shared/src/domain-literals.ts'
import { findMissing, parseCriteria } from '../../../scripts/check-criteria.ts'

const SPEC = [
  `### ${SPEC_FORMAT.slice} X1: first`,
  `**${SPEC_FORMAT.criteria}:**`,
  '1. Works.',
  '2. Wraps over',
  '   two lines.',
  `3. Checked by a person. (${SPEC_FORMAT.manual})`,
  '4. Checked in CI. (CI: gate)',
  '**Tests:**',
  '1. not a criterion',
  `### ${SPEC_FORMAT.slice} X2A: second`,
  `**${SPEC_FORMAT.criteria}:**`,
  '1. Alpha.',
  '2. Beta.',
  `### ${SPEC_FORMAT.slice} X3: untouched`,
  `**${SPEC_FORMAT.criteria}:**`,
  '1. Gamma.',
].join('\n')

describe('check-criteria', () => {
  test('S0B.1: builds IDs from the slice label and item number', () => {
    const criteria = parseCriteria(SPEC)
    expect(criteria.map((c) => c.id)).toEqual([
      'SX1.1',
      'SX1.2',
      'SX1.3',
      'SX1.4',
      'SX2A.1',
      'SX2A.2',
      'SX3.1',
    ])
    expect(criteria.filter((c) => c.exempt).map((c) => c.id)).toEqual(['SX1.3', 'SX1.4'])
  })

  test('S0B.1: reports an ID that has no test', () => {
    const tests = ["test('SX1.1: does it', () => {})", "test('SX2A.1: alpha', () => {})"]
    expect(findMissing(parseCriteria(SPEC), tests)).toEqual(['SX1.2', 'SX2A.2'])
  })

  test('S0B.1: skips criteria marked manual or CI, and slices with no test yet', () => {
    const tests = [
      "test('SX1.1', () => {})",
      "test('SX1.2', () => {})",
      "test('SX2A.1', () => {})",
      "test('SX2A.2', () => {})",
    ]
    expect(findMissing(parseCriteria(SPEC), tests)).toEqual([])
  })

  test('S0B.1: accepts the dot, underscore and lower case spellings, and no prefix collisions', () => {
    const criteria = parseCriteria(SPEC)
    expect(findMissing(criteria, ["test('SX1_1', 1)", "test('sx1_2', 1)"])).toEqual([])
    expect(findMissing(criteria, ["test('SX11.1', 1)", "test('XSX1.2', 1)"])).toEqual([])
    expect(findMissing(criteria, ["test('SX1.1', 1)", "test('SX1.12', 1)"])).toEqual(['SX1.2'])
  })

  test('S0B.1: every started slice of the real tech.md has a test for each checkable criterion', () => {
    const spec = readFileSync(path.resolve(import.meta.dirname, '../../../tech.md'), 'utf8')
    const criteria = parseCriteria(spec)
    expect(criteria.length).toBeGreaterThan(100)
    const thisRepo = ['0A', '0B']
    expect(criteria.filter((c) => thisRepo.includes(c.slice)).length).toBe(26)
  })
})

describe('listTestFiles', () => {
  test('finds spec and test files in workspace tests and e2e folders only', async () => {
    const { mkdtempSync, mkdirSync, writeFileSync, rmSync } = await import('node:fs')
    const { tmpdir } = await import('node:os')
    const { listTestFiles } = await import('../../../scripts/check-criteria.ts')
    const root = mkdtempSync(path.join(tmpdir(), 'auteko-criteria-'))
    try {
      for (const dir of ['packages/p/tests/nested', 'apps/a/e2e', 'apps/a/tests/node_modules', 'apps/b'])
        mkdirSync(path.join(root, dir), { recursive: true })
      for (const file of [
        'packages/p/tests/nested/x.test.ts',
        'apps/a/e2e/y.spec.ts',
        'apps/a/tests/node_modules/z.test.ts',
        'packages/p/tests/helper.ts',
      ])
        writeFileSync(path.join(root, file), '')
      const found = listTestFiles(root)
        .map((file) => path.relative(root, file))
        .sort()
      expect(found).toEqual(['apps/a/e2e/y.spec.ts', 'packages/p/tests/nested/x.test.ts'])
    } finally {
      rmSync(root, { recursive: true, force: true })
    }
  })
})
