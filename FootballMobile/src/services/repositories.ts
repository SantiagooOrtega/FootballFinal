import type {
  LeaderboardEntry,
  League,
  Match,
  MatchStatus,
  Outcome,
  PredictionRecord,
  PredictionSummary,
  User,
} from '../models'
import { api } from './api'
import {
  toLeaderboardEntry,
  toLeague,
  toMatch,
  toPredictionRecord,
  toPredictionSummary,
  toUser,
} from './mappers'

export interface RegisterInput {
  username: string
  email: string
  password: string
  favorite_team?: string
}

export const authRepository = {
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const { data } = await api.post('/auth/login', { email, password })
    return { token: data.token, user: toUser(data.user) }
  },

  async register(input: RegisterInput): Promise<{ token: string; user: User }> {
    const { data } = await api.post('/auth/register', input)
    return { token: data.token, user: toUser(data.user) }
  },

  async me(): Promise<User> {
    const { data } = await api.get('/auth/me')
    return toUser(data.user)
  },
}

export interface MatchFilters {
  status?: MatchStatus
  leagueId?: number
  limit?: number
}

export const matchRepository = {
  async list({ status, leagueId, limit = 40 }: MatchFilters = {}): Promise<Match[]> {
    const { data } = await api.get('/matches', {
      params: { status, league_id: leagueId, limit },
    })
    return data.matches.map(toMatch)
  },

  async today(): Promise<Match[]> {
    const { data } = await api.get('/matches/today')
    return data.matches.map(toMatch)
  },

  async byId(id: string): Promise<Match> {
    const { data } = await api.get(`/matches/${id}`)
    return toMatch(data.match)
  },

  async leagues(): Promise<League[]> {
    const { data } = await api.get('/leagues')
    return data.leagues.map(toLeague)
  },
}

export const predictionRepository = {
  async save(matchId: string, outcome: Outcome, confidence: number): Promise<void> {
    await api.post('/predictions', { match_id: matchId, prediction: outcome, confidence })
  },

  async mine(limit = 20): Promise<{ summary: PredictionSummary; records: PredictionRecord[] }> {
    const { data } = await api.get('/predictions/me', { params: { limit } })
    return {
      summary: toPredictionSummary(data.stats),
      records: data.predictions.map(toPredictionRecord),
    }
  },

  async leaderboard(limit = 20): Promise<LeaderboardEntry[]> {
    const { data } = await api.get('/predictions/leaderboard', { params: { limit } })
    return data.leaderboard.map(toLeaderboardEntry)
  },
}
