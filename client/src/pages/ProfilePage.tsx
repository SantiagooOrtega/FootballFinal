import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { User, Target, Trophy, TrendingUp, CheckCircle2, Clock, XCircle, Brain } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import api from '../lib/api'
import { Prediction } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import clsx from 'clsx'
import toast from 'react-hot-toast'

export default function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [predictions, setPredictions] = useState<Prediction[]>([])
  const [loadingPreds, setLoadingPreds] = useState(true)
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({
    username: user?.username ?? '',
    favorite_team: user?.favorite_team ?? '',
  })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    api.get('/predictions/me')
      .then(res => setPredictions(res.data.predictions ?? []))
      .catch(() => setPredictions([]))
      .finally(() => setLoadingPreds(false))
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const res = await api.put('/users/profile', form)
      updateUser({ ...user!, ...res.data.user })
      setEditing(false)
      toast.success('Perfil actualizado')
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al actualizar')
    } finally {
      setSaving(false)
    }
  }

  const predLabel = (p: string, homeName: string, awayName: string) => {
    if (p === 'home') return homeName
    if (p === 'away') return awayName
    return 'Empate'
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Perfil hero */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 lg:p-8"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          {/* Avatar */}
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-800 rounded-2xl flex items-center justify-center text-3xl font-bold shadow-glow shrink-0">
            {user?.username?.[0]?.toUpperCase()}
          </div>

          {/* Info */}
          <div className="flex-1">
            {editing ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm(p => ({ ...p, username: e.target.value }))}
                  className="input-field py-2 text-sm"
                  placeholder="Username"
                />
                <input
                  type="text"
                  value={form.favorite_team}
                  onChange={e => setForm(p => ({ ...p, favorite_team: e.target.value }))}
                  className="input-field py-2 text-sm"
                  placeholder="Equipo favorito"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveProfile}
                    disabled={saving}
                    className="btn-primary text-sm px-4 py-2 flex items-center gap-1.5"
                  >
                    {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
                    Guardar
                  </button>
                  <button onClick={() => setEditing(false)} className="btn-secondary text-sm px-4 py-2">
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-display font-bold text-white">{user?.username}</h1>
                  {user?.role === 'admin' && (
                    <span className="badge bg-purple-500/20 text-purple-400 border border-purple-500/30">Admin</span>
                  )}
                </div>
                <p className="text-gray-400 text-sm mt-0.5">{user?.email}</p>
                {user?.favorite_team && (
                  <p className="text-primary-400 text-sm mt-1">⭐ {user.favorite_team}</p>
                )}
                <button
                  onClick={() => setEditing(true)}
                  className="btn-ghost text-sm mt-3 px-3 py-1.5 flex items-center gap-1.5"
                >
                  <User size={13} />
                  Editar perfil
                </button>
              </>
            )}
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { icon: Target, label: 'Predicciones', value: user?.total_predictions ?? 0, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: CheckCircle2, label: 'Aciertos', value: user?.correct_predictions ?? 0, color: 'text-primary-400', bg: 'bg-primary-500/10' },
          { icon: TrendingUp, label: 'Precisión', value: `${user?.accuracy ?? 0}%`, color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: Trophy, label: 'Puntos', value: user?.points ?? 0, color: 'text-orange-400', bg: 'bg-orange-500/10' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.07 }}
            className="glass-card p-4 text-center"
          >
            <div className={`w-9 h-9 ${stat.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
              <stat.icon size={18} className={stat.color} />
            </div>
            <p className={`text-xl font-display font-bold ${stat.color}`}>{stat.value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Historial de predicciones */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Brain size={18} className="text-primary-400" />
          <h2 className="section-title">Mis Predicciones</h2>
        </div>

        {loadingPreds ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => <div key={i} className="skeleton h-20 w-full rounded-2xl" />)}
          </div>
        ) : predictions.length === 0 ? (
          <div className="glass-card p-10 text-center">
            <span className="text-5xl block mb-3">🎯</span>
            <p className="text-gray-400">Aún no has hecho predicciones.</p>
            <p className="text-gray-600 text-sm mt-1">Ve a los partidos y haz tu primera predicción.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {predictions.map((pred, i) => (
              <motion.div
                key={pred.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className={clsx(
                  'glass-card p-4 flex items-center gap-4',
                  pred.is_correct === true && 'border-primary-500/30',
                  pred.is_correct === false && 'border-red-500/20',
                )}
              >
                {/* Status icon */}
                <div className="shrink-0">
                  {pred.is_correct === true ? (
                    <CheckCircle2 size={22} className="text-primary-400" />
                  ) : pred.is_correct === false ? (
                    <XCircle size={22} className="text-red-400" />
                  ) : (
                    <Clock size={22} className="text-gray-500" />
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white truncate">
                    {pred.home_team_name} vs {pred.away_team_name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {pred.league_name} · {format(new Date(pred.match_date), "d MMM yyyy", { locale: es })}
                  </p>
                </div>

                {/* Predicción */}
                <div className="text-right shrink-0">
                  <p className="text-sm font-medium text-primary-400">
                    {predLabel(pred.prediction, pred.home_team_name, pred.away_team_name)}
                  </p>
                  {pred.status === 'finished' && pred.is_correct !== undefined && (
                    <p className={clsx('text-xs font-bold',
                      pred.is_correct ? 'text-primary-400' : 'text-red-400'
                    )}>
                      {pred.is_correct ? `+${pred.points_earned} pts` : '0 pts'}
                    </p>
                  )}
                  {pred.status !== 'finished' && (
                    <p className="text-xs text-gray-600">Pendiente</p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
