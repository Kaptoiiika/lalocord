import { getVideoCaptureSize } from 'src/entities/WebRTC/utils/streamConstraints'

import type { ObjectStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'
import type { GameCaptureSettings } from 'src/shared/types/GameSession'

export const toGameCaptureSettings = (streamConstraints: ObjectStreamConstraints, bitrate: number): GameCaptureSettings => {
  const size = getVideoCaptureSize(streamConstraints)

  return {
    width: Math.max(2, Math.round(size.width)),
    height: Math.max(2, Math.round(size.height)),
    frameRate: Math.max(1, Math.round(size.frameRate)),
    bitrate: Math.max(1, Math.round(bitrate)),
  }
}
