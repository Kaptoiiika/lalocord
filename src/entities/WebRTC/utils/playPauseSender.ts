export const pauseSender = (sender: RTCRtpSender) => {
  const parameters = sender.getParameters()
  sender.setParameters({
    ...parameters,
    encodings: parameters.encodings.map((encoding) => ({
      ...encoding,
      active: false,
    })),
  })
}

export const resumeSender = (sender: RTCRtpSender) => {
  const parameters = sender.getParameters()
  sender.setParameters({
    ...parameters,
    encodings: parameters.encodings.map((encoding) => ({
      ...encoding,
      active: true,
    })),
  })
}
