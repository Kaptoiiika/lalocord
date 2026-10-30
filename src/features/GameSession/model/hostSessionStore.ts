import { create } from 'zustand'

import type { GameSessionOffer } from 'src/shared/types/GameSession'

type HostSessionState = {
  hostOffer: GameSessionOffer | null
  setHostOffer: (offer: GameSessionOffer | null) => void
}

export const useHostSessionStore = create<HostSessionState>((set) => ({
  hostOffer: null,
  setHostOffer: (hostOffer) => set({ hostOffer }),
}))
