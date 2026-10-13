import axios, { isAxiosError } from 'axios'
import Constants from 'expo-constants'
import { readToken } from './session'

const API_PORT = 5001

// En Expo Go el servidor corre en la misma maquina que Metro, asi que su IP
// se toma del hostUri del bundler. EXPO_PUBLIC_API_URL permite sobreescribirla.
function resolveBaseUrl(): string {
  const fromEnv = process.env.EXPO_PUBLIC_API_URL
  if (fromEnv) return fromEnv
  const host = Constants.expoConfig?.hostUri?.split(':')[0] ?? 'localhost'
  return `http://${host}:${API_PORT}/api`
}

const AUTH_ERROR_CODES = ['TOKEN_EXPIRED', 'INVALID_TOKEN', 'USER_NOT_FOUND', 'ACCOUNT_DISABLED']

let onSessionExpired: (() => void) | null = null

export function setSessionExpiredHandler(handler: (() => void) | null) {
  onSessionExpired = handler
}

export const api = axios.create({
  baseURL: resolveBaseUrl(),
  timeout: 12000,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use(async (config) => {
  const token = await readToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (isAxiosError(error) && error.response?.status === 401) {
      const code = error.response.data?.code
      if (AUTH_ERROR_CODES.includes(code)) onSessionExpired?.()
    }
    return Promise.reject(error)
  },
)

export function errorMessage(error: unknown, fallback = 'Algo salió mal. Intenta de nuevo.'): string {
  if (!isAxiosError(error)) return fallback
  if (!error.response) return 'No se pudo conectar con el servidor. Revisa tu red.'
  const data = error.response.data
  return data?.details?.[0]?.message ?? data?.error ?? fallback
}
