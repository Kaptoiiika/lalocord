import { RTCReciverChanelMedia } from "./RTCReciverChanelMedia"
import { RTCSenderChanelMedia } from "./RTCSenderChanelMedia"

export type SettingMessage = "play" | "close"

export class RTCChanelMedia {
  channel: RTCDataChannel
  sender: RTCSenderChanelMedia
  reciver?: RTCReciverChanelMedia

  constructor(private readonly peer: RTCPeerConnection, label = "media") {
    this.channel = this.peer.createDataChannel(label)
    this.channel.binaryType = "arraybuffer"
    this.channel.onopen = () => {
      if (this.peer.sctp?.maxMessageSize) {
        this.channel.bufferedAmountLowThreshold = this.peer.sctp.maxMessageSize
      }
    }

    const datachannelfunction = (e: RTCDataChannelEvent) => {
      if (e.channel.label === label) {
        this.reciver = new RTCReciverChanelMedia(e.channel)
        this.peer.removeEventListener("datachannel", datachannelfunction)
      }
    }
    this.peer.addEventListener("datachannel", datachannelfunction)

    this.sender = new RTCSenderChanelMedia(this.channel)
  }
}
