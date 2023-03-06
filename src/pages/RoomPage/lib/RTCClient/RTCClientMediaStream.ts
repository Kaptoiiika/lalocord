export class RTCClientMediaStream {
  stream: MediaStream
  volume = 0

  constructor(mediastream: MediaStream) {
    this.stream = mediastream
  }
}
