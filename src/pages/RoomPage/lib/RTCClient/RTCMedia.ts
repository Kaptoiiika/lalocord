import Emitter from "@/shared/lib/utils/Emitter/Emitter"
import { useRoomRTCStore } from "../../model/store/RoomRTCStore"
import { MediaStreamTypes } from "../../model/types/RoomRTCSchema"
import { RTCClientMediaStream } from "./RTCClientMediaStream"

export type Answer = { answer: RTCSessionDescription }
export type Offer = { offer: RTCSessionDescription }
export type Ice = { ice: RTCIceCandidateInit }
export type ClientId = { id: string }

export type RTCMediaStreamEvents = "newstream"

export class RTCMedia extends Emitter<RTCMediaStreamEvents> {
  peer: RTCPeerConnection | null
  remoteStreams: RTCClientMediaStream[] = []

  stream: Record<MediaStreamTypes, MediaStream | null> = {
    media: new MediaStream(),
    webCam: new MediaStream(),
  }
  senders: Record<MediaStreamTypes, RTCRtpSender[] | null> = {
    media: null,
    webCam: null,
  }
  encodingSettings: RTCRtpEncodingParameters = {}

  private unsubfn

  constructor(peer: RTCPeerConnection) {
    super()
    this.peer = peer
    this.peer.ontrack = this.reciveTrack.bind(this)
    this.unsubfn = this.initStoreSubscribe()
  }

  initStoreSubscribe() {
    const sub = useRoomRTCStore.subscribe((state) => {
      const { webCamStream, displayMediaStream, encodingSettings } = state
      if (webCamStream !== this.stream.webCam && webCamStream)
        this.sendStream(webCamStream, "webCam")
      this.stream.webCam = webCamStream

      if (displayMediaStream !== this.stream.media && displayMediaStream)
        this.sendStream(displayMediaStream, "media")
      this.stream.media = displayMediaStream

      if (encodingSettings !== this.encodingSettings) {
        this.encodingSettings = encodingSettings
        this.updateBitrate()
      }
    })
    return sub
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
  }

  reciveTrack(event: RTCTrackEvent) {
    const stream = event.streams[0]
    const track = event.track
    if (track.kind === "video") {
      const clientStream = new RTCClientMediaStream(stream)

      clientStream.stream.getVideoTracks().forEach((track) => {
        track.onmute = () => {
          this.remoteStreams = this.remoteStreams.filter(
            (clientStream) => clientStream !== clientStream
          )
          this.emit("newstream")
        }
        track.onunmute = () => {
          if (!this.remoteStreams.includes(clientStream)) {
            this.remoteStreams.push(clientStream)
            this.emit("newstream", clientStream)
          }
        }
      })
    }
  }

  updateBitrate() {
    if (!this.peer) return

    const videoSender = this.peer
      ?.getSenders()
      .filter((sender) => sender.track?.kind === "video")
    if (!videoSender) return
    videoSender?.map((sender) => {
      const params = sender.getParameters()
      const encoders = params.encodings.map((encod) => {
        return {
          ...encod,
          ...this.encodingSettings,
          networkPriority: this.encodingSettings.priority,
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
    ]
    senders.forEach((sender) => {
      sender.replaceTrack(null)
    })
  }
}
