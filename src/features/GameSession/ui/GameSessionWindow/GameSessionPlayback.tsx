import { useEffect, useRef, useState } from 'react'

import { RemoteControlLayer } from 'src/features/RemoteControl'
import { classNames } from 'src/shared/lib/classNames/classNames'

import type { WebRTCClient } from 'src/entities/WebRTC'
import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'
import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { createGamePacketAssembler, readGamePacket } from '../../lib/gameChannelPacket'
import { annexBToAvcc, buildAvcDecoderConfig, splitAnnexB } from '../../lib/h264Sample'

import styles from './GameSessionWindow.module.scss'

type GameSessionPlaybackProps = {
  offer: GameSessionOffer
  peer: WebRTCClient | null
  audioContext: AudioContext
  isControlEnabled: boolean
  isRelativePointer: boolean
  onExit: () => void
  onFailed: () => void
}

type DecoderConfig = {
  codec: string
  description: Uint8Array
}

const DIRECT_CONNECT_MS = 2500
const CHANNEL_CONNECT_MS = 12000
const HELLO_RETRY_MS = 300

const sameBytes = (left: Uint8Array, right: Uint8Array) => {
  if (left.length !== right.length) return false

  return left.every((value, index) => value === right[index])
}

const readPackets = async (
  reader: ReadableStreamDefaultReader<Uint8Array>,
  onPacket: (kind: number, payload: Uint8Array) => void
) => {
  let pending = new Uint8Array(0)

  while (true) {
    const next = await reader.read()
    if (next.done) return

    const combined = new Uint8Array(pending.length + next.value.length)
    combined.set(pending)
    combined.set(next.value, pending.length)
    pending = combined

    while (pending.length >= 5) {
      const view = new DataView(pending.buffer, pending.byteOffset, pending.byteLength)
      const length = view.getUint32(1)
      if (pending.length < 5 + length) break

      onPacket(pending[0], pending.slice(5, 5 + length))
      pending = pending.slice(5 + length)
    }
  }
}

