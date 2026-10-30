import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { create } from 'zustand'

import type { ObjectStreamConstraints } from '../utils/streamConstraints'
import type { StateCreator } from 'zustand'

import {
  defaultStreamBitrate,
  getScreenAudioConstraints,
  getScreenVideoConstraints,
  getStreamSettingsfromLocalStorage,
  saveStreamConstraintsToLocalStorage,
} from '../utils/streamConstraints'
import type { StreamType } from '../types'
import { createMediaStream } from '../utils'

type WebRTCStore = {
  streams: Record<StreamType, MediaStream | null>
  createStream: (type: StreamType) => Promise<MediaStream | null>
  stopStream: (type: StreamType) => void
  restartStream: (type: StreamType) => void
  holdGameScreenTile: () => void
  releaseGameScreenTile: () => void

  streamConstraints: ObjectStreamConstraints
  setStreamConstraints: (streamConstraints: ObjectStreamConstraints) => void

  autoOnMic: boolean
  setAutoOnMic: (autoOnMic: boolean) => void

  bitrate: number
  setBitrate: (bitrate: number) => void
}

const applyContentHint = (type: StreamType, track: MediaStreamTrack) => {
  try {
    if (track.kind === 'audio') {
      if (type === 'mic') track.contentHint = 'speech'
      return
    }

    track.contentHint = 'motion'
  } catch (error) {
    // firefox not support contentHint
    console.error('error set contentHint', error)
  }
}

const gamePoster: { canvas: HTMLCanvasElement | null; stream: MediaStream | null } = {
  canvas: null,
  stream: null,
}

const createGamePosterStream = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 1280
  canvas.height = 720
  const context = canvas.getContext('2d')
  if (context) {
    context.fillStyle = '#111418'
    context.fillRect(0, 0, canvas.width, canvas.height)
    context.fillStyle = '#ffffff'
    context.font = '48px sans-serif'
    context.textAlign = 'center'
    context.fillText('Game session', canvas.width / 2, canvas.height / 2)
  }

  gamePoster.canvas = canvas
  gamePoster.stream = canvas.captureStream(1)

  return gamePoster.stream
}

const store: StateCreator<WebRTCStore> = (set, get) => ({
  streams: {
    screen: null,
    webCam: null,
    mic: null,
  },
  streamConstraints: getStreamSettingsfromLocalStorage(),
  autoOnMic: Boolean(JSON.parse(localStorage.getItem(localstorageKeys.AUTO_ON_MIC) ?? 'true')),
  bitrate: Number(localStorage.getItem(localstorageKeys.STREAM_BITRATE)) || defaultStreamBitrate,

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
    const currentStream = get().streams[type]

    if (currentStream) {
      get().restartStream(type)
      return currentStream
    }

    stream?.getTracks().forEach((track) => {
      applyContentHint(type, track)

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

    return stream || null
  },

  async restartStream(type) {
    const currentStream = get().streams[type]

    currentStream?.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })

    const streamConstraints = get().streamConstraints
    const stream = await createMediaStream(type, streamConstraints)
    if (stream) {
      stream.getTracks().forEach((track) => {
        applyContentHint(type, track)
      })
      set((state) => ({
        streams: { ...state.streams, [type]: stream },
      }))
    }
  },

  holdGameScreenTile() {
    const currentStream = get().streams.screen
    const livePoster = gamePoster.stream?.getVideoTracks().some((track) => track.readyState === 'live')
    if (currentStream === gamePoster.stream && livePoster && gamePoster.canvas) return

    currentStream?.getTracks().forEach((track) => {
      track.onended = null
      track.stop()
    })

    const poster = livePoster && gamePoster.stream ? gamePoster.stream : createGamePosterStream()

    set((state) => ({
      streams: { ...state.streams, screen: poster },
    }))
  },

  releaseGameScreenTile() {
    const currentStream = get().streams.screen
    if (currentStream && currentStream === gamePoster.stream) get().stopStream('screen')

    gamePoster.stream?.getTracks().forEach((track) => {
      track.stop()
    })
    gamePoster.canvas = null
    gamePoster.stream = null
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
      if (!stream) return

      const isScreenStream = stream === currentStreams.screen

      stream.getTracks().forEach((track) => {
        const trackConstraints = track.getConstraints()

        if (isScreenStream && track.kind === 'video') {
          track.applyConstraints(getScreenVideoConstraints(streamConstraints)).catch(console.error)
          return
        }

        if (isScreenStream && track.kind === 'audio') {
          track.applyConstraints({
            ...trackConstraints,
            ...getScreenAudioConstraints(streamConstraints),
          }).catch(console.error)
          return
        }

        const newConstraints = streamConstraints[track.kind as 'audio' | 'video']
        if (typeof newConstraints === 'object') {
          track.applyConstraints({
            ...trackConstraints,
            ...newConstraints,
          })
        }
      })
    })
  },
})

export const useWebRTCStore = create<WebRTCStore>()(store)
