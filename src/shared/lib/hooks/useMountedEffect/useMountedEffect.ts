import type { EffectCallback } from 'react'
import { useEffect } from 'react'

export const useMountedEffect = (effect: EffectCallback) => {
  useEffect(
    () => effect(),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  )
}
