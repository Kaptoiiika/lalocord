import { RTCClient } from "../../../lib/RTCClient/RTCClient"

export interface RoomRTCSchema {
  webCamStream: MediaStream | null
  displayMediaStream: MediaStream | null
  streamSettings: MediaStreamConstraints
  encodingSettings: RTCRtpEncodingParameters
  connectedUsers: ConnectedUsers

  setEncodingSettings: (settings: RTCRtpEncodingParameters) => void
  deleteConnectedUser: (id: UserId) => void
  addConnectedUsers: (...users: RTCClient[]) => void
  setWebCamStream: (stream: MediaStream | null) => void
  setdisplayMediaStream: (stream: MediaStream | null) => void
}

export type ConnectedUsers = Record<UserId, RTCClient>

export type UserId = string
export type User = string
export type Message = { user: User; data: string }
export type MediaStreamTypes = "webCam" | "media"
