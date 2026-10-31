// The game data channel is unreliable, so one logical packet is cut into parts.
// A lost part is dropped; the viewer waits for the next keyframe instead of stalling.
const GAME_CHANNEL_PART_BYTES = 48 * 1024

export const GAME_CHANNEL_BUFFER_LIMIT = 256 * 1024

export const encodeGamePacket = (kind: number, payload: Uint8Array) => {
  const packet = new Uint8Array(5 + payload.byteLength)
  const view = new DataView(packet.buffer)
  packet[0] = kind
  view.setUint32(1, payload.byteLength)
  packet.set(payload, 5)

  return packet
}

export const readGamePacket = (packet: Uint8Array) => {
  if (packet.byteLength < 5) return null

  const view = new DataView(packet.buffer, packet.byteOffset, packet.byteLength)
  const length = view.getUint32(1)
  if (packet.byteLength < 5 + length) return null

  return {
    kind: packet[0],
    payload: packet.subarray(5, 5 + length),
  }
}

export const isGameVideoKey = (packet: Uint8Array) => packet.byteLength >= 6 && packet[0] === 2 && packet[5] === 1

export const splitGamePacket = (packetId: number, packet: Uint8Array) => {
  const partCount = Math.max(1, Math.ceil(packet.byteLength / GAME_CHANNEL_PART_BYTES))
  const parts: Uint8Array[] = []

  for (let index = 0; index < partCount; index += 1) {
    const slice = packet.subarray(index * GAME_CHANNEL_PART_BYTES, (index + 1) * GAME_CHANNEL_PART_BYTES)
    const message = new Uint8Array(8 + slice.byteLength)
    const view = new DataView(message.buffer)
    view.setUint32(0, packetId)
    view.setUint16(4, index)
    view.setUint16(6, partCount)
    message.set(slice, 8)
    parts.push(message)
  }

  return parts
}

export const createGamePacketAssembler = (onPacket: (packet: Uint8Array) => void, onGap: () => void) => {
  const pending = new Map<number, { count: number; parts: Array<Uint8Array | undefined> }>()
  let lastCompletedId: number | null = null

  return (message: Uint8Array) => {
    if (message.byteLength < 8) return

    const view = new DataView(message.buffer, message.byteOffset, message.byteLength)
    const packetId = view.getUint32(0)
    const index = view.getUint16(4)
    const count = view.getUint16(6)
    if (count === 0 || index >= count) return

    let entry = pending.get(packetId)
    if (!entry || entry.count !== count) {
      entry = { count, parts: [] }
      pending.set(packetId, entry)
    }
    entry.parts[index] = message.slice(8)

    let hasGap = false
    const staleIds: number[] = []
    pending.forEach((_item, id) => {
      const behind = (packetId - id) >>> 0
      if (behind > 16 && behind < 0x80000000) staleIds.push(id)
    })
    staleIds.forEach((id) => {
      hasGap = true
      pending.delete(id)
    })

    const current = pending.get(packetId)
    if (!current) return

    let filled = 0
    for (let partIndex = 0; partIndex < current.count; partIndex += 1) {
      if (current.parts[partIndex]) filled += 1
    }
    if (filled !== current.count) {
      if (hasGap) onGap()
      return
    }

    let length = 0
    current.parts.forEach((part) => {
      if (part) length += part.byteLength
    })
    const packet = new Uint8Array(length)
    let offset = 0
    current.parts.forEach((part) => {
      if (!part) return
      packet.set(part, offset)
      offset += part.byteLength
    })
    pending.delete(packetId)
    const distance = lastCompletedId === null ? 0 : (packetId - lastCompletedId) >>> 0
    const isNewerPacket = lastCompletedId === null || (distance > 0 && distance < 0x80000000)
    if (isNewerPacket && lastCompletedId !== null && distance > 1) {
      let isMissing = distance > 64
      for (let step = 1; step < distance && step <= 64; step += 1) {
        const id = (lastCompletedId + step) >>> 0
        if (!pending.has(id)) isMissing = true
      }
      if (isMissing) hasGap = true
    }
    if (isNewerPacket) lastCompletedId = packetId
    if (hasGap) onGap()
    onPacket(packet)
  }
}
