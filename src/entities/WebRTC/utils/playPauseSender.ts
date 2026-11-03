const setSenderActive = (sender: RTCRtpSender, isActive: boolean) => {
  try {
    const parameters = sender.getParameters()
    if (!parameters.encodings?.length) return

    void sender
      .setParameters({
        ...parameters,
        encodings: parameters.encodings.map((encoding) => ({
          ...encoding,
          active: isActive,
        })),
      })
      .catch((error) => {
        console.error(error)
      })
  } catch (error) {
    console.error(error)
  }
}

export const pauseSender = (sender: RTCRtpSender) => {
  setSenderActive(sender, false)
}

export const resumeSender = (sender: RTCRtpSender) => {
  setSenderActive(sender, true)
}
