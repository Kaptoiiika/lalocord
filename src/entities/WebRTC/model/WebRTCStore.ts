import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { create } from 'zustand'

import type { ObjectStreamConstraints } from '../utils/streamConstraints'
import type { StateCreator } from 'zustand'

import { getStreamSettingsfromLocalStorage, saveStreamConstraintsToLocalStorage } from '../utils/streamConstraints'
import type { StreamType } from '../types'

type WebRTCStore = {
  streams: Record<StreamType, MediaStream | null>
  createStream: (type: StreamType) => Promise<void>
  stopStream: (type: StreamType) => void

  streamConstraints: ObjectStreamConstraints
  setStreamConstraints: (streamConstraints: ObjectStreamConstraints) => void

  autoOnMic: boolean
  setAutoOnMic: (autoOnMic: boolean) => void

  bitrate: number
  setBitrate: (bitrate: number) => void
}

const store: StateCreator<WebRTCStore> = (set, get) => ({
  streams: {
    screen: null,
    webCam: null,
    mic: null,
  },
  streamConstraints: getStreamSettingsfromLocalStorage(),
  autoOnMic: localStorage.getItem(localstorageKeys.AUTO_ON_MIC) === 'true',
  bitrate: Number(localStorage.getItem(localstorageKeys.STREAM_BITRATE)) || 1024 * 1024 * 10,

  setAutoOnMic(autoOnMic) {
    localStorage.setItem(localstorageKeys.AUTO_ON_MIC, autoOnMic.toString())
    set((state) => ({
      ...state,
      autoOnMic,
    }))
  },

  setBitrate(bitrate) {
    localStorage.setItem(localstorageKeys.STREAM_BITRATE, bitrate.toString())
    set((state) => ({
      ...state,
      bitrate,
    }))
  },

  async createStream(type) {
    const streamConstraints = get().streamConstraints
    let stream: MediaStream | null = null

    if (type === 'screen') {
      stream = await navigator.mediaDevices.getDisplayMedia(streamConstraints)
    } else if (type === 'webCam') {
      stream = await navigator.mediaDevices.getUserMedia({ video: streamConstraints.video })
    } else if (type === 'mic') {
      stream = await navigator.mediaDevices.getUserMedia({ audio: streamConstraints.audio })
    }

    stream?.getTracks().forEach((track) => {
      try {
        if (type === 'mic') {
          track.contentHint = 'speech'
        } else if (type === 'screen') {
          track.contentHint = 'motion'
        } else if (type === 'webCam') {
          track.contentHint = 'motion'
        }
      } catch (error) {
        // firefox not support contentHint
        console.error('error set contentHint', error)
      }

      track.onended = () => {
        set((state) => ({
          streams: { ...state.streams, [type]: null },
        }))
      }
    })

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

  setStreamConstraints(streamConstraints) {
    saveStreamConstraintsToLocalStorage(streamConstraints)
    set((state) => ({
      ...state,
      streamConstraints,
    }))

    const streams = get().streams
    Object.values(streams).forEach((stream) => {
      if (stream) {
        stream.getTracks().forEach((track) => {
          const trackConstraints = track.getConstraints()

          const newConstraints = streamConstraints[track.kind as 'audio' | 'video']
          if (typeof newConstraints === 'object') {
            track.applyConstraints({
              ...trackConstraints,
              ...newConstraints,
            })
          }
        })
      }
    })
  },
})

export const useWebRTCStore = create<WebRTCStore>()(store)

