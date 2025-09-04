import { localstorageKeys } from 'src/shared/const/localstorageKeys'

export type ObjectStreamConstraints = {
  video: MediaTrackConstraints
  audio: MediaTrackConstraints
}

export const defaultStreamConstraints: ObjectStreamConstraints = {
  audio: {
    noiseSuppression: true,
    echoCancellation: true,
    autoGainControl: false,
    channelCount: { ideal: 2 },
  },
  video: {
    frameRate: 30,
    height: 720,
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
