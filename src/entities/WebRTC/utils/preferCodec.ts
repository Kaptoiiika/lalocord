const getCodecKey = (codec: RTCRtpCodec) =>
  [codec.mimeType, codec.clockRate, codec.channels ?? '', codec.sdpFmtpLine ?? ''].join('|')

const uniqueCodecs = (codecs: RTCRtpCodec[]) => {
  const seen = new Set<string>()

  return codecs.filter((codec) => {
    const key = getCodecKey(codec)
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

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

  if (kind !== 'video') return

  // Списки sender и receiver в Chrome переиспользуют payload type для разных профилей.
  // Их объединение роняет createOffer: Duplicate payload type in codec list.
  const codecs = RTCRtpSender.getCapabilities(kind)?.codecs ?? RTCRtpReceiver.getCapabilities(kind)?.codecs ?? []
  const preferredCodecs = uniqueCodecs(preferCodec(codecs, mimeType))

  if (!preferredCodecs.length) return

  transceiver.setCodecPreferences(preferredCodecs)
}
