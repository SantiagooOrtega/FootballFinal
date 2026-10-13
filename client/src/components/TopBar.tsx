import { Bell, Search } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useLocation } from 'react-router-dom'
import ThemeToggle from './ThemeToggle'

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/matches': 'Partidos',
  '/leaderboard': 'Clasificación',
  '/profile': 'Mi Perfil',
}

export default function TopBar() {
  const { user } = useAuth()
  const location = useLocation()

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'FootballAI'

  return (
    <header className="sticky top-0 z-30 bg-dark-800/80 backdrop-blur-md border-b border-dark-500/50 px-4 lg:px-8 py-4">
      <div className="flex items-center justify-between">
        {/* Título */}
        <div className="flex items-center gap-3">
          <div className="lg:hidden w-8 h-8 bg-primary-500/20 rounded-lg flex items-center justify-center">
            <span className="text-base">⚽</span>
          </div>
          <h2 className="text-lg font-display font-bold text-ink">{title}</h2>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-dark-600 transition-colors">
            <Search size={18} />
          </button>
          <button className="p-2 rounded-lg text-gray-400 hover:text-ink hover:bg-dark-600 transition-colors relative">
            <Bell size={18} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-primary-500 rounded-full" />
          </button>
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-white text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
        </div>
      </div>
    </header>
  )
}
