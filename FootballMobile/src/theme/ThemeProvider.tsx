import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { darkPalette, lightPalette, type Palette } from './colors'
import { createType } from './typography'

export type ThemeMode = 'dark' | 'light'

const STORAGE_KEY = 'football_theme'

interface ThemeContextValue {
  mode: ThemeMode
  colors: Palette
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>('dark')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((stored) => {
        if (stored === 'light') setMode('light')
      })
      .catch(() => undefined)
      .finally(() => setReady(true))
  }, [])

  const toggleTheme = useCallback(() => {
    setMode((current) => {
      const next: ThemeMode = current === 'dark' ? 'light' : 'dark'
      AsyncStorage.setItem(STORAGE_KEY, next).catch(() => undefined)
      return next
    })
  }, [])

  const value = useMemo(
    () => ({ mode, colors: mode === 'dark' ? darkPalette : lightPalette, toggleTheme }),
    [mode, toggleTheme],
  )

  // Evita un destello del tema equivocado mientras se lee la preferencia guardada
  if (!ready) return null

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme debe usarse dentro de ThemeProvider')
  return ctx
}

/** Crea los estilos de un componente una sola vez por tema. */
export function useThemedStyles<T>(factory: (colors: Palette) => T): T {
  const { colors } = useTheme()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => factory(colors), [colors])
}

export function useType() {
  return useThemedStyles(createType)
}
