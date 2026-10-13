import { useCallback, useState } from 'react'
import type { MatchStatus, Outcome } from '../models'
import { errorMessage } from '../services/api'
import { matchRepository, predictionRepository } from '../services/repositories'
import { useResource } from './useResource'

export function useHome() {
  return useResource(async () => {
    const [today, upcoming, mine] = await Promise.all([
      matchRepository.today(),
      matchRepository.list({ status: 'scheduled', limit: 6 }),
      predictionRepository.mine(4),
    ])
    return { today, upcoming, summary: mine.summary, recent: mine.records }
  }, [])
}

export function useLeagues() {
  return useResource(() => matchRepository.leagues(), [])
}

export function useMatches(status: MatchStatus | undefined, leagueId: number | undefined) {
  return useResource(() => matchRepository.list({ status, leagueId }), [status, leagueId])
}

export function useMatch(id: string) {
  const resource = useResource(() => matchRepository.byId(id), [id])
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const savePrediction = useCallback(
    async (outcome: Outcome, confidence: number): Promise<boolean> => {
      setSaving(true)
      setSaveError(null)
      try {
        await predictionRepository.save(id, outcome, confidence)
        const match = await matchRepository.byId(id)
        resource.setData(match)
        return true
      } catch (err) {
        setSaveError(errorMessage(err, 'No se pudo guardar el pronóstico.'))
        return false
      } finally {
        setSaving(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [id],
  )

  return { ...resource, saving, saveError, savePrediction }
}

export function useLeaderboard() {
  return useResource(() => predictionRepository.leaderboard(30), [])
}

export function useMyPredictions() {
  return useResource(() => predictionRepository.mine(30), [])
}
