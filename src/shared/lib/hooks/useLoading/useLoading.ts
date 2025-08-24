import { useState, useCallback } from 'react'

import { FormateError } from 'src/shared/api'

import type { LoadingState } from 'src/shared/types/Loading'

/**
 * Хук для управления состоянием загрузки и ошибок.
 * @param initialState - начальное состояние загрузки (по умолчанию false)
 */
export function useLoading(initialState: boolean = false) {
  const [state, setState] = useState<LoadingState>({
    isLoading: initialState,
    error: false,
    textError: undefined,
  })

  const startLoading = useCallback(() => {
    setState({ isLoading: true, error: false, textError: undefined })
  }, [])

  const stopLoading = useCallback(() => {
    setState((prev) => ({ ...prev, isLoading: false }))
  }, [])

  const setError = useCallback((error?: unknown) => {
    const textError = FormateError(error)
    setState({ isLoading: false, error: true, textError })
  }, [])

  const reset = useCallback(() => {
    setState({ isLoading: false, error: false, textError: undefined })
  }, [])

  return {
    ...state,
    startLoading,
    stopLoading,
    setError,
    reset,
  }
}
