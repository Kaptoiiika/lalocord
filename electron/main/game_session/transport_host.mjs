import { pathToFileURL } from 'node:url'

const TYPE_READY = 1
const TYPE_VIEWERS = 2
const TYPE_INPUT = 3
const TYPE_ERROR = 4
const TYPE_START = 5
const TYPE_FRAME = 6
const TYPE_STOP = 7
const TYPE_CONFIG = 8
const TYPE_AUDIO = 9
const TYPE_DROPPED = 10

const textDecoder = new TextDecoder()

const writeMessage = (type, payload) => {
  const header = Buffer.alloc(5)
  header[0] = type
  header.writeUInt32BE(payload.length, 1)
  process.stdout.write(header)
  process.stdout.write(payload)
}

const writeJson = (type, value) => {
  writeMessage(type, Buffer.from(JSON.stringify(value)))
}

const encodePacket = (kind, payload) => {
  const packet = new Uint8Array(5 + payload.byteLength)
  const view = new DataView(packet.buffer)
  packet[0] = kind
  view.setUint32(1, payload.byteLength)
  packet.set(payload, 5)

  return packet
}

const encodeConfigPacket = (codec, width, height) => {
  const payload = new TextEncoder().encode(JSON.stringify({ codec, width, height }))

  return encodePacket(1, payload)
}

const encodeFramePacket = (frame, isKey) => {
  const payload = new Uint8Array(1 + frame.byteLength)
  payload[0] = isKey ? 1 : 0
  payload.set(frame, 1)

  return encodePacket(2, payload)
}

const parseHello = (bytes, token) => {
  try {
    const message = JSON.parse(textDecoder.decode(bytes))

    return message.type === 'hello' && message.token === token
  } catch {
    return false
  }
}

const messages = []
let notifyMessage = null

const pushMessage = (message) => {
  if (notifyMessage) {
    const resolve = notifyMessage
    notifyMessage = null
    resolve(message)
    return
  }

  messages.push(message)
}

const nextMessage = () => {
  const queued = messages.shift()
  if (queued) return Promise.resolve(queued)

  return new Promise((resolve) => {
    notifyMessage = resolve
  })
}

let pending = Buffer.alloc(0)
process.stdin.on('data', (chunk) => {
  pending = pending.length ? Buffer.concat([pending, chunk]) : chunk

  while (pending.length >= 5) {
    const length = pending.readUInt32BE(1)
    if (pending.length < 5 + length) return

    const type = pending[0]
    const payload = new Uint8Array(pending.subarray(5, 5 + length))
    pending = pending.subarray(5 + length)
    pushMessage({ type, payload })
  }
})

process.stdin.on('end', () => {
  process.exit(0)
})

const start = await nextMessage()
if (start.type !== TYPE_START) {
  writeJson(TYPE_ERROR, { message: 'WebTransport host did not receive a start message' })
  process.exit(1)
}

const options = JSON.parse(textDecoder.decode(start.payload))
const moduleUrl = pathToFileURL(process.env.GAME_SESSION_WEBTRANSPORT ?? '').href
const imported = await import(moduleUrl)
await imported.quicheLoaded

const server = new imported.Http3Server({
  port: 0,
  host: '0.0.0.0',
  secret: options.secret,
  cert: options.cert,
  privKey: options.privateKey,
  defaultDatagramsReadableMode: 'bytes',
})

let controller = null
const subscribers = new Set()
let configPacket = null
let lastKeyPacket = null

const reportViewers = () => {
  writeJson(TYPE_VIEWERS, { viewers: subscribers.size })
}

server.setRequestCallback(async (request) => {
  if (request.header[':path'] === '/game') return { status: 200, path: '/game' }

  return { status: 404 }
})

