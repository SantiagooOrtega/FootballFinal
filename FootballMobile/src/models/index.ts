export type Outcome = 'home' | 'draw' | 'away'
export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

export interface User {
  id: string
  username: string
  email: string
  avatarUrl: string | null
  favoriteTeam: string | null
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  points: number
  role: 'user' | 'admin'
}

export interface TeamStats {
  wins: number
  draws: number
  losses: number
  goalsFor: number
  goalsAgainst: number
}

export interface Team {
  id: number
  name: string
  shortName: string
  logo: string | null
  form: string
  stats: TeamStats
}

export interface League {
  id: number
  name: string
  country: string
  logo: string | null
}

export interface UserPick {
  outcome: Outcome
  confidence: number
}

export interface Match {
  id: string
  date: string
  status: MatchStatus
  venue: string | null
  round: string | null
  homeTeam: Team
  awayTeam: Team
  score: { home: number; away: number } | null
  league: League
  ai: {
    outcome: Outcome | null
    confidence: number | null
    analysis: string | null
  }
  userPick: UserPick | null
}

export interface PredictionRecord {
  id: string
  outcome: Outcome
  confidence: number
  isCorrect: boolean | null
  pointsEarned: number
  matchId: string
  matchDate: string
  status: MatchStatus
  homeTeam: string
  awayTeam: string
  homeLogo: string | null
  awayLogo: string | null
  leagueName: string
  score: { home: number; away: number } | null
}

export interface PredictionSummary {
  total: number
  correct: number
  incorrect: number
  pending: number
  points: number
  accuracy: number
}

export interface LeaderboardEntry {
  id: string
  username: string
  avatarUrl: string | null
  favoriteTeam: string | null
  points: number
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  rank: number
}

export const CONFIDENCE_LEVELS = [
  { label: 'Baja', value: 40 },
  { label: 'Media', value: 60 },
  { label: 'Alta', value: 80 },
  { label: 'Total', value: 95 },
] as const

export function outcomeLabel(match: Pick<Match, 'homeTeam' | 'awayTeam'>, outcome: Outcome): string {
  if (outcome === 'draw') return 'Empate'
  return outcome === 'home' ? match.homeTeam.name : match.awayTeam.name
}

export function isOpenForPrediction(status: MatchStatus): boolean {
  return status === 'scheduled' || status === 'live'
}
