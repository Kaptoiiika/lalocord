import { create, type StateCreator } from 'zustand'

type RoomStreamStore = {
  hiddenStreams: string[]
  hideStreams: (streamId: string) => void
  unHideStreams: (streamId: string) => void
}

const store: StateCreator<RoomStreamStore> = (set, get) => ({
  hiddenStreams: [],
  hideStreams: (streamId: string) => {
    set((state) => ({
      ...state,
      hiddenStreams: [...state.hiddenStreams, streamId],
    }))
  },
  unHideStreams: (streamId: string) => {
    const hiddenStreams = get().hiddenStreams
    if (!hiddenStreams.includes(streamId)) return

    set((state) => ({
      ...state,
      hiddenStreams: hiddenStreams.filter((id) => id !== streamId),
    }))
  },
})

export const useRoomStreamStore = create(store)

