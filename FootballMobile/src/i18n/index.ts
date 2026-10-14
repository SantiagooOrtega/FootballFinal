import { en } from './en'
import { es, type TranslationKey } from './es'

export type Language = 'es' | 'en'
export type { TranslationKey }

const dictionaries: Record<Language, Record<TranslationKey, string>> = { es, en }

// El idioma activo vive en el modulo para que servicios y modelos (fuera de
// React) puedan traducir; los componentes se actualizan con useI18n().
let current: Language = 'es'

export function getLanguage(): Language {
  return current
}

export function setCurrentLanguage(language: Language): void {
  current = language
}

export function isTranslationKey(key: string): key is TranslationKey {
  return key in es
}

export function translate(key: TranslationKey, params?: Record<string, string | number>): string {
  const text = dictionaries[current][key]
  if (!params) return text
  return text.replace(/\{(\w+)\}/g, (_, name: string) => String(params[name] ?? `{${name}}`))
}

/** Idioma inicial según el dispositivo: inglés si el teléfono está en inglés, español en otro caso. */
export function detectDeviceLanguage(): Language {
  try {
    const locale = Intl.DateTimeFormat().resolvedOptions().locale
    return locale.toLowerCase().startsWith('en') ? 'en' : 'es'
  } catch {
    return 'es'
  }
}
