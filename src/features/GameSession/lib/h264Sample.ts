const startCodeSize = (bytes: Uint8Array, offset: number) => {
  if (bytes[offset] !== 0 || bytes[offset + 1] !== 0) return 0
  if (bytes[offset + 2] === 1) return 3
  if (bytes[offset + 2] === 0 && bytes[offset + 3] === 1) return 4

  return 0
}

export const splitAnnexB = (data: Uint8Array) => {
  const starts: number[] = []
  for (let index = 0; index < data.length - 3; index += 1) {
    const size = startCodeSize(data, index)
    if (!size) continue
    starts.push(index)
    index += size - 1
  }

  return starts.map((start, index) => {
    const header = start + startCodeSize(data, start)
    const next = starts[index + 1] ?? data.length

    return data.slice(header, next)
  })
}

export const buildAvcDecoderConfig = (nals: Uint8Array[]) => {
  const sps = nals.find((nal) => (nal[0] & 0x1f) === 7)
  const pps = nals.find((nal) => (nal[0] & 0x1f) === 8)
  if (!sps || !pps || sps.length < 4) return null

  const description = new Uint8Array(11 + sps.length + pps.length)
  const view = new DataView(description.buffer)
  description[0] = 1
  description[1] = sps[1]
  description[2] = sps[2]
  description[3] = sps[3]
  description[4] = 0xff
  description[5] = 0xe1
  view.setUint16(6, sps.length)
  description.set(sps, 8)
  const ppsOffset = 8 + sps.length
  description[ppsOffset] = 1
  view.setUint16(ppsOffset + 1, pps.length)
  description.set(pps, ppsOffset + 3)

  const hex = (value: number) => value.toString(16).padStart(2, '0')

  return {
    codec: `avc1.${hex(sps[1])}${hex(sps[2])}${hex(sps[3])}`,
    description,
  }
}

export const annexBToAvcc = (nals: Uint8Array[]) => {
  const length = nals.reduce((sum, nal) => sum + 4 + nal.length, 0)
  const sample = new Uint8Array(length)
  const view = new DataView(sample.buffer)
  let offset = 0

  nals.forEach((nal) => {
    view.setUint32(offset, nal.length)
    sample.set(nal, offset + 4)
    offset += 4 + nal.length
  })

  return sample
}
