export interface RoomRTCSchema {
  streamSettings: MediaStreamConstraints
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
    deviceId?: string
    noiseSuppression: boolean
    echoCancellation: boolean
    autoGainControl: boolean
    channelCount: number
  }
}
