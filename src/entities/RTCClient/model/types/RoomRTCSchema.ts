import { RTCClient } from "../../lib/RTCClient/RTCClient"

export interface RoomRTCSchema {
  roomName: string | null
  connectedUsers: ConnectedUsers
  webCamStream: MediaStream | null
  displayMediaStream: MediaStream | null
  microphoneStream: MediaStream | null
  streamSettings: MediaStreamConstraints
  userStreamSettings: UserStreamSettings
  encodingSettings: RTCRtpEncodingParameters
  autoplay: boolean

  joinRoom: (room: string) => void
  leaveRoom: () => void
  setEncodingSettings: (settings: RTCRtpEncodingParameters) => void
  deleteConnectedUser: (id: UserId) => void
  addConnectedUsers: (...users: RTCClient[]) => void
  startWebCamStream: () => Promise<void>
  stopWebCamStream: () => void
  setdisplayMediaStream: (stream: MediaStream | null) => void
  startMicrophoneStream: () => Promise<void>
  stopMicrophoneStream: () => void
  changeAutoplay: (condition: boolean) => void
  setStreamSettings: (streamSettings: UserStreamSettings) => void
}

export type ConnectedUsers = Record<UserId, RTCClient>
export type UserId = string
export type MediaStreamTypes = "webCam" | "media" | "microphone"
export type VideoStreamSettingsHint = "detail" | "motion" | "default"
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
