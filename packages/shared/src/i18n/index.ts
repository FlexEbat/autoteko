import { ru } from './ru.ts'

export type Lang = 'ru'
export type SharedKey = keyof typeof ru

const DICTIONARIES: Readonly<Record<Lang, Readonly<Record<SharedKey, string>>>> = { ru }

// The language is a parameter: there is no global "current language".
export function translate(
  lang: Lang,
  key: SharedKey,
  params: Readonly<Record<string, string | number>> = {},
): string {
  return DICTIONARIES[lang][key].replace(/\{(\w+)\}/g, (placeholder, name: string) => {
    const value = params[name]
    return value === undefined ? placeholder : String(value)
  })
}
