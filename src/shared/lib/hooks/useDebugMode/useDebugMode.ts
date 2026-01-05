import { useState, useEffect } from 'react'

import { localstorageKeys } from 'src/shared/const/localstorageKeys'

export const getDebugValue = () => !!localStorage.getItem(localstorageKeys.DEBUG)
export const changeDebugValue = (state: boolean) => {
  if (state) {
    localStorage.setItem(localstorageKeys.DEBUG, JSON.stringify(true))
    console.log('debug on')
  } else {
    localStorage.removeItem(localstorageKeys.DEBUG)
    console.log('debug off')
  }
}
export const useDebugMode = () => {
  const [debug, setDebug] = useState(getDebugValue())

  useEffect(() => {
    const fn = (e: KeyboardEvent) => {
      if (e.shiftKey && e.key === 'F2') {
        const isDebug = getDebugValue()

        setDebug(isDebug)
      }
    }

    document.addEventListener('keydown', fn)

    return () => {
      document.removeEventListener('keydown', fn)
    }
  }, [])

  return debug
}
