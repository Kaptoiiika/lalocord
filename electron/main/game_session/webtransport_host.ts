import { execFileSync, spawn } from 'node:child_process'
import { existsSync } from 'node:fs'
import path from 'node:path'

import { app } from 'electron'
import { isRemoteControlEvent } from 'src/shared/types/ClientEvents'

import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'

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

// Electron's V8 sandbox rejects the external ArrayBuffer that the quiche addon uses for datagrams.
// The server therefore runs in system Node, which still allows those buffers.
const resolveNodeBinary = () => {
  const fromNpm = process.env.npm_node_execpath
  if (fromNpm && existsSync(fromNpm) && !fromNpm.toLowerCase().includes('electron')) return fromNpm

  let listed = ''
  try {
    listed = execFileSync('where.exe', ['node'], { encoding: 'utf8', windowsHide: true })
  } catch (error) {
    console.error(error)
  }
  const nodePath = listed
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find((line) => line.length > 0 && existsSync(line) && !line.toLowerCase().includes('electron'))

  if (!nodePath) throw new Error('Node.js was not found. Game session cannot start inside Electron')

  return nodePath
}

const firstExisting = (candidates: string[]) => candidates.find((candidate) => existsSync(candidate))

const resolveHostPaths = () => {
  const script = firstExisting([
    path.join(app.getAppPath(), 'electron', 'main', 'game_session', 'transport_host.mjs'),
    path.join(process.cwd(), 'electron', 'main', 'game_session', 'transport_host.mjs'),
    path.join(process.resourcesPath, 'game-session', 'transport_host.mjs'),
  ])
  const webtransport = firstExisting([
    path.join(process.resourcesPath, 'app.asar.unpacked', 'node_modules', '@fails-components', 'webtransport', 'lib', 'index.node.js'),
    path.join(app.getAppPath(), 'node_modules', '@fails-components', 'webtransport', 'lib', 'index.node.js'),
    path.join(process.cwd(), 'node_modules', '@fails-components', 'webtransport', 'lib', 'index.node.js'),
  ])

  if (!script) throw new Error('WebTransport host script was not found')
  if (!webtransport) throw new Error('WebTransport package was not found')

  return { script, webtransport }
}

const writeMessage = (stdin: NodeJS.WritableStream, type: number, payload: Uint8Array) => {
  const header = Buffer.alloc(5)
  header[0] = type
  header.writeUInt32BE(payload.byteLength, 1)
  stdin.write(header)
  stdin.write(payload)
}

export const startWebTransportHost = async (options: {
  cert: string
  privateKey: string
  secret: string
  token: string
  onInput: (event: RemoteControlEvent) => void
  onViewers: (viewers: number) => void
  onDropped: (count: number) => void
  onFailure: (message: string) => void
}) => {
  const nodeBinary = resolveNodeBinary()
  const { script, webtransport } = resolveHostPaths()
  const child = spawn(nodeBinary, [script], {
    windowsHide: true,
    stdio: ['pipe', 'pipe', 'pipe'],
    env: {
      ...process.env,
      GAME_SESSION_WEBTRANSPORT: webtransport,
    },
  })
  if (!child.stdin || !child.stdout || !child.stderr) throw new Error('WebTransport host pipes were not created')
  child.stdin.on('error', () => undefined)
  child.stdout.on('error', () => undefined)
  child.stderr.on('error', () => undefined)

  let finished = false
  let isReady = false
  let stderr = ''
  let pending = Buffer.alloc(0)
  let resolveReady: (port: number) => void = () => undefined
  let rejectReady: (error: Error) => void = () => undefined
  const ready = new Promise<number>((resolve, reject) => {
    resolveReady = resolve
    rejectReady = reject
  })

  const finish = (message?: string) => {
    if (finished) return
    finished = true
    if (!child.killed) child.kill()
    if (!isReady) rejectReady(new Error(message || stderr || 'WebTransport host failed'))
    else if (message) options.onFailure(message)
  }

  const handleMessage = (type: number, payload: Uint8Array) => {
    if (type === TYPE_READY) {
      const message = JSON.parse(textDecoder.decode(payload)) as { port?: unknown }
      if (typeof message.port !== 'number') {
        finish('WebTransport host returned an invalid port')
        return
      }
      isReady = true
      resolveReady(message.port)
      return
    }

    if (type === TYPE_VIEWERS) {
      const message = JSON.parse(textDecoder.decode(payload)) as { viewers?: unknown }
      if (typeof message.viewers === 'number') options.onViewers(message.viewers)
      return
    }

    if (type === TYPE_INPUT) {
      try {
        const event: unknown = JSON.parse(textDecoder.decode(payload))
        if (isRemoteControlEvent(event)) options.onInput(event)
      } catch (error) {
        console.error(error)
      }
      return
    }

    if (type === TYPE_DROPPED) {
      const message = JSON.parse(textDecoder.decode(payload)) as { dropped?: unknown }
      if (typeof message.dropped === 'number') options.onDropped(message.dropped)
      return
    }

    if (type === TYPE_ERROR) {
      const message = JSON.parse(textDecoder.decode(payload)) as { message?: unknown }
      finish(typeof message.message === 'string' ? message.message : 'WebTransport host failed')
    }
  }

  child.stdout.on('data', (chunk: Buffer) => {
    pending = pending.length ? Buffer.concat([pending, chunk]) : chunk
    while (pending.length >= 5) {
      const length = pending.readUInt32BE(1)
      if (pending.length < 5 + length) return

      const type = pending[0]
      const payload = new Uint8Array(pending.subarray(5, 5 + length))
      pending = pending.subarray(5 + length)
      try {
        handleMessage(type, payload)
      } catch (error) {
        console.error(error)
      }
    }
  })
  child.stderr.on('data', (chunk: Buffer) => {
    stderr = `${stderr}${chunk.toString()}`.slice(-4000)
  })
  child.on('exit', (code) => {
    finish(stderr || `WebTransport host exited with code ${code ?? 'unknown'}`)
  })

  writeMessage(
    child.stdin,
    TYPE_START,
    Buffer.from(JSON.stringify({
      cert: options.cert,
      privateKey: options.privateKey,
      secret: options.secret,
      token: options.token,
    }))
  )

  const port = await ready

  return {
    port,
    setConfig: (codec: string, width: number, height: number) => {
      if (!child.stdin) return
      writeMessage(child.stdin, TYPE_CONFIG, Buffer.from(JSON.stringify({ codec, width, height })))
    },
    publishFrame: (frame: Uint8Array, isKey: boolean) => {
      if (!child.stdin) return
      const payload = new Uint8Array(1 + frame.byteLength)
      payload[0] = isKey ? 1 : 0
      payload.set(frame, 1)
      writeMessage(child.stdin, TYPE_FRAME, payload)
    },
    publishAudio: (pcm: Uint8Array) => {
      if (!child.stdin || pcm.byteLength === 0) return
      writeMessage(child.stdin, TYPE_AUDIO, pcm)
    },
    stop: () => {
      if (finished) return
      finished = true
      if (child.stdin) writeMessage(child.stdin, TYPE_STOP, new Uint8Array())
      child.kill()
    },
  }
}
