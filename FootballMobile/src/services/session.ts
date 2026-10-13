import * as SecureStore from 'expo-secure-store'
import type { User } from '../models'

const TOKEN_KEY = 'football_token'
const USER_KEY = 'football_user'

export async function readToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function readSession(): Promise<{ token: string; user: User } | null> {
  const [token, rawUser] = await Promise.all([
    SecureStore.getItemAsync(TOKEN_KEY),
    SecureStore.getItemAsync(USER_KEY),
  ])
  if (!token || !rawUser) return null
  return { token, user: JSON.parse(rawUser) as User }
}

export async function saveSession(token: string, user: User): Promise<void> {
  await Promise.all([
    SecureStore.setItemAsync(TOKEN_KEY, token),
    SecureStore.setItemAsync(USER_KEY, JSON.stringify(user)),
  ])
}

export async function saveUser(user: User): Promise<void> {
  await SecureStore.setItemAsync(USER_KEY, JSON.stringify(user))
}

export async function clearSession(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(TOKEN_KEY),
    SecureStore.deleteItemAsync(USER_KEY),
  ])
}