export const GameSessionPlayback = (props: GameSessionPlaybackProps) => {
  const { offer, peer, audioContext, isControlEnabled, isRelativePointer, onExit, onFailed } = props
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const surfaceRef = useRef<HTMLDivElement>(null)
  const sendInputRef = useRef<(event: RemoteControlEvent) => void>(() => undefined)
  const onExitRef = useRef(onExit)
  const onFailedRef = useRef(onFailed)
  const [isReady, setIsReady] = useState(false)

  onExitRef.current = onExit
  onFailedRef.current = onFailed

  useEffect(() => {
    const canvas = canvasRef.current
    const surface = surfaceRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !surface || !context) return

    let isStopped = false
    let isDirectReady = false
    let transport: WebTransport | null = null
    let stopChannel = () => undefined
    let audioRemainder = new Uint8Array(0)
    let nextAudioTime = 0
    const audioSources: AudioBufferSourceNode[] = []

    const playPcm = (chunk: Uint8Array) => {
      if (isStopped || audioContext.state === 'closed') return

      const combined = new Uint8Array(audioRemainder.length + chunk.length)
      combined.set(audioRemainder)
      combined.set(chunk, audioRemainder.length)
      const usable = combined.length - (combined.length % 4)
      audioRemainder = combined.slice(usable)
      if (usable < 4) return

      const view = new DataView(combined.buffer, combined.byteOffset, usable)
      const frames = usable / 4
      const audioBuffer = audioContext.createBuffer(2, frames, 48000)
      const left = audioBuffer.getChannelData(0)
      const right = audioBuffer.getChannelData(1)
      for (let index = 0; index < frames; index += 1) {
        left[index] = view.getInt16(index * 4, true) / 32768
        right[index] = view.getInt16(index * 4 + 2, true) / 32768
      }

      const source = audioContext.createBufferSource()
      source.buffer = audioBuffer
      source.connect(audioContext.destination)
      const now = audioContext.currentTime
      if (nextAudioTime < now + 0.01 || nextAudioTime > now + 0.25) nextAudioTime = now + 0.02
      source.start(nextAudioTime)
      nextAudioTime += audioBuffer.duration
      audioSources.push(source)
    }
    let decoder: VideoDecoder | null = null
    let decoderConfig: DecoderConfig | null = null
    let timestamp = 0
    let waitForKey = true

    const resizeCanvas = () => {
      const width = Math.max(1, Math.round(surface.clientWidth * devicePixelRatio))
      const height = Math.max(1, Math.round(surface.clientHeight * devicePixelRatio))
      if (canvas.width !== width) canvas.width = width
      if (canvas.height !== height) canvas.height = height
    }

    const observer = new ResizeObserver(resizeCanvas)
    observer.observe(surface)
    resizeCanvas()

    const closeDecoder = () => {
      if (decoder && decoder.state !== 'closed') decoder.close()
      decoder = null
    }

    const openDecoder = () => {
      const next = new VideoDecoder({
        output: (frame) => {
          context.drawImage(frame, 0, 0, canvas.width, canvas.height)
          frame.close()
        },
        error: (error) => {
          console.error(error)
          if (decoder !== next) return
          closeDecoder()
          decoderConfig = null
          waitForKey = true
          openDecoder()
        },
      })
      closeDecoder()
      decoder = next
      if (decoderConfig) {
        next.configure({
          codec: decoderConfig.codec,
          description: decoderConfig.description,
          optimizeForLatency: true,
          hardwareAcceleration: 'prefer-hardware',
        })
      }
    }

    const configureDecoder = (config: DecoderConfig) => {
      const hasSameDescription = Boolean(decoderConfig && sameBytes(decoderConfig.description, config.description))
      if (decoderConfig?.codec === config.codec && hasSameDescription) return

      decoderConfig = config
      waitForKey = true
      if (!decoder || decoder.state === 'closed') openDecoder()
      decoder?.configure({
        codec: config.codec,
        description: config.description,
        optimizeForLatency: true,
        hardwareAcceleration: 'prefer-hardware',
      })
    }

    const decodeFrame = (payload: Uint8Array) => {
      const isKey = payload[0] === 1
      const nals = splitAnnexB(payload.subarray(1))
      const nextConfig = buildAvcDecoderConfig(nals)
      if (nextConfig) configureDecoder(nextConfig)
      if (!decoder || !decoderConfig || decoder.state !== 'configured') return
      if (waitForKey && !isKey) return

      waitForKey = false
      timestamp += 16667
      try {
        decoder.decode(
          new EncodedVideoChunk({
            type: isKey ? 'key' : 'delta',
            timestamp,
            data: annexBToAvcc(nals),
          })
        )
      } catch (error) {
        console.error(error)
      }
    }

    const handlePayload = (kind: number, payload: Uint8Array) => {
      if (kind === 2) decodeFrame(payload)
      if (kind === 3) playPcm(payload)
    }

    openDecoder()
    void audioContext.resume()

    const connectDirect = async () => {
      const hash = Uint8Array.from(atob(offer.certHash), (char) => char.charCodeAt(0))
      const nextTransport = new WebTransport(offer.url, {
        serverCertificateHashes: [{ algorithm: 'sha-256', value: hash }],
      })
      transport = nextTransport
      await new Promise<void>((resolve, reject) => {
        let isSettled = false
        const timer = window.setTimeout(() => {
          if (isSettled) return
          isSettled = true
          nextTransport.close()
          reject(new Error('WebTransport timed out'))
        }, DIRECT_CONNECT_MS)
        nextTransport.ready.then(
          () => {
            if (isSettled) return
            isSettled = true
            window.clearTimeout(timer)
            resolve()
          },
          (error: unknown) => {
            if (isSettled) return
            isSettled = true
            window.clearTimeout(timer)
            reject(error instanceof Error ? error : new Error('WebTransport failed'))
          }
        )
      })
      if (isStopped) return

      isDirectReady = true
      const datagramWriter = nextTransport.datagrams.writable.getWriter()
      await datagramWriter.write(new TextEncoder().encode(JSON.stringify({ type: 'hello', token: offer.token })))
      if (isStopped) return

      sendInputRef.current = (event) => {
        datagramWriter.write(new TextEncoder().encode(JSON.stringify(event))).catch((error: unknown) => {
          console.error(error)
        })
      }

      const incoming = nextTransport.incomingUnidirectionalStreams.getReader()
      const stream = await incoming.read()
      if (stream.done || !stream.value || isStopped) return

      setIsReady(true)
      await readPackets(stream.value.getReader(), handlePayload)
    }

    const connectChannel = async () => {
      if (!peer) throw new Error('Game data channel is unavailable')

      const channelPeer = peer
      await new Promise<void>((resolve, reject) => {
        let isActive = true
        let hasMedia = false
        let helloTimer = 0
        let failTimer = 0
        const assembler = createGamePacketAssembler(
          (packet) => {
            if (!isActive) return
            if (!hasMedia) {
              hasMedia = true
              window.clearInterval(helloTimer)
              window.clearTimeout(failTimer)
              setIsReady(true)
            }
            const parsed = readGamePacket(packet)
            if (!parsed) return
            handlePayload(parsed.kind, parsed.payload)
          },
          () => {
            waitForKey = true
          }
        )
        const onMessage = (data: string | ArrayBuffer) => {
          if (!isActive || typeof data === 'string') return
          assembler(new Uint8Array(data))
        }
        const finish = (error?: Error) => {
          if (!isActive) return
          isActive = false
          window.clearInterval(helloTimer)
          window.clearTimeout(failTimer)
          channelPeer.off('onGameChannel', onMessage)
          if (error) reject(error)
          else resolve()
        }
        const sendHello = () => {
          channelPeer.sendGameChannel(JSON.stringify({ type: 'hello', token: offer.token }))
        }
        sendInputRef.current = (event) => {
          channelPeer.sendGameChannel(JSON.stringify(event))
        }
        channelPeer.on('onGameChannel', onMessage)
        sendHello()
        helloTimer = window.setInterval(sendHello, HELLO_RETRY_MS)
        failTimer = window.setTimeout(() => {
          finish(new Error('Game data channel timed out'))
        }, CHANNEL_CONNECT_MS)
        stopChannel = () => {
          finish()
        }
      })
    }

    const connect = async () => {
      try {
        await connectDirect()
      } catch (error) {
        if (isStopped) return
        if (isDirectReady) {
          console.error(error)
          onFailedRef.current()
          return
        }

        transport?.close()
        transport = null
        try {
          await connectChannel()
        } catch (channelError) {
          console.error(channelError)
          if (!isStopped) onFailedRef.current()
        }
      }
    }

    connect().catch((error: unknown) => {
      console.error(error)
      if (!isStopped) onFailedRef.current()
    })

    return () => {
      isStopped = true
      observer.disconnect()
      const sendInput = sendInputRef.current
      sendInputRef.current = () => undefined
      sendInput({ type: 'release' })
      stopChannel()
      closeDecoder()
      transport?.close()
      audioSources.forEach((source) => {
        try {
          source.stop()
        } catch {
          // A buffer that already finished rejects stop().
        }
      })
    }
  }, [audioContext, offer, peer])

  const handleExit = () => {
    sendInputRef.current({ type: 'release' })
    onExitRef.current()
  }

  return (
    <div
      ref={surfaceRef}
      className={classNames(styles.viewerSurface, styles.playback)}
    >
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
      {!isReady && <p className={styles.status}>Подключение…</p>}
      {isControlEnabled && (
        <RemoteControlLayer
          videoRef={canvasRef}
          isRelativePointer={isRelativePointer}
          onControlEvent={(event) => {
            sendInputRef.current(event)
          }}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
