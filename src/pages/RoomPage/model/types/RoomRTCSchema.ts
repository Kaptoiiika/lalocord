import { RTCClient } from "../../lib/RTCClient/RTCClient"

export interface RoomRTCSchema {
  roomName: string | null
  connectedUsers: ConnectedUsers
  webCamStream: MediaStream | null
  displayMediaStream: MediaStream | null
  streamSettings: MediaStreamConstraints
  encodingSettings: RTCRtpEncodingParameters

  joinRoom: (room: string) => void
  leaveRoom: () => void
  setEncodingSettings: (settings: RTCRtpEncodingParameters) => void
  deleteConnectedUser: (id: UserId) => void
  addConnectedUsers: (...users: RTCClient[]) => void
  setWebCamStream: (stream: MediaStream | null) => void
  setdisplayMediaStream: (stream: MediaStream | null) => void
}

export type ConnectedUsers = Record<UserId, RTCClient>
export type UserId = string
export type MediaStreamTypes = "webCam" | "media"
