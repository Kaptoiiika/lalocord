import { useAudioEffectStore } from "../store/AudioEffectStore"
import { AudioName } from "../types/AudioEffectSchema"
import { useCallback } from "react"

export const useAudio = (audioName: AudioName) => {
  const storePlayFn = useAudioEffectStore((state) => state.play)

  const playAudio = useCallback(() => {
    storePlayFn(audioName)
  }, [audioName, storePlayFn])

  return playAudio
}
