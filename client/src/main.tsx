import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import App from './App'
import { ThemeProvider } from './context/ThemeContext'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: 'rgb(var(--c-dark-700))',
            color: 'rgb(var(--c-ink))',
            border: '1px solid rgb(var(--c-dark-500))',
            borderRadius: '12px',
            fontSize: '14px',
          },
          success: {
            iconTheme: { primary: '#22c55e', secondary: 'rgb(var(--c-dark-900))' },
          },
          error: {
            iconTheme: { primary: '#ef4444', secondary: 'rgb(var(--c-dark-900))' },
          },
        }}
      />
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
