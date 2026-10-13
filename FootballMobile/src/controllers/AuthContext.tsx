import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isAxiosError } from 'axios'
import type { User } from '../models'
import { setSessionExpiredHandler } from '../services/api'
import { authRepository, type RegisterInput } from '../services/repositories'
import { clearSession, readSession, saveSession, saveUser } from '../services/session'

type AuthStatus = 'loading' | 'signedOut' | 'signedIn'

interface AuthContextValue {
  status: AuthStatus
  user: User | null
  login: (email: string, password: string) => Promise<void>
  register: (input: RegisterInput) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading')
  const [user, setUser] = useState<User | null>(null)

  const logout = useCallback(async () => {
    await clearSession()
    setUser(null)
    setStatus('signedOut')
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const fresh = await authRepository.me()
      await saveUser(fresh)
      setUser(fresh)
    } catch {
      // Un fallo de red no cierra la sesion; el 401 lo maneja el interceptor.
    }
  }, [])

  useEffect(() => {
    setSessionExpiredHandler(() => {
      void logout()
    })
    return () => setSessionExpiredHandler(null)
  }, [logout])

  useEffect(() => {
    let cancelled = false
    const restore = async () => {
      const session = await readSession().catch(() => null)
      if (cancelled) return
      if (!session) {
        setStatus('signedOut')
        return
      }
      setUser(session.user)
      setStatus('signedIn')
      try {
        const fresh = await authRepository.me()
        await saveUser(fresh)
        if (!cancelled) setUser(fresh)
      } catch (err) {
        if (isAxiosError(err) && err.response?.status === 401 && !cancelled) await logout()
      }
    }
    void restore()
    return () => {
      cancelled = true
    }
  }, [logout])

  const login = useCallback(async (email: string, password: string) => {
    const session = await authRepository.login(email, password)
    await saveSession(session.token, session.user)
    setUser(session.user)
    setStatus('signedIn')
  }, [])

  const register = useCallback(async (input: RegisterInput) => {
    const session = await authRepository.register(input)
    await saveSession(session.token, session.user)
    setUser(session.user)
    setStatus('signedIn')
  }, [])

  const value = useMemo(
    () => ({ status, user, login, register, logout, refreshUser }),
    [status, user, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
