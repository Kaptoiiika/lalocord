export const createSilentAudioTrack = () => {
  const ctx = new AudioContext()
  const oscillator = ctx.createOscillator()
  const dst = ctx.createMediaStreamDestination()
  oscillator.connect(dst)
  oscillator.start()
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
  const stream = canvas.captureStream()
  return stream.getVideoTracks()[0]
}
