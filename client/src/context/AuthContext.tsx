import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import api from '../lib/api'
import { User, AuthState } from '../types'

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  username: string
  email: string
  password: string
  favorite_team?: string
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: true,
  })

  // Rehidratar sesión desde localStorage
  useEffect(() => {
    const token = localStorage.getItem('football_token')
    const userStr = localStorage.getItem('football_user')

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr) as User
        setState({ user, token, isAuthenticated: true, isLoading: false })
        // Verificar que el token sigue válido
        api.get('/auth/me').then((res) => {
          setState(prev => ({ ...prev, user: res.data.user, isLoading: false }))
          localStorage.setItem('football_user', JSON.stringify(res.data.user))
        }).catch(() => {
          localStorage.removeItem('football_token')
          localStorage.removeItem('football_user')
          setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
        })
      } catch {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    } else {
      setState(prev => ({ ...prev, isLoading: false }))
    }
  }, [])

  const login = async (email: string, password: string) => {
    const res = await api.post('/auth/login', { email, password })
    const { token, user } = res.data
    localStorage.setItem('football_token', token)
    localStorage.setItem('football_user', JSON.stringify(user))
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }

  const register = async (data: RegisterData) => {
    const res = await api.post('/auth/register', data)
    const { token, user } = res.data
    localStorage.setItem('football_token', token)
    localStorage.setItem('football_user', JSON.stringify(user))
    setState({ user, token, isAuthenticated: true, isLoading: false })
  }

  const logout = () => {
    localStorage.removeItem('football_token')
    localStorage.removeItem('football_user')
    setState({ user: null, token: null, isAuthenticated: false, isLoading: false })
  }

  const updateUser = (user: User) => {
    localStorage.setItem('football_user', JSON.stringify(user))
    setState(prev => ({ ...prev, user }))
  }

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return ctx
}
