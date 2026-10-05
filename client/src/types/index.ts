export interface User {
  id: string
  username: string
  email: string
  avatar_url?: string
  favorite_team?: string
  total_predictions: number
  correct_predictions: number
  accuracy: number
  points: number
  role: 'user' | 'admin'
  created_at?: string
}

export interface Team {
  id: number
  name: string
  short_name: string
  logo: string
  form?: string
  stats?: {
    wins: number
    draws: number
    losses: number
    goals_for?: number
    goals_against?: number
  }
}

export interface League {
  id: number
  name: string
  country: string
  logo: string
}

export interface Match {
  id: string
  match_date: string
  status: 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'
  venue?: string
  round?: string
  home_team: Team
  away_team: Team
  score?: { home: number; away: number } | null
  league: League
  ai: {
    prediction: 'home' | 'draw' | 'away' | null
    confidence: number | null
    analysis: string | null
  }
  user_prediction?: {
    prediction: 'home' | 'draw' | 'away'
    confidence: number
  } | null
}

export interface Prediction {
  id: string
  prediction: 'home' | 'draw' | 'away'
  confidence: number
  is_correct?: boolean
  points_earned?: number
  created_at: string
  match_id: string
  match_date: string
  status: string
  home_score?: number
  away_score?: number
  home_team_name: string
  away_team_name: string
  home_logo?: string
  away_logo?: string
  league_name: string
  league_logo?: string
  ai_prediction?: string
}

export interface LeaderboardEntry {
  id: string
  username: string
  avatar_url?: string
  favorite_team?: string
  points: number
  total_predictions: number
  correct_predictions: number
  accuracy: number
  rank: number
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