const acceptSession = async (session) => {
  try {
    await session.ready
    const reader = session.datagrams.readable.getReader()
    const hello = await reader.read()
    if (hello.done || !parseHello(hello.value, options.token)) {
      session.close({ closeCode: 1, reason: 'unauthorized' })
      return
    }

    if (!controller) controller = session
    const stream = await session.createUnidirectionalStream()
    const writer = stream.getWriter()
    let pendingPacket = null
    let isWriting = false
    let isClosed = false

    const audioQueue = []

    const pump = async () => {
      if (isWriting || isClosed) return
      isWriting = true
      // Write the waiting frame before PCM so a large audio chunk does not hold the picture.
      while (!isClosed && (pendingPacket || audioQueue.length > 0)) {
        if (pendingPacket) {
          const packet = pendingPacket
          pendingPacket = null
          await writer.write(packet.bytes)
        }

        const audio = audioQueue.shift()
        if (audio) await writer.write(audio)
      }
      isWriting = false
      if (!isClosed && (pendingPacket || audioQueue.length > 0)) {
        pump().catch(() => {
          subscriber.close()
        })
      }
    }

    const subscriber = {
      write: (packet) => {
        if (pendingPacket?.isKey && !packet.isKey) {
          writeJson(TYPE_DROPPED, { dropped: 1 })
          return
        }
        pendingPacket = packet
        pump().catch(() => {
          subscriber.close()
        })
      },
      writeAudio: (packet) => {
        audioQueue.push(packet)
        if (audioQueue.length > 6) audioQueue.shift()
        pump().catch(() => {
          subscriber.close()
        })
      },
      close: () => {
        if (isClosed) return
        isClosed = true
        subscribers.delete(subscriber)
        if (controller === session) controller = subscribers.values().next().value?.session ?? null
        reportViewers()
        writer.close().catch(() => undefined)
      },
    }
    subscriber.session = session

    if (configPacket) await writer.write(configPacket)
    subscribers.add(subscriber)
    reportViewers()
    if (lastKeyPacket) subscriber.write(lastKeyPacket)

    session.closed.finally(() => {
      subscriber.close()
    })

    const readInput = async () => {
      while (true) {
        const message = await reader.read()
        if (message.done) return
        if (controller !== session) continue
        writeMessage(TYPE_INPUT, Buffer.from(message.value))
      }
    }
    readInput().catch(() => {
      subscriber.close()
    })
  } catch (error) {
    console.error(error)
    session.close({ closeCode: 1, reason: 'failed' })
  }
}

const readSessions = async () => {
  const sessionReader = server.sessionStream('/game').getReader()
  while (true) {
    const next = await sessionReader.read()
    if (next.done) return
    acceptSession(next.value)
  }
}

readSessions().catch((error) => {
  console.error(error)
})

server.startServer()
await server.ready
const address = server.address()
if (!address) {
  writeJson(TYPE_ERROR, { message: 'WebTransport server did not report a port' })
  process.exit(1)
}

writeJson(TYPE_READY, { port: address.port })

const publishFrame = (frame, isKey) => {
  const packet = { bytes: encodeFramePacket(frame, isKey), isKey }
  if (isKey) lastKeyPacket = packet
  subscribers.forEach((subscriber) => {
    subscriber.write(packet)
  })
}

while (true) {
  const message = await nextMessage()
  if (message.type === TYPE_STOP) break
  if (message.type === TYPE_CONFIG) {
    const config = JSON.parse(textDecoder.decode(message.payload))
    configPacket = encodeConfigPacket(config.codec, config.width, config.height)
  }
  if (message.type === TYPE_FRAME) {
    publishFrame(message.payload.subarray(1), message.payload[0] === 1)
  }
  if (message.type === TYPE_AUDIO) {
    const packet = encodePacket(3, message.payload)
    subscribers.forEach((subscriber) => {
      subscriber.writeAudio(packet)
    })
  }
}

subscribers.forEach((subscriber) => {
  subscriber.session.close()
})
server.stopServer()
process.exit(0)
