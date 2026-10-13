import type {
  LeaderboardEntry,
  League,
  Match,
  PredictionRecord,
  PredictionSummary,
  Team,
  User,
} from '../models'

// PostgreSQL devuelve DECIMAL y COUNT como cadenas; aqui se normalizan a numeros.
type Raw = Record<string, any>

const num = (value: unknown): number => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const numOrNull = (value: unknown): number | null =>
  value === null || value === undefined ? null : num(value)

export function toUser(raw: Raw): User {
  return {
    id: raw.id,
    username: raw.username,
    email: raw.email,
    avatarUrl: raw.avatar_url ?? null,
    favoriteTeam: raw.favorite_team ?? null,
    totalPredictions: num(raw.total_predictions),
    correctPredictions: num(raw.correct_predictions),
    accuracy: num(raw.accuracy),
    points: num(raw.points),
    role: raw.role === 'admin' ? 'admin' : 'user',
  }
}

function toTeam(raw: Raw): Team {
  return {
    id: raw.id,
    name: raw.name,
    shortName: raw.short_name ?? raw.name.slice(0, 3).toUpperCase(),
    logo: raw.logo ?? null,
    form: raw.form ?? '',
    stats: {
      wins: num(raw.stats?.wins),
      draws: num(raw.stats?.draws),
      losses: num(raw.stats?.losses),
      goalsFor: num(raw.stats?.goals_for),
      goalsAgainst: num(raw.stats?.goals_against),
    },
  }
}

export function toLeague(raw: Raw): League {
  return {
    id: raw.id,
    name: raw.name,
    country: raw.country ?? '',
    logo: raw.logo ?? raw.logo_url ?? null,
  }
}

export function toMatch(raw: Raw): Match {
  return {
    id: raw.id,
    date: raw.match_date,
    status: raw.status,
    venue: raw.venue ?? null,
    round: raw.round ?? null,
    homeTeam: toTeam(raw.home_team),
    awayTeam: toTeam(raw.away_team),
    score: raw.score ? { home: num(raw.score.home), away: num(raw.score.away) } : null,
    league: toLeague(raw.league),
    ai: {
      outcome: raw.ai?.prediction ?? null,
      confidence: numOrNull(raw.ai?.confidence),
      analysis: raw.ai?.analysis ?? null,
    },
    userPick: raw.user_prediction
      ? { outcome: raw.user_prediction.prediction, confidence: num(raw.user_prediction.confidence) }
      : null,
  }
}

export function toPredictionRecord(raw: Raw): PredictionRecord {
  const finished = raw.home_score !== null && raw.home_score !== undefined
  return {
    id: raw.id,
    outcome: raw.prediction,
    confidence: num(raw.confidence),
    isCorrect: raw.is_correct ?? null,
    pointsEarned: num(raw.points_earned),
    matchId: raw.match_id,
    matchDate: raw.match_date,
    status: raw.status,
    homeTeam: raw.home_team_name,
    awayTeam: raw.away_team_name,
    homeLogo: raw.home_logo ?? null,
    awayLogo: raw.away_logo ?? null,
    leagueName: raw.league_name,
    score: finished ? { home: num(raw.home_score), away: num(raw.away_score) } : null,
  }
}

export function toPredictionSummary(raw: Raw): PredictionSummary {
  return {
    total: num(raw.total),
    correct: num(raw.correct),
    incorrect: num(raw.incorrect),
    pending: num(raw.pending),
    points: num(raw.total_points),
    accuracy: num(raw.accuracy),
  }
}

export function toLeaderboardEntry(raw: Raw): LeaderboardEntry {
  return {
    id: raw.id,
    username: raw.username,
    avatarUrl: raw.avatar_url ?? null,
    favoriteTeam: raw.favorite_team ?? null,
    points: num(raw.points),
    totalPredictions: num(raw.total_predictions),
    correctPredictions: num(raw.correct_predictions),
    accuracy: num(raw.accuracy),
    rank: num(raw.rank),
  }
}
