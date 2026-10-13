import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Search, Filter, RefreshCw } from 'lucide-react'
import api from '../lib/api'
import { Match } from '../types'
import MatchCard from '../components/MatchCard'
import clsx from 'clsx'

const STATUS_FILTERS = [
  { value: '', label: 'Todos' },
  { value: 'scheduled', label: 'Programados' },
  { value: 'live', label: '🔴 En vivo' },
  { value: 'finished', label: 'Finalizados' },
]

export default function MatchesPage() {
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')
  const [search, setSearch] = useState('')

  const fetchMatches = (s?: string) => {
    setLoading(true)
    const params = new URLSearchParams()
    if (s ?? status) params.set('status', s ?? status)
    api.get(`/matches?${params}`)
      .then(res => setMatches(res.data.matches ?? []))
      .catch(() => setMatches([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchMatches() }, [status])

  const filtered = matches.filter(m => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      m.home_team.name.toLowerCase().includes(q) ||
      m.away_team.name.toLowerCase().includes(q) ||
      m.league.name.toLowerCase().includes(q)
    )
  })

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Buscador */}
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Buscar equipo o liga..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input-field pl-10 py-2.5 text-sm"
          />
        </div>

        {/* Reload */}
        <button
          onClick={() => fetchMatches()}
          className="btn-ghost flex items-center gap-2 text-sm"
        >
          <RefreshCw size={15} className={clsx(loading && 'animate-spin')} />
          Actualizar
        </button>
      </div>

      {/* Filtros de estado */}
      <div className="flex gap-2 flex-wrap">
        {STATUS_FILTERS.map(f => (
          <button
            key={f.value}
            onClick={() => setStatus(f.value)}
            className={clsx(
              'px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200',
              status === f.value
                ? 'bg-primary-500 text-white shadow-glow'
                : 'bg-dark-700 text-gray-400 hover:text-ink hover:bg-dark-600'
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Lista */}
      {loading ? (
        <div className="grid gap-3">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="skeleton h-32 w-full rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <span className="text-5xl block mb-4">🔍</span>
          <p className="text-gray-400">No se encontraron partidos</p>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="btn-secondary inline-flex mt-4 text-sm px-5 py-2.5"
            >
              Limpiar búsqueda
            </button>
          )}
        </motion.div>
      ) : (
        <>
          <p className="text-xs text-gray-500">
            <span className="text-ink font-medium">{filtered.length}</span> partido{filtered.length !== 1 ? 's' : ''} encontrado{filtered.length !== 1 ? 's' : ''}
          </p>
          <div className="grid gap-3">
            {filtered.map((match, i) => (
              <MatchCard key={match.id} match={match} index={i} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
