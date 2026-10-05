import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Interceptor: adjunta JWT a cada request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('football_token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Interceptor: maneja errores 401 globalmente
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const code = error.response?.data?.code
      if (code === 'TOKEN_EXPIRED' || code === 'INVALID_TOKEN') {
        localStorage.removeItem('football_token')
        localStorage.removeItem('football_user')
        window.location.href = '/login'
      }
    }
    return Promise.reject(error)
  }
)

export default api
