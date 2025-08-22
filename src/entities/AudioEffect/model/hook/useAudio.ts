import { useCallback } from 'react';

import type { AudioName } from '../types/AudioEffectSchema';

import { useAudioEffectStore } from '../store/AudioEffectStore';

export const useAudio = (audioName: AudioName) => {
  const storePlayFn = useAudioEffectStore((state) => state.play);

  const playAudio = useCallback(() => {
    storePlayFn(audioName);
  }, [audioName, storePlayFn]);

  return playAudio;
};
