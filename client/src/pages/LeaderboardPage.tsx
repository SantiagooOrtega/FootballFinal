import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Trophy, Medal, TrendingUp, Target } from 'lucide-react'
import api from '../lib/api'
import { LeaderboardEntry } from '../types'
import { useAuth } from '../context/AuthContext'
import clsx from 'clsx'

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/users/leaderboard')
      .then(res => setEntries(res.data.leaderboard ?? []))
      .catch(() => setEntries([]))
      .finally(() => setLoading(false))
  }, [])

  const rankIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return rank
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 bg-gradient-to-r from-yellow-500/10 to-transparent border border-yellow-500/20"
      >
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-yellow-500/20 rounded-xl flex items-center justify-center">
            <Trophy size={24} className="text-yellow-400" />
          </div>
          <div>
            <h1 className="text-2xl font-display font-bold text-ink">Clasificación Global</h1>
            <p className="text-gray-400 text-sm">Top predictores de la temporada</p>
          </div>
        </div>
      </motion.div>

      {/* Podio top 3 */}
      {!loading && entries.length >= 3 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-3 gap-3"
        >
          {[entries[1], entries[0], entries[2]].map((entry, i) => (
            <div
              key={entry.id}
              className={clsx(
                'glass-card p-4 text-center',
                i === 1 && 'border-yellow-500/30 bg-yellow-500/5 -mt-2'
              )}
            >
              <div className="text-3xl mb-2">
                {i === 1 ? '🥇' : i === 0 ? '🥈' : '🥉'}
              </div>
              <div className={clsx(
                'w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-2',
                i === 1 ? 'bg-yellow-500/30 text-yellow-400' :
                i === 0 ? 'bg-gray-400/30 text-gray-300' :
                'bg-orange-500/30 text-orange-400'
              )}>
                {entry.username[0].toUpperCase()}
              </div>
              <p className="font-semibold text-ink text-sm truncate">{entry.username}</p>
              <p className={clsx('font-display font-bold text-lg mt-1',
                i === 1 ? 'text-yellow-400' : i === 0 ? 'text-gray-300' : 'text-orange-400'
              )}>
                {entry.points} pts
              </p>
              <p className="text-xs text-gray-500">{entry.accuracy}% precisión</p>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tabla completa */}
      {loading ? (
        <div className="glass-card overflow-hidden">
          {[1, 2, 3, 4, 5].map(i => (
            <div key={i} className="p-4 border-b border-dark-500/50 last:border-0">
              <div className="skeleton h-10 w-full rounded-lg" />
            </div>
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <span className="text-5xl block mb-4">🏆</span>
          <p className="text-gray-400">Aún no hay clasificación. ¡Sé el primero en predecir!</p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          {/* Header tabla */}
          <div className="grid grid-cols-[40px_1fr_80px_80px_70px] gap-3 px-4 py-3 border-b border-dark-500/50 bg-dark-700/50">
            <span className="text-xs text-gray-500 font-medium">#</span>
            <span className="text-xs text-gray-500 font-medium">Jugador</span>
            <span className="text-xs text-gray-500 font-medium text-center">Puntos</span>
            <span className="text-xs text-gray-500 font-medium text-center">Precisión</span>
            <span className="text-xs text-gray-500 font-medium text-center">Preds.</span>
          </div>

          {entries.map((entry, i) => (
            <motion.div
              key={entry.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.04 }}
              className={clsx(
                'grid grid-cols-[40px_1fr_80px_80px_70px] gap-3 px-4 py-4',
                'border-b border-dark-500/30 last:border-0 transition-colors',
                entry.id === user?.id ? 'bg-primary-500/10 border-l-2 border-l-primary-500' : 'hover:bg-dark-700/50'
              )}
            >
              <div className="flex items-center justify-center">
                <span className={clsx(
                  'text-sm font-bold',
                  entry.rank === 1 ? 'text-yellow-400' :
                  entry.rank === 2 ? 'text-gray-300' :
                  entry.rank === 3 ? 'text-orange-400' : 'text-gray-500'
                )}>
                  {typeof rankIcon(entry.rank) === 'string' ? rankIcon(entry.rank) : `#${entry.rank}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className={clsx(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0',
                  entry.id === user?.id ? 'bg-primary-500/30 text-primary-400' : 'bg-dark-600 text-gray-400'
                )}>
                  {entry.username[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className={clsx('text-sm font-semibold truncate', entry.id === user?.id ? 'text-primary-400' : 'text-ink')}>
                    {entry.username}
                    {entry.id === user?.id && <span className="text-xs text-primary-500 ml-1">(tú)</span>}
                  </p>
                  {entry.favorite_team && (
                    <p className="text-xs text-gray-500 truncate">{entry.favorite_team}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-center">
                <span className="font-display font-bold text-yellow-400">{entry.points}</span>
              </div>

              <div className="flex items-center justify-center">
                <span className={clsx('text-sm font-semibold',
                  entry.accuracy >= 60 ? 'text-primary-400' :
                  entry.accuracy >= 40 ? 'text-yellow-400' : 'text-red-400'
                )}>
                  {entry.accuracy}%
                </span>
              </div>

              <div className="flex items-center justify-center">
                <span className="text-sm text-gray-400">{entry.total_predictions}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
