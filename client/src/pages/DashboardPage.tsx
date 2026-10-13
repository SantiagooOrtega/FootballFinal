import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Brain, Target, Trophy, TrendingUp, ChevronRight, Calendar } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Match } from '../types'
import MatchCard from '../components/MatchCard'

export default function DashboardPage() {
  const { user } = useAuth()
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/matches/today')
      .then(res => setMatches(res.data.matches ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }, [])

  const stats = [
    {
      icon: Target,
      label: 'Total predicciones',
      value: user?.total_predictions ?? 0,
      color: 'text-blue-400',
      bg: 'bg-blue-500/10',
      border: 'border-blue-500/20',
    },
    {
      icon: Trophy,
      label: 'Puntos totales',
      value: user?.points ?? 0,
      color: 'text-yellow-400',
      bg: 'bg-yellow-500/10',
      border: 'border-yellow-500/20',
    },
    {
      icon: TrendingUp,
      label: 'Precisión',
      value: `${user?.accuracy ?? 0}%`,
      color: 'text-primary-400',
      bg: 'bg-primary-500/10',
      border: 'border-primary-500/20',
    },
    {
      icon: Brain,
      label: 'Aciertos',
      value: user?.correct_predictions ?? 0,
      color: 'text-purple-400',
      bg: 'bg-purple-500/10',
      border: 'border-purple-500/20',
    },
  ]

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero saludo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden glass-card p-6 lg:p-8"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-transparent" />
        <div className="absolute right-0 top-0 w-64 h-full opacity-5">
          <span className="text-[180px] leading-none">⚽</span>
        </div>
        <div className="relative">
          <p className="text-primary-400 text-sm font-medium mb-1">Bienvenido de vuelta</p>
          <h1 className="text-3xl font-display font-bold text-ink">
            {user?.username} 👋
          </h1>
          <p className="text-gray-400 mt-2 text-sm max-w-md">
            Hay <span className="text-ink font-semibold">{matches.length} partidos</span> próximos.
            La IA ya tiene sus predicciones listas.
          </p>
          <Link
            to="/matches"
            className="btn-primary inline-flex items-center gap-2 mt-4 text-sm px-5 py-2.5"
          >
            Ver partidos
            <ChevronRight size={16} />
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.07 }}
            className={`glass-card p-4 lg:p-5 border ${stat.border} hover:scale-[1.02] transition-transform duration-200`}
          >
            <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
              <stat.icon size={20} className={stat.color} />
            </div>
            <p className={`text-2xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Partidos próximos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar size={18} className="text-primary-400" />
            <h2 className="section-title">Partidos de hoy</h2>
          </div>
          <Link
            to="/matches"
            className="text-sm text-primary-400 hover:text-primary-300 flex items-center gap-1 transition-colors"
          >
            Ver todos <ChevronRight size={14} />
          </Link>
        </div>

        {loading ? (
          <div className="grid gap-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="skeleton h-32 w-full rounded-2xl" />
            ))}
          </div>
        ) : matches.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <span className="text-5xl mb-4 block">🏟️</span>
            <p className="text-gray-400">No hay partidos programados para hoy</p>
            <Link to="/matches" className="btn-secondary inline-flex mt-4 text-sm px-5 py-2.5">
              Ver todos los partidos
            </Link>
          </div>
        ) : (
          <div className="grid gap-3">
            {matches.slice(0, 4).map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>
        )}
      </div>

      {/* Banner IA */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 border border-primary-500/20 bg-gradient-to-r from-primary-500/5 to-transparent"
      >
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary-500/20 rounded-xl flex items-center justify-center shrink-0">
            <Brain size={24} className="text-primary-400" />
          </div>
          <div>
            <h3 className="font-display font-bold text-ink mb-1">IA de Pronósticos</h3>
            <p className="text-gray-400 text-sm">
              Nuestro modelo analiza estadísticas de equipos, forma reciente, historial de enfrentamientos
              y más de 20 variables para generar predicciones precisas. Próximamente integrado con Google Gemini.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
