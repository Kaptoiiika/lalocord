export interface IRTCReciverChanelMedia {
  sourceBuffer: SourceBuffer | null
  mediaRecorder: MediaRecorder | null
  readonly channel: RTCDataChannel
  readonly isOpen: boolean
  readonly mediaSource: MediaSource
  readonly queue: ArrayBuffer[]

  readonly play: () => void
  readonly pause: () => void
  readonly onNewMessage: (data: string | ArrayBuffer) => void
  readonly startTransition: (stream: MediaStream) => void
  readonly sendChunk: (data: ArrayBuffer) => void
}
