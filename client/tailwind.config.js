/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Los colores salen de variables CSS (ver index.css) para soportar modo claro y oscuro
      colors: {
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        primary: {
          50:  '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: 'rgb(var(--c-primary-300) / <alpha-value>)',
          400: 'rgb(var(--c-primary-400) / <alpha-value>)',
          500: 'rgb(var(--c-primary-500) / <alpha-value>)',
          600: 'rgb(var(--c-primary-600) / <alpha-value>)',
          700: 'rgb(var(--c-primary-700) / <alpha-value>)',
          800: 'rgb(var(--c-primary-800) / <alpha-value>)',
          900: '#14532d',
        },
        dark: {
          900: 'rgb(var(--c-dark-900) / <alpha-value>)',
          800: 'rgb(var(--c-dark-800) / <alpha-value>)',
          700: 'rgb(var(--c-dark-700) / <alpha-value>)',
          600: 'rgb(var(--c-dark-600) / <alpha-value>)',
          500: 'rgb(var(--c-dark-500) / <alpha-value>)',
          400: 'rgb(var(--c-dark-400) / <alpha-value>)',
          300: 'rgb(var(--c-dark-300) / <alpha-value>)',
        },
        gray: {
          300: 'rgb(var(--c-gray-300) / <alpha-value>)',
          400: 'rgb(var(--c-gray-400) / <alpha-value>)',
          500: 'rgb(var(--c-gray-500) / <alpha-value>)',
          600: 'rgb(var(--c-gray-600) / <alpha-value>)',
        },
        red: { 400: 'rgb(var(--c-red-400) / <alpha-value>)' },
        blue: { 400: 'rgb(var(--c-blue-400) / <alpha-value>)' },
        orange: { 400: 'rgb(var(--c-orange-400) / <alpha-value>)' },
        yellow: { 400: 'rgb(var(--c-yellow-400) / <alpha-value>)' },
        purple: { 400: 'rgb(var(--c-purple-400) / <alpha-value>)' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Plus Jakarta Sans', 'Inter', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-pattern': "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%2322c55e' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'shimmer': 'shimmer 2s infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      boxShadow: {
        'glow': '0 0 20px rgba(34, 197, 94, 0.3)',
        'glow-lg': '0 0 40px rgba(34, 197, 94, 0.4)',
        'card': 'var(--shadow-card)',
      },
    },
  },
  plugins: [],
}
