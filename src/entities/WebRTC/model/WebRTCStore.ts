import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { create } from 'zustand'

import type { ObjectStreamConstraints } from '../utils/streamConstraints'
import type { StateCreator } from 'zustand'

import { getStreamSettingsfromLocalStorage, saveStreamConstraintsToLocalStorage } from '../utils/streamConstraints'
import type { StreamType } from '../types'
import { createMediaStream } from '../utils'

type WebRTCStore = {
  streams: Record<StreamType, MediaStream | null>
  createStream: (type: StreamType) => Promise<MediaStream | null>
  stopStream: (type: StreamType) => void
  restartStream: (type: StreamType) => void

  streamConstraints: ObjectStreamConstraints
  setStreamConstraints: (streamConstraints: ObjectStreamConstraints) => void

  autoOnMic: boolean
  setAutoOnMic: (autoOnMic: boolean) => void

  bitrate: number
  setBitrate: (bitrate: number) => void
}

const store: StateCreator<WebRTCStore> = (set, get) => {
  const stopStreamTracks = (stream: MediaStream | null) => {
    stream?.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })
  }

  const prepareStream = (type: StreamType, stream: MediaStream) => {
    stream.getTracks().forEach((track) => {
      try {
        if (type === 'mic') {
          track.contentHint = 'speech'
        } else if (type === 'screen') {
          track.contentHint = 'detail'
        } else if (type === 'webCam') {
          track.contentHint = 'motion'
        }
      } catch (error) {
        // firefox not support contentHint
        console.error('error set contentHint', error)
      }

      track.onended = () => {
        if (get().streams[type] !== stream) return
        set((state) => ({
          streams: { ...state.streams, [type]: null },
        }))
      }
    })
  }

  return {
    streams: {
      screen: null,
      webCam: null,
      mic: null,
    },
    streamConstraints: getStreamSettingsfromLocalStorage(),
    autoOnMic: Boolean(JSON.parse(localStorage.getItem(localstorageKeys.AUTO_ON_MIC) ?? 'true')),
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
      const stream = await createMediaStream(type, streamConstraints)
      if (!stream) return null

      stopStreamTracks(get().streams[type])
      prepareStream(type, stream)
      set((state) => ({
        streams: { ...state.streams, [type]: stream },
      }))

      return stream
    },

    async restartStream(type) {
      const streamConstraints = get().streamConstraints
      const stream = await createMediaStream(type, streamConstraints)
      if (!stream) return

      stopStreamTracks(get().streams[type])
      prepareStream(type, stream)
      set((state) => ({
        streams: { ...state.streams, [type]: stream },
      }))
    },

    stopStream(type) {
      const stream = get().streams[type]
      if (stream) {
        stream.getTracks().forEach((track) => {
          track.stop()
          // https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/ended_event
          // ** The only case where the track ends but the ended event is not fired is when calling MediaStreamTrack.stop.
          track.dispatchEvent(new Event('ended'))
        })
      }
      set((state) => ({
        streams: { ...state.streams, [type]: null },
      }))
    },

    setStreamConstraints(streamConstraints) {
      saveStreamConstraintsToLocalStorage(streamConstraints)
      const currentStreamConstraints = get().streamConstraints
      const currentStreams = get().streams
      const restartStream = get().restartStream
      set((state) => ({
        ...state,
        streamConstraints,
      }))

      if (streamConstraints.video.deviceId !== currentStreamConstraints.video.deviceId && currentStreams.webCam) {
        restartStream('webCam')
      }
      if (currentStreams.mic) {
        restartStream('mic')
      }

      Object.values(currentStreams).forEach((stream) => {
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
  }
}

export const useWebRTCStore = create<WebRTCStore>()(store)
