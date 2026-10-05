import { NavLink, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { LayoutDashboard, Calendar, Trophy, User, LogOut, Zap } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/matches', icon: Calendar, label: 'Partidos' },
  { to: '/leaderboard', icon: Trophy, label: 'Clasificación' },
  { to: '/profile', icon: User, label: 'Mi Perfil' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <aside className="hidden lg:flex flex-col fixed left-0 top-0 h-full w-64 bg-dark-800/95 backdrop-blur-md border-r border-dark-500/50 z-40">
      {/* Logo */}
      <div className="p-6 border-b border-dark-500/50">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-700 rounded-xl flex items-center justify-center shadow-glow">
            <span className="text-xl">⚽</span>
          </div>
          <div>
            <h1 className="font-display font-bold text-white text-lg leading-none">FootballAI</h1>
            <p className="text-xs text-primary-400 font-medium mt-0.5">Powered by IA</p>
          </div>
        </motion.div>
      </div>

      {/* Navegación */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item, i) => (
          <motion.div
            key={item.to}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.07 }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200',
                  isActive
                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/30 shadow-glow/50'
                    : 'text-gray-400 hover:text-white hover:bg-dark-700'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    size={18}
                    className={clsx(isActive ? 'text-primary-400' : 'text-gray-500')}
                  />
                  {item.label}
                  {isActive && (
                    <motion.div
                      layoutId="activeNav"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-primary-400"
                    />
                  )}
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Usuario y Logout */}
      <div className="p-4 border-t border-dark-500/50">
        {/* Stats rápidas */}
        <div className="glass-card p-3 mb-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={14} className="text-primary-400" />
            <span className="text-xs text-gray-400 font-medium">Mis stats</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="text-center">
              <p className="text-lg font-bold text-primary-400">{user?.points ?? 0}</p>
              <p className="text-xs text-gray-500">Puntos</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-bold text-white">{user?.accuracy ?? 0}%</p>
              <p className="text-xs text-gray-500">Precisión</p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-dark-700 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-primary-800 rounded-full flex items-center justify-center text-sm font-bold">
            {user?.username?.[0]?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">{user?.username}</p>
            <p className="text-xs text-gray-500 truncate">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={handleLogout}
          className="mt-2 w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-400
                     hover:text-red-400 hover:bg-red-500/10 transition-all duration-200 text-sm font-medium"
        >
          <LogOut size={16} />
          Cerrar sesión
        </button>
      </div>
    </aside>
  )
}
