import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Brain, ChevronRight, CheckCircle2 } from 'lucide-react'
import clsx from 'clsx'
import { Match } from '../types'

interface Props {
  match: Match
  index?: number
}

const predictionLabel = {
  home: (homeName: string) => homeName,
  draw: () => 'Empate',
  away: (homeName: string, awayName: string) => awayName,
}

const confidenceColor = (conf: number) => {
  if (conf >= 65) return 'text-primary-400'
  if (conf >= 50) return 'text-yellow-400'
  return 'text-orange-400'
}

export default function MatchCard({ match, index = 0 }: Props) {
  const navigate = useNavigate()

  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const isScheduled = match.status === 'scheduled'

  const aiLabel = match.ai.prediction
    ? match.ai.prediction === 'draw'
      ? 'Empate'
      : match.ai.prediction === 'home'
        ? match.home_team.short_name
        : match.away_team.short_name
    : null

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06 }}
      onClick={() => navigate(`/matches/${match.id}`)}
      className="glass-card p-4 cursor-pointer hover:border-primary-500/40 hover:bg-dark-700/80
                 transition-all duration-300 group"
    >
      {/* Header: Liga + Estado */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {match.league.logo && (
            <img src={match.league.logo} alt={match.league.name} className="w-4 h-4 object-contain" />
          )}
          <span className="text-xs text-gray-500 font-medium">{match.league.name}</span>
          {match.league.country && (
            <span className="text-xs text-gray-600">· {match.league.country}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isLive && (
            <span className="badge bg-red-500/20 text-red-400 border border-red-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-red-400 live-pulse" />
              EN VIVO
            </span>
          )}
          {isFinished && <span className="badge-gray">Finalizado</span>}
          {isScheduled && (
            <span className="text-xs text-gray-500">
              {format(new Date(match.match_date), "d MMM · HH:mm", { locale: es })}
            </span>
          )}
          <ChevronRight size={14} className="text-gray-600 group-hover:text-primary-400 transition-colors" />
        </div>
      </div>

      {/* Equipos y marcador */}
      <div className="flex items-center gap-4">
        {/* Local */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {match.home_team.logo ? (
            <img
              src={match.home_team.logo}
              alt={match.home_team.name}
              className="w-10 h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 bg-dark-600 rounded-full flex items-center justify-center text-sm font-bold">
              {match.home_team.short_name?.[0]}
            </div>
          )}
          <span className="text-sm font-semibold text-ink text-center leading-tight">
            {match.home_team.short_name || match.home_team.name}
          </span>
          {match.home_team.form && (
            <div className="flex gap-0.5">
              {match.home_team.form.split('').slice(-5).map((r, i) => (
                <span
                  key={i}
                  className={clsx('w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center',
                    r === 'W' ? 'bg-primary-500/30 text-primary-400' :
                    r === 'D' ? 'bg-yellow-500/30 text-yellow-400' :
                    'bg-red-500/30 text-red-400'
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Marcador / VS */}
        <div className="flex flex-col items-center gap-1 min-w-[60px]">
          {isFinished && match.score ? (
            <div className="text-center">
              <span className="text-2xl font-display font-bold text-ink">
                {match.score.home} - {match.score.away}
              </span>
            </div>
          ) : (
            <div className="text-center">
              <span className="text-xl font-bold text-gray-600">VS</span>
            </div>
          )}
        </div>

        {/* Visitante */}
        <div className="flex-1 flex flex-col items-center gap-2">
          {match.away_team.logo ? (
            <img
              src={match.away_team.logo}
              alt={match.away_team.name}
              className="w-10 h-10 object-contain"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }}
            />
          ) : (
            <div className="w-10 h-10 bg-dark-600 rounded-full flex items-center justify-center text-sm font-bold">
              {match.away_team.short_name?.[0]}
            </div>
          )}
          <span className="text-sm font-semibold text-ink text-center leading-tight">
            {match.away_team.short_name || match.away_team.name}
          </span>
          {match.away_team.form && (
            <div className="flex gap-0.5">
              {match.away_team.form.split('').slice(-5).map((r, i) => (
                <span
                  key={i}
                  className={clsx('w-4 h-4 rounded-sm text-[9px] font-bold flex items-center justify-center',
                    r === 'W' ? 'bg-primary-500/30 text-primary-400' :
                    r === 'D' ? 'bg-yellow-500/30 text-yellow-400' :
                    'bg-red-500/30 text-red-400'
                  )}
                >
                  {r}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: IA + predicción usuario */}
      {(match.ai.prediction || match.user_prediction) && (
        <div className="mt-3 pt-3 border-t border-dark-500/50 flex items-center justify-between">
          {match.ai.prediction && (
            <div className="flex items-center gap-2">
              <Brain size={13} className="text-primary-400" />
              <span className="text-xs text-gray-400">IA:</span>
              <span className="text-xs font-semibold text-primary-400">{aiLabel}</span>
              {match.ai.confidence && (
                <span className={clsx('text-xs font-bold', confidenceColor(match.ai.confidence))}>
                  {match.ai.confidence}%
                </span>
              )}
            </div>
          )}
          {match.user_prediction && (
            <div className="flex items-center gap-1.5">
              <CheckCircle2 size={13} className="text-blue-400" />
              <span className="text-xs text-blue-400 font-medium">Predicho</span>
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}
