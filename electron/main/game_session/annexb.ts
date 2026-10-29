export type AnnexBFrame = {
  data: Uint8Array
  isKey: boolean
}

const startCodeSize = (bytes: Uint8Array, offset: number) => {
  if (bytes[offset] !== 0 || bytes[offset + 1] !== 0) return 0
  if (bytes[offset + 2] === 1) return 3
  if (bytes[offset + 2] === 0 && bytes[offset + 3] === 1) return 4

  return 0
}

const nalType = (nal: Uint8Array) => {
  const header = startCodeSize(nal, 0)

  return nal[header] & 0x1f
}

const isVcl = (type: number) => type === 1 || type === 5

const concatBytes = (chunks: Uint8Array[]) => {
  const length = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0)
  const frame = new Uint8Array(length)
  let offset = 0

  chunks.forEach((chunk) => {
    frame.set(chunk, offset)
    offset += chunk.byteLength
  })

  return frame
}

export const createAnnexBSplitter = (onFrame: (frame: AnnexBFrame) => void) => {
  let pending = new Uint8Array(0)
  let accessUnit: Uint8Array[] = []
  let hasVcl = false
  let savedSps: Uint8Array | null = null
  let savedPps: Uint8Array | null = null

  const emit = () => {
    if (!accessUnit.length) return
    const isKey = accessUnit.some((nal) => nalType(nal) === 5)
    const hasSps = accessUnit.some((nal) => nalType(nal) === 7)
    const unit = isKey && !hasSps && savedSps && savedPps ? [savedSps, savedPps].concat(accessUnit) : accessUnit
    const data = concatBytes(unit)
    accessUnit = []
    hasVcl = false
    onFrame({ data, isKey })
  }

  const pushNal = (nal: Uint8Array) => {
    const type = nalType(nal)
    if (type === 7) savedSps = nal
    if (type === 8) savedPps = nal
    const startsAccessUnit = type === 9 || (isVcl(type) && hasVcl)

    if (startsAccessUnit) emit()
    accessUnit.push(nal)
    if (isVcl(type)) hasVcl = true
  }

  return {
    push(chunk: Uint8Array) {
      const combined = new Uint8Array(pending.length + chunk.length)
      combined.set(pending)
      combined.set(chunk, pending.length)

      const starts: number[] = []
      for (let index = 0; index < combined.length - 3; index += 1) {
        const size = startCodeSize(combined, index)
        if (!size) continue
        starts.push(index)
        index += size - 1
      }

      if (starts.length < 2) {
        pending = combined
        return
      }

      for (let index = 0; index < starts.length - 1; index += 1) {
        pushNal(combined.slice(starts[index], starts[index + 1]))
      }

      pending = combined.slice(starts[starts.length - 1])
    },
  }
}
