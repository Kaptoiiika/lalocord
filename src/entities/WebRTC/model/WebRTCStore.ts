import { create } from 'zustand'

import type { StateCreator } from 'zustand'

import type { StreamType } from '../types'

type WebRTCStore = {
  streams: Record<StreamType, MediaStream | null>
  createStream: (type: StreamType) => Promise<void>
  stopStream: (type: StreamType) => void
}

const store: StateCreator<WebRTCStore> = (set, get) => ({
  streams: {
    screen: null,
    webCam: null,
    mic: null,
  },

  async createStream(type) {
    let stream: MediaStream | null = null
    
    if (type === 'screen') {
      stream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })
    } else if (type === 'webCam') {
      stream = await navigator.mediaDevices.getUserMedia({ video: true })
    } else if (type === 'mic') {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    }

    if (stream) {
      set((state) => ({
        streams: { ...state.streams, [type]: stream },
      }))
    }
  },

  stopStream(type) {
    const stream = get().streams[type]
    if (stream) {
      stream.getTracks().forEach((track) => {
        track.stop()
      })
    }
    set((state) => ({
      streams: { ...state.streams, [type]: null },
    }))
  },
})

export const useWebRTCStore = create<WebRTCStore>()(store)

