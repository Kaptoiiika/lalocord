import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"
import { RTCClientMediaStream } from "./RTCClientMediaStream"

export type RTCMediaStreamEvents =
  | "newstream"
  | "stopStream"
  | "sendStream"
  | "needUpdateStreamType"

export type RemoteTracksTypes = {
  type: MediaStreamTypes
  kind: string
  mid: string | null
}

export class RTCMedia extends Emitter<RTCMediaStreamEvents> {
  peer: RTCPeerConnection | null
  availableStreamList: RTCClientMediaStream[] = []
  remoteStream: Record<string, RTCClientMediaStream | undefined> = {}
  remoteTrack: Record<string, MediaStreamTrack> = {}

  stream: Record<MediaStreamTypes, MediaStream | null> = {
    media: null,
    webCam: null,
    microphone: null,
  }
  senders: Record<MediaStreamTypes, RTCRtpSender[] | null> = {
    media: null,
    webCam: null,
    microphone: null,
  }
  encodingSettings: RTCRtpEncodingParameters = {}
  pause: Record<MediaStreamTypes, boolean> = {
    media: true,
    webCam: true,
    microphone: true,
  }

  private unsubfn

  constructor(peer: RTCPeerConnection) {
    super()
    this.peer = peer
    this.peer.ontrack = this.reciveTrack.bind(this)
    this.unsubfn = this.initStoreSubscribe()
  }

  initStoreSubscribe() {
    const sub = useRoomRTCStore.subscribe((state) => {
      const {
        webCamStream,
        displayMediaStream,
        microphoneStream,
        encodingSettings,
      } = state
      if (webCamStream !== this.stream.webCam && webCamStream)
        this.sendStream(webCamStream, "webCam")
      else if (webCamStream !== this.stream.webCam) {
        this.stopStream("webCam")
      }
      this.stream.webCam = webCamStream

      if (displayMediaStream !== this.stream.media && displayMediaStream)
        this.sendStream(displayMediaStream, "media")
      else if (displayMediaStream !== this.stream.media) {
        this.stopStream("media")
      }
      this.stream.media = displayMediaStream

      if (microphoneStream !== this.stream.media && microphoneStream)
        this.sendStream(microphoneStream, "microphone")
      else if (microphoneStream !== this.stream.microphone) {
        this.stopStream("microphone")
      }
      this.stream.microphone = microphoneStream

      if (encodingSettings !== this.encodingSettings) {
        this.encodingSettings = encodingSettings
        this.updateBitrate("media")
        this.updateBitrate("webCam")
      }
    })
    return sub
  }

  reqestPauseStream(type: MediaStreamTypes) {
    this.pause[type] = true
    this.updateBitrate(type)
  }

  reqestResumeStream(type: MediaStreamTypes) {
    this.pause[type] = false
    this.updateBitrate(type)
  }

  async sendStream(stream: MediaStream, type: MediaStreamTypes) {
    if (!this.peer) return
    const [videoStream] = stream.getVideoTracks()
    const [audioStream] = stream.getAudioTracks()
    const currentSenders = this.senders[type]

    const senderVideo = currentSenders?.find(
      (s) => s.track?.kind === videoStream?.kind
    )
    const senderAudio = currentSenders?.find(
      (s) => s.track?.kind === audioStream?.kind
    )

    const senders = stream.getTracks().map(async (track) => {
      if (senderVideo && track.kind === "video") {
        await senderVideo.replaceTrack(track)
        return senderVideo
      }
      if (senderAudio && track.kind === "audio") {
        await senderAudio.replaceTrack(track)
        return senderAudio
      }

      return this.peer!.addTrack(track, stream) // this.peer checked from the top
    })

    this.senders[type] = await Promise.all(senders)
    this.emit("sendStream")
  }

  getStreamType(): RemoteTracksTypes[] {
    const allTrans = this.peer?.getTransceivers()
    const availableStream: RemoteTracksTypes[] = []

    Object.entries(this.stream).forEach(([key, value]) => {
      value?.getTracks().forEach((track) => {
        const transceiver = allTrans?.find(
          (trans) => trans.sender.track === track
        )

        availableStream.push({
          type: key as MediaStreamTypes,
          kind: track.kind,
          mid: transceiver?.mid || null,
        })
      })
    })

    return availableStream
  }

  reciveTrack(event: RTCTrackEvent) {
    const track = event.track
    this.remoteTrack[track.id] = track

    this.emit("needUpdateStreamType")
    this.log("reciveTrack", track)
  }

  updateStreamType(tracksType: RemoteTracksTypes[]) {
    const transceivers = this.peer?.getTransceivers()
    tracksType.forEach((trackType) => {
      const currentTrans = transceivers?.find(
        (trans) => trans.mid === trackType.mid
      )
      if (!currentTrans) return
      const currentStream = this.remoteStream[trackType.type]
      const currentTrack = currentTrans.receiver.track

      if (currentStream) {
        if (currentTrack) currentStream.addTrack(currentTrack)
        currentStream.open()
        return
      }

      const mediaStream = new MediaStream()
      if (currentTrack) mediaStream.addTrack(currentTrack)
      const clientStream = new RTCClientMediaStream(mediaStream, trackType.type)

      this.remoteStream[trackType.type] = clientStream
      clientStream.on("open", () => {
        if (
          !this.availableStreamList.includes(clientStream) &&
          clientStream.hasvideo
        ) {
          this.availableStreamList.push(clientStream)
        }
        this.emit("newstream", clientStream)
      })
      clientStream.on("close", () => {
        this.availableStreamList = this.availableStreamList.filter(
          (cur) => cur !== clientStream
        )
        this.emit("newstream")
      })
      clientStream.open()
      this.emit("newstream")
    })
  }

  stopStream(type: MediaStreamTypes) {
    this.stream[type] = null
    this.emit("stopStream", type)
  }

  remoteClosedStream(type: MediaStreamTypes) {
    this.remoteStream[type]?.close()
  }

  updateBitrate(type: MediaStreamTypes) {
    if (!this.peer) return

    const videoSender = this.senders[type]
    if (!videoSender) return
    videoSender?.map((sender) => {
      if (sender.track?.kind !== "video") {
        return
      }

      const params = sender.getParameters()
      const encoders = params.encodings.map((encod) => {
        if (this.pause[type]) {
          return {
            ...encod,
            ...this.encodingSettings,
            maxBitrate: 10000,
          }
        }

        return {
          ...encod,
          ...this.encodingSettings,
        }
      })
      params.encodings = encoders
      sender.setParameters(params)
    })
  }

  close() {
    this.unsubfn()
    const senders = [
      ...(this.senders.media || []),
      ...(this.senders.webCam || []),
      ...(this.senders.microphone || []),
    ]
    senders.forEach((sender) => {
      sender.replaceTrack(null)
    })
  }

  private log(...message: any) {
    if (__IS_DEV__) console.log(...message)
  }
}