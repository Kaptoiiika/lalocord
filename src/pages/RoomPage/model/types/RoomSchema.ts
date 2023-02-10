export interface RoomSchema {
  roomId: string

  peerConnection: RTCPeerConnection | null
  localDescription: RTCSessionDescriptionInit | null
  remoteDescription: RTCSessionDescriptionInit | null
  iceCandidates: RTCIceCandidate[]

  localStream: MediaStream | null
  remoteStream: MediaStream | null
}

export type User = string
export type Message = { user: User; data: string }
