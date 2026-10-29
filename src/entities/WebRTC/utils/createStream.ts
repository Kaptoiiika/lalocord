import {
  getScreenAudioConstraints,
  getScreenVideoConstraints,
  type ObjectStreamConstraints,
} from './streamConstraints'
import type { StreamType } from '../types'

export const createSilentAudioTrack = () => {
  const ctx = new AudioContext()
  const dst = ctx.createMediaStreamDestination()
  return dst.stream.getAudioTracks()[0]
}

export const createBlackVideoTrack = () => {
  const canvas = document.createElement('canvas')
  canvas.width = 6
  canvas.height = 4
  const ctx = canvas.getContext('2d')
  if (ctx) {
    ctx.fillStyle = 'black'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }
  const stream = canvas.captureStream(0)
  return stream.getVideoTracks()[0]
}

export const createMediaStream = async (type: StreamType, streamConstraints: ObjectStreamConstraints) => {
  if (type === 'screen') {
    return await navigator.mediaDevices.getDisplayMedia({
      audio: getScreenAudioConstraints(streamConstraints),
      video: getScreenVideoConstraints(streamConstraints),
    })
  } else if (type === 'webCam') {
    return await navigator.mediaDevices.getUserMedia({ video: streamConstraints.video })
  } else if (type === 'mic') {
    return await navigator.mediaDevices.getUserMedia({ audio: streamConstraints.audio })
  }
}
