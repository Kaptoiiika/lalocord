import { EffectCallback, useEffect } from "react"

export const useMountedEffect = (effect: EffectCallback) => {
  useEffect(() => {
    return effect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
}
