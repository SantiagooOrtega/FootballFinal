import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { setApiLanguage } from '../services/api'
import {
  detectDeviceLanguage,
  setCurrentLanguage,
  translate,
  type Language,
  type TranslationKey,
} from './index'

const STORAGE_KEY = 'football_language'

interface I18nContextValue {
  language: Language
  setLanguage: (language: Language) => void
  t: (key: TranslationKey, params?: Record<string, string | number>) => string
}

const I18nContext = createContext<I18nContextValue | null>(null)

function applyLanguage(language: Language) {
  setCurrentLanguage(language)
  setApiLanguage(language)
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    const initial = detectDeviceLanguage()
    applyLanguage(initial)
    return initial
  })
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'es' || stored === 'en') {
          applyLanguage(stored)
          setLanguageState(stored)
        }
      })
      .catch(() => undefined)
      .finally(() => setReady(true))
  }, [])

  const setLanguage = useCallback((next: Language) => {
    applyLanguage(next)
    setLanguageState(next)
    AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined)
  }, [])

  // El valor cambia con el idioma, lo que vuelve a renderizar a quien use t()
  const value = useMemo<I18nContextValue>(
    () => ({ language, setLanguage, t: (key, params) => translate(key, params) }),
    [language, setLanguage],
  )

  if (!ready) return null

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n debe usarse dentro de I18nProvider')
  return ctx
}
