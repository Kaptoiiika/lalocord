import { useEffect, useRef, useState } from 'react'

import { IpcChannels } from 'electron/main/types/ipcChannels'
import { RemoteControlLayer } from 'src/features/RemoteControl/ui/RemoteControlLayer/RemoteControlLayer'
import { GAME_VIEW_CHANNEL, isGameSessionOffer } from 'src/shared/types/GameSession'

import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'
import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { annexBToAvcc, buildAvcDecoderConfig, splitAnnexB } from '../../lib/h264Sample'

import styles from './GameView.module.scss'

type DecoderConfig = {
  codec: string
  description: Uint8Array
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

const requestGameFullscreen = () => {
  if (document.fullscreenElement) return

  document.documentElement.requestFullscreen().catch(() => undefined)
}

export const GameView = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sendInputRef = useRef<(event: RemoteControlEvent) => void>(() => undefined)
  const [offer, setOffer] = useState<GameSessionOffer | null>(null)
  const [status, setStatus] = useState('Connecting')
  const [isReady, setIsReady] = useState(false)

  useEffect(() => {
    requestGameFullscreen()

    const handlePointerDown = () => {
      requestGameFullscreen()
    }
    window.addEventListener('pointerdown', handlePointerDown, { once: true })

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [])

  useEffect(() => {
    if (window.electron) {
      return window.electron.ipcRenderer.on(IpcChannels.gameViewOffer, (nextOffer) => {
        if (!isGameSessionOffer(nextOffer)) return
        setOffer(nextOffer)
      })
    }

    const channel = new BroadcastChannel(GAME_VIEW_CHANNEL)
    channel.postMessage({ type: 'ready' })
    channel.onmessage = (event: MessageEvent<{ type?: string; offer?: unknown }>) => {
      if (event.data?.type === 'offer' && isGameSessionOffer(event.data.offer)) {
        setOffer(event.data.offer)
        channel.postMessage({ type: 'ack' })
      }
      if (event.data?.type === 'close') window.close()
    }

    return () => {
      channel.close()
    }
  }, [])

  useEffect(() => {
    if (!offer) return

    const canvas = canvasRef.current
    const context = canvas?.getContext('2d')
    if (!canvas || !context) return

    let isStopped = false
    let transport: WebTransport | null = null
    let timestamp = 0
    const decoder = new VideoDecoder({
      output: (frame) => {
        canvas.width = frame.displayWidth
        canvas.height = frame.displayHeight
        context.drawImage(frame, 0, 0)
        frame.close()
      },
      error: (error) => {
        console.error(error)
        setStatus('Decoder failed')
      },
    })
    let decoderConfig: DecoderConfig | null = null

    const configureDecoder = (config: DecoderConfig) => {
      decoder.configure({
        codec: config.codec,
        description: config.description,
        optimizeForLatency: true,
        hardwareAcceleration: 'prefer-hardware',
      })
      decoderConfig = config
    }

    const decodeFrame = (payload: Uint8Array) => {
      const isKey = payload[0] === 1
      const nals = splitAnnexB(payload.subarray(1))
      const nextConfig = buildAvcDecoderConfig(nals)
      if (nextConfig && (!decoderConfig || decoderConfig.codec !== nextConfig.codec)) configureDecoder(nextConfig)
      if (!decoderConfig || decoder.state !== 'configured') return

      timestamp += 16667
      decoder.decode(
        new EncodedVideoChunk({
          type: isKey ? 'key' : 'delta',
          timestamp,
          data: annexBToAvcc(nals),
        })
      )
    }

    const connect = async () => {
      const hash = Uint8Array.from(atob(offer.certHash), (char) => char.charCodeAt(0))
      transport = new WebTransport(offer.url, {
        serverCertificateHashes: [{ algorithm: 'sha-256', value: hash }],
      })
      await transport.ready
      if (isStopped) return

      const datagramWriter = transport.datagrams.writable.getWriter()
      await datagramWriter.write(new TextEncoder().encode(JSON.stringify({ type: 'hello', token: offer.token })))
      sendInputRef.current = (event) => {
        datagramWriter.write(new TextEncoder().encode(JSON.stringify(event))).catch(() => undefined)
      }

      const incoming = transport.incomingUnidirectionalStreams.getReader()
      const stream = await incoming.read()
      if (stream.done || !stream.value || isStopped) return

      setStatus('')
      setIsReady(true)
      await readPackets(stream.value.getReader(), (kind, payload) => {
        if (kind === 2) decodeFrame(payload)
      })
    }

    connect().catch((error: unknown) => {
      console.error(error)
      if (!isStopped) setStatus('Connection failed')
    })

    return () => {
      isStopped = true
      setIsReady(false)
      sendInputRef.current = () => undefined
      if (decoder.state !== 'closed') decoder.close()
      transport?.close()
    }
  }, [offer])

  const handleExit = () => {
    sendInputRef.current({ type: 'release' })
  }

  return (
    <div className={styles.view}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
      {status && <p className={styles.status}>{status}</p>}
      {isReady && (
        <RemoteControlLayer
          videoRef={canvasRef}
          onControlEvent={(event) => {
            sendInputRef.current(event)
          }}
          onExit={handleExit}
        />
      )}
    </div>
  )
}
