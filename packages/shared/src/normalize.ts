import { ALL_MODELS, CYRILLIC_LOOKALIKES, CYRILLIC_M } from './domain-literals.ts'

const SEPARATORS = /[\s._\-/\\]+/gu

// Search key: NFC, lower case, no separators, Cyrillic look-alikes folded to Latin.
export function normalizeKey(text: string): string {
  const lower = text.normalize('NFC').toLowerCase().replace(SEPARATORS, '').normalize('NFC')
  let key = ''
  for (const char of lower) key += CYRILLIC_LOOKALIKES[char] ?? char
  return key
}

// Engine model: Cyrillic capital M, upper case; the "all models" marker stays as is.
export function normalizeEngineModel(text: string): string {
  const trimmed = text.normalize('NFC').trim()
  if (trimmed.toLowerCase() === ALL_MODELS) return ALL_MODELS
  return trimmed.toUpperCase().replaceAll('M', CYRILLIC_M)
}
