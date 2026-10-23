import { readdirSync, readFileSync, statSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, test } from 'vitest'
import { DOMAIN_ERROR_CODES } from '@auteko/shared/errors'
import { translate, type SharedKey } from '@auteko/shared/i18n'
import { ru } from '../../../packages/shared/src/i18n/ru.ts'
import { ruWeb } from '../src/i18n/ru.ts'
import { t } from '../src/i18n/index.ts'

const ROOT = path.resolve(import.meta.dirname, '../../..')
const NON_LATIN_LETTER = /(?!\p{Script=Latin})\p{L}/u
const EXEMPT = (file: string): boolean =>
  file.includes(`${path.sep}i18n${path.sep}`) || file.endsWith('domain-literals.ts')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name)
    if (name === 'node_modules' || name === '.next') return []
    if (statSync(full).isDirectory()) return sources(full)
    return /\.(ts|tsx|css)$/.test(name) ? [full] : []
  })
}

const placeholders = (text: string): string[] => [...text.matchAll(/\{(\w+)\}/g)].map((m) => m[1]!).sort()

describe('dictionaries', () => {
  const all: Record<string, string> = { ...ru, ...ruWeb }

  test('S0A.13: every value is non-empty', () => {
    for (const [key, value] of Object.entries(all)) expect(value.trim(), key).not.toBe('')
  })

  test('S0A.13: placeholders are well formed and filled by translate', () => {
    for (const [key, value] of Object.entries(all))
      expect(value.replace(/\{\w+\}/g, ''), key).not.toMatch(/[{}]/)
    expect(placeholders(ru['error.account_locked'])).toEqual(['minutes'])
    expect(translate('ru', 'error.account_locked', { minutes: 15 })).toContain('15')
    expect(translate('ru', 'error.account_locked')).toContain('{minutes}')
    expect(t('ru', 'home.heading')).toBe(ruWeb['home.heading'])
    expect(t('ru', 'stock.balance', { balance: 3 })).toContain('3')
  })

  test('S0A.13: every domain error code has an error.<code> entry', () => {
    for (const code of DOMAIN_ERROR_CODES) expect(ru[`error.${code}` as SharedKey], code).toBeTruthy()
  })

  test('S0A.13: non-Latin letters appear only in dictionaries and domain-literals.ts', () => {
    const offenders = [
      ...sources(path.join(ROOT, 'packages/shared/src')),
      ...sources(path.join(ROOT, 'apps/web/src')),
    ].filter((file) => !EXEMPT(file) && NON_LATIN_LETTER.test(readFileSync(file, 'utf8')))
    expect(offenders).toEqual([])
  })
})
