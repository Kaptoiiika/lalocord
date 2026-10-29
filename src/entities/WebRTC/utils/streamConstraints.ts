import { localstorageKeys } from 'src/shared/const/localstorageKeys'

export type ObjectStreamConstraints = {
  video: MediaTrackConstraints
  audio: MediaTrackConstraints
}

export const defaultStreamConstraints: ObjectStreamConstraints = {
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    channelCount: {
      ideal: 2,
    },
    autoGainControl: false,
  },
  video: {
    frameRate: 30,
    height: 1080,
    displaySurface: 'monitor',
  },
} as const

export const getStreamSettingsfromLocalStorage = (): ObjectStreamConstraints => {
  const json = localStorage.getItem(localstorageKeys.STREAM_CONSTRAINTS)

  if (!json) return defaultStreamConstraints
  const data = JSON.parse(json)

  const settings: ObjectStreamConstraints = {
    audio: {
      ...defaultStreamConstraints.audio,
      ...data?.audio,
      deviceId: data?.audio?.deviceId || undefined,
    },
    video: {
      ...defaultStreamConstraints.video,
      ...data?.video,
      frameRate: Number(data?.video?.frameRate) || defaultStreamConstraints.video?.frameRate,
      height: Number(data?.video?.height) || defaultStreamConstraints.video?.height,
      deviceId: data?.video?.deviceId || undefined,
    },
  }

  return settings
}

export const saveStreamConstraintsToLocalStorage = (streamConstraints: ObjectStreamConstraints) => {
  localStorage.setItem(localstorageKeys.STREAM_CONSTRAINTS, JSON.stringify(streamConstraints))
}

const SCREEN_WIDTH_RATIO = 16
const SCREEN_HEIGHT_RATIO = 9

type NumericConstraint = number | { exact?: number; ideal?: number; max?: number }

const readConstraintNumber = (value: NumericConstraint | undefined, fallback: number) => {
  if (typeof value === 'number' && Number.isFinite(value) && value > 0) return value
  if (!value || typeof value !== 'object') return fallback
  if (typeof value.max === 'number' && value.max > 0) return value.max
  if (typeof value.exact === 'number' && value.exact > 0) return value.exact
  if (typeof value.ideal === 'number' && value.ideal > 0) return value.ideal

  return fallback
}

type LowLatencyVideoConstraints = MediaTrackConstraints & {
  latency?: { ideal: number }
}

// Desktop capture queues frames unless latency is requested, and an uncapped 4K frame misses real time.
export const getScreenVideoConstraints = (streamConstraints: ObjectStreamConstraints): LowLatencyVideoConstraints => {
  const height = readConstraintNumber(streamConstraints.video.height, 1080)
  const frameRate = readConstraintNumber(streamConstraints.video.frameRate, 30)
  const width = Math.round((height * SCREEN_WIDTH_RATIO) / SCREEN_HEIGHT_RATIO)

  return {
    ...streamConstraints.video,
    frameRate: { ideal: frameRate, max: frameRate },
    height: { ideal: height, max: height },
    width: { ideal: width, max: width },
    latency: { ideal: 0 },
  }
}

export type ScreenAudioConstraints = MediaTrackConstraints & {
  restrictOwnAudio?: boolean
}

// Processing on display audio holds the video track for sync and adds tens of milliseconds.
export const getScreenAudioConstraints = (streamConstraints: ObjectStreamConstraints): ScreenAudioConstraints => ({
  ...streamConstraints.audio,
  echoCancellation: false,
  noiseSuppression: false,
  autoGainControl: false,
  restrictOwnAudio: true,
})
