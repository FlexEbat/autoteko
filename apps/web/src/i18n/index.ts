import { translate as translateShared, type Lang, type SharedKey } from '@auteko/shared/i18n'
import { ruWeb } from './ru.ts'

export type WebKey = keyof typeof ruWeb
export type Key = WebKey | SharedKey

const WEB: Readonly<Record<Lang, Readonly<Record<WebKey, string>>>> = { ru: ruWeb }

export const DEFAULT_LANG: Lang = 'ru'

function isWebKey(key: Key): key is WebKey {
  return key in ruWeb
}

// The caller passes the language. Screen keys live here, shared keys in the shared package.
export function t(lang: Lang, key: Key, params: Readonly<Record<string, string | number>> = {}): string {
  if (!isWebKey(key)) return translateShared(lang, key, params)
  return WEB[lang][key].replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name]
    return value === undefined ? placeholder : String(value)
  })
}
