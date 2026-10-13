import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ArrowLeft, Brain, MapPin, Target, CheckCircle2, Loader2 } from 'lucide-react'
import api from '../lib/api'
import { Match } from '../types'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const PREDICTION_OPTIONS = [
  { value: 'home', label: 'Victoria Local', emoji: '🏠' },
  { value: 'draw', label: 'Empate', emoji: '🤝' },
  { value: 'away', label: 'Victoria Visitante', emoji: '✈️' },
] as const

export default function MatchDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [match, setMatch] = useState<Match | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedPred, setSelectedPred] = useState<'home' | 'draw' | 'away' | null>(null)
  const [confidence, setConfidence] = useState(70)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (!id) return
    api.get(`/matches/${id}`)
      .then(res => {
        setMatch(res.data.match)
        if (res.data.match?.user_prediction) {
          setSelectedPred(res.data.match.user_prediction.prediction)
          setConfidence(res.data.match.user_prediction.confidence)
        }
      })
      .catch(() => navigate('/matches'))
      .finally(() => setLoading(false))
  }, [id])

  const handlePredict = async () => {
    if (!selectedPred) return toast.error('Selecciona una predicción')
    setSaving(true)
    try {
      await api.post('/predictions', { match_id: id, prediction: selectedPred, confidence })
      toast.success('¡Predicción guardada!')
      setMatch(prev => prev ? {
        ...prev,
        user_prediction: { prediction: selectedPred, confidence }
      } : prev)
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Error al guardar predicción')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 size={32} className="animate-spin text-primary-500" />
      </div>
    )
  }

  if (!match) return null

  const isFinished = match.status === 'finished'
  const canPredict = match.status === 'scheduled' || match.status === 'live'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-gray-400 hover:text-ink transition-colors text-sm"
      >
        <ArrowLeft size={16} />
        Volver a partidos
      </button>

      {/* Hero del partido */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-6 lg:p-8"
      >
        {/* Liga */}
        <div className="flex items-center gap-2 mb-6">
          {match.league.logo && (
            <img src={match.league.logo} alt={match.league.name} className="w-5 h-5 object-contain" />
          )}
          <span className="text-sm text-gray-400 font-medium">{match.league.name}</span>
          <span className="text-gray-600">·</span>
          <span className="text-sm text-gray-500">{match.league.country}</span>
          {match.round && <span className="badge-gray ml-auto">{match.round}</span>}
        </div>

        {/* Equipos */}
        <div className="flex items-center gap-6">
          {/* Local */}
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            {match.home_team.logo ? (
              <img src={match.home_team.logo} alt={match.home_team.name} className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-dark-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {match.home_team.short_name?.[0]}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-ink text-lg">{match.home_team.name}</p>
              {match.home_team.stats && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {match.home_team.stats.wins}V · {match.home_team.stats.draws}E · {match.home_team.stats.losses}D
                </p>
              )}
            </div>
          </div>

          {/* Marcador / VS */}
          <div className="flex flex-col items-center gap-2 min-w-[80px]">
            {isFinished && match.score ? (
              <div className="text-center">
                <span className="text-4xl font-display font-bold text-ink">
                  {match.score.home} - {match.score.away}
                </span>
                <p className="text-xs text-gray-500 mt-1">Final</p>
              </div>
            ) : (
              <div className="text-center">
                <span className="text-2xl font-bold text-gray-600">VS</span>
                <p className="text-xs text-gray-500 mt-1">
                  {format(new Date(match.match_date), "d MMM, HH:mm", { locale: es })}
                </p>
              </div>
            )}
            {match.status === 'live' && (
              <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" />
                EN VIVO
              </span>
            )}
          </div>

          {/* Visitante */}
          <div className="flex-1 flex flex-col items-center gap-3 text-center">
            {match.away_team.logo ? (
              <img src={match.away_team.logo} alt={match.away_team.name} className="w-20 h-20 object-contain" />
            ) : (
              <div className="w-20 h-20 bg-dark-600 rounded-full flex items-center justify-center text-2xl font-bold">
                {match.away_team.short_name?.[0]}
              </div>
            )}
            <div>
              <p className="font-display font-bold text-ink text-lg">{match.away_team.name}</p>
              {match.away_team.stats && (
                <p className="text-xs text-gray-500 mt-0.5">
                  {match.away_team.stats.wins}V · {match.away_team.stats.draws}E · {match.away_team.stats.losses}D
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Info extra */}
        {match.venue && (
          <div className="flex items-center justify-center gap-2 mt-4 text-gray-500 text-sm">
            <MapPin size={13} />
            <span>{match.venue}</span>
          </div>
        )}
      </motion.div>

      {/* Análisis de IA */}
      {match.ai.analysis && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6 border border-primary-500/20"
        >
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-primary-500/20 rounded-xl flex items-center justify-center">
              <Brain size={20} className="text-primary-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink">Análisis de IA</h3>
              <p className="text-xs text-gray-500">Basado en estadísticas históricas</p>
            </div>
            {match.ai.prediction && (
              <div className="ml-auto text-right">
                <p className="text-xs text-gray-500 mb-0.5">Predicción IA</p>
                <p className="font-bold text-primary-400">
                  {match.ai.prediction === 'home' ? match.home_team.short_name :
                   match.ai.prediction === 'away' ? match.away_team.short_name : 'Empate'}
                </p>
                {match.ai.confidence && (
                  <p className="text-xs text-gray-500">{match.ai.confidence}% confianza</p>
                )}
              </div>
            )}
          </div>

          {/* Barra de confianza */}
          {match.ai.confidence && match.ai.prediction && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {(['home', 'draw', 'away'] as const).map(opt => {
                const isAI = opt === match.ai.prediction
                const conf = isAI ? match.ai.confidence! :
                             opt === 'draw' ? 22 : 100 - match.ai.confidence! - 22
                return (
                  <div key={opt} className="text-center">
                    <p className="text-xs text-gray-500 mb-1">
                      {opt === 'home' ? 'Local' : opt === 'draw' ? 'Empate' : 'Visitante'}
                    </p>
                    <div className="h-1.5 bg-dark-600 rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${Math.max(0, conf)}%` }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                        className={clsx('h-full rounded-full', isAI ? 'bg-primary-500' : 'bg-dark-400')}
                      />
                    </div>
                    <p className={clsx('text-xs font-bold mt-1', isAI ? 'text-primary-400' : 'text-gray-500')}>
                      {Math.max(0, Math.round(conf))}%
                    </p>
                  </div>
                )
              })}
            </div>
          )}

          <p className="text-sm text-gray-300 leading-relaxed">{match.ai.analysis}</p>
        </motion.div>
      )}

      {/* Predicción del usuario */}
      {canPredict && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center">
              <Target size={20} className="text-blue-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-ink">Tu Predicción</h3>
              <p className="text-xs text-gray-500">Gana 10 puntos si aciertas</p>
            </div>
            {match.user_prediction && (
              <div className="ml-auto">
                <span className="badge bg-blue-500/20 text-blue-400 border border-blue-500/30">
                  <CheckCircle2 size={11} />
                  Ya predicho
                </span>
              </div>
            )}
          </div>

          {/* Opciones */}
          <div className="grid grid-cols-3 gap-3 mb-5">
            {PREDICTION_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => setSelectedPred(opt.value)}
                className={clsx(
                  'flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200',
                  selectedPred === opt.value
                    ? 'border-primary-500 bg-primary-500/20 shadow-glow'
                    : 'border-dark-400 bg-dark-700 hover:border-dark-300 hover:bg-dark-600'
                )}
              >
                <span className="text-2xl">{opt.emoji}</span>
                <span className={clsx('text-xs font-medium', selectedPred === opt.value ? 'text-primary-400' : 'text-gray-400')}>
                  {opt.label}
                </span>
              </button>
            ))}
          </div>

          {/* Confianza */}
          {selectedPred && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mb-5"
            >
              <label className="text-sm font-medium text-gray-300 mb-2 flex justify-between">
                <span>Nivel de confianza</span>
                <span className="text-primary-400 font-bold">{confidence}%</span>
              </label>
              <input
                type="range"
                min={10}
                max={100}
                value={confidence}
                onChange={e => setConfidence(Number(e.target.value))}
                className="w-full accent-primary-500"
              />
              <div className="flex justify-between text-xs text-gray-600 mt-1">
                <span>Poco seguro</span>
                <span>Muy seguro</span>
              </div>
            </motion.div>
          )}

          <button
            onClick={handlePredict}
            disabled={!selectedPred || saving}
            className="btn-primary w-full flex items-center justify-center gap-2"
          >
            {saving ? (
              <><Loader2 size={16} className="animate-spin" /> Guardando...</>
            ) : match.user_prediction ? (
              <><CheckCircle2 size={16} /> Actualizar predicción</>
            ) : (
              'Guardar predicción'
            )}
          </button>
        </motion.div>
      )}

      {/* Forma reciente */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-2 gap-4"
      >
        {[match.home_team, match.away_team].map(team => (
          <div key={team.id} className="glass-card p-4">
            <p className="text-sm font-semibold text-ink mb-3">{team.name}</p>
            {team.form && (
              <div>
                <p className="text-xs text-gray-500 mb-2">Últimos 5 partidos</p>
                <div className="flex gap-1">
                  {team.form.split('').map((r, i) => (
                    <span
                      key={i}
                      className={clsx(
                        'w-7 h-7 rounded-lg text-xs font-bold flex items-center justify-center',
                        r === 'W' ? 'bg-primary-500/30 text-primary-400' :
                        r === 'D' ? 'bg-yellow-500/30 text-yellow-400' :
                        'bg-red-500/30 text-red-400'
                      )}
                    >
                      {r === 'W' ? 'G' : r === 'D' ? 'E' : 'P'}
                    </span>
                  ))}
                </div>
              </div>
            )}
            {team.stats && (
              <div className="grid grid-cols-3 gap-2 mt-3">
                <div className="text-center">
                  <p className="text-base font-bold text-primary-400">{team.stats.wins}</p>
                  <p className="text-xs text-gray-600">Victorias</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-yellow-400">{team.stats.draws}</p>
                  <p className="text-xs text-gray-600">Empates</p>
                </div>
                <div className="text-center">
                  <p className="text-base font-bold text-red-400">{team.stats.losses}</p>
                  <p className="text-xs text-gray-600">Derrotas</p>
                </div>
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  )
}
