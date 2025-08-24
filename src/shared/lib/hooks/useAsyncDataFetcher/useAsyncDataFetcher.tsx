import { useEffect, useRef, useState } from 'react'

import type { LoadingState } from 'src/shared/types/Loading'

import { useLoading } from '../useLoading/useLoading'

export const useAsyncDataFetcher = <T, P>(
  initialData: T | undefined,
  callback: (params: P) => Promise<T>,
  callbackParams: P
): { data?: T } & LoadingState => {
  const [data, setData] = useState(initialData)
  const { error, isLoading, textError, setError, startLoading, stopLoading } = useLoading(Boolean(initialData))

  const refCallback = useRef(callback)
  refCallback.current = callback

  const refCallbackParams = useRef(callbackParams)
  refCallbackParams.current = callbackParams

  useEffect(() => {
    if (data) return

    const getRefCallbacks = () => [refCallback.current, refCallbackParams.current] as const

    const [memoizedCallback, memoizedCallbackParams] = getRefCallbacks()
    startLoading()
    memoizedCallback(memoizedCallbackParams)
      .then((data) => {
        setData(data)
        stopLoading()
      })
      .catch(setError)
  }, [data, startLoading, setError, stopLoading])

  return { data, error, isLoading, textError }
}

