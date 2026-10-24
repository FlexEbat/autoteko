// The only file besides the dictionaries that may hold non-Latin letters.

// Marker for "applies to all engine models".
export const ALL_MODELS = 'все'

// Cyrillic capital M used in engine model names such as 12М55.
export const CYRILLIC_M = 'М'

// Cyrillic lowercase letters that look like Latin ones, mapped to the Latin form.
export const CYRILLIC_LOOKALIKES: Readonly<Record<string, string>> = {
  а: 'a',
  в: 'b',
  е: 'e',
  к: 'k',
  м: 'm',
  н: 'h',
  о: 'o',
  р: 'p',
  с: 'c',
  т: 't',
  х: 'x',
}

// Words of the tech.md format that the check scripts in scripts/ look for.
export const SPEC_FORMAT = {
  slice: 'Слайс',
  criteria: 'Критерии приёмки',
  manual: 'ручной',
  localization: 'Локализация',
  deferred: 'отложена',
  enabled: 'включена',
  templateMark: 'ШАБЛОН',
  version: 'Версия',
  sourceLanguage: 'язык исходника',
  documentLanguages: 'языки продукта и документов',
} as const
