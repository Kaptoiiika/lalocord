export const preferCodec = (codecs: RTCRtpCodec[] = [], mimeType: string) => {
  const otherCodecs: RTCRtpCodec[] = []
  const sortedCodecs: RTCRtpCodec[] = []

  codecs.forEach((codec) => {
    if (codec.mimeType.includes(mimeType)) {
      sortedCodecs.push(codec)
    } else {
      otherCodecs.push(codec)
    }
  })

  return sortedCodecs.concat(otherCodecs)
}

export const changeVideoCodecs = (transceiver: RTCRtpTransceiver, mimeType: string) => {
  const kind = transceiver.sender.track?.kind

  if (!kind) return
  const sendCodecs = RTCRtpSender.getCapabilities(kind)?.codecs
  const recvCodecs = RTCRtpReceiver.getCapabilities(kind)?.codecs

  if (kind === 'video') {
    const newsendCodecs = preferCodec(sendCodecs, mimeType)
    const newrecvCodecs = preferCodec(recvCodecs, mimeType)

    transceiver.setCodecPreferences([...newsendCodecs, ...newrecvCodecs])
  }
}
