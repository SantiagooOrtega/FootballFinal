import { useCallback, useEffect, useRef, useState } from 'react'
import { useFocusEffect } from 'expo-router'
import { errorMessage } from '../services/api'

interface ResourceState<T> {
  data: T | null
  loading: boolean
  refreshing: boolean
  error: string | null
}

/**
 * Carga un recurso remoto, expone pull-to-refresh y lo revalida en silencio
 * cada vez que la pantalla recupera el foco.
 */
export function useResource<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<ResourceState<T>>({
    data: null,
    loading: true,
    refreshing: false,
    error: null,
  })
  const requestId = useRef(0)
  const hasData = useRef(false)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetcher = useCallback(load, deps)

  const run = useCallback(
    async (mode: 'initial' | 'refresh' | 'silent') => {
      const id = ++requestId.current
      if (mode === 'initial') setState((s) => ({ ...s, loading: true, error: null }))
      if (mode === 'refresh') setState((s) => ({ ...s, refreshing: true }))
      try {
        const data = await fetcher()
        if (id !== requestId.current) return
        hasData.current = true
        setState({ data, loading: false, refreshing: false, error: null })
      } catch (err) {
        if (id !== requestId.current) return
        setState((s) => ({
          data: mode === 'silent' ? s.data : null,
          loading: false,
          refreshing: false,
          error: mode === 'silent' && s.data ? null : errorMessage(err, 'error.load'),
        }))
      }
    },
    [fetcher],
  )

  useEffect(() => {
    hasData.current = false
    run('initial')
  }, [run])

  useFocusEffect(
    useCallback(() => {
      if (hasData.current) run('silent')
    }, [run]),
  )

  return {
    ...state,
    refresh: () => run('refresh'),
    retry: () => run('initial'),
    setData: (data: T) => setState((s) => ({ ...s, data })),
  }
}
