export interface RoomRTCSchema {
  streamSettings: MediaStreamConstraints
  userStreamSettings: UserStreamSettings
  encodingSettings: RTCRtpEncodingParameters

  setEncodingSettings: (settings: RTCRtpEncodingParameters) => void
  setStreamSettings: (streamSettings: UserStreamSettings) => void
}

export type VideoStreamSettingsHint = 'detail' | 'motion' | 'default'
export type UserStreamSettings = {
  video: {
    frameRate: number
    height: number
    hint?: VideoStreamSettingsHint
    deviceId?: string
  }
  audio: {
    autoOn?: boolean
    deviceId?: string
    noiseSuppression: boolean
    echoCancellation: boolean
    autoGainControl: boolean
    channelCount: number
  }
}
