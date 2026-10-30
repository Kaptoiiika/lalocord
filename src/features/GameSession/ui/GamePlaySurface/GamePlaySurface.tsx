import { useEffect, useRef, useState } from 'react'

import { RemoteControlLayer } from 'src/features/RemoteControl/ui/RemoteControlLayer/RemoteControlLayer'

import type { RemoteControlEvent } from 'src/shared/types/ClientEvents'
import type { GameSessionOffer } from 'src/shared/types/GameSession'

import { annexBToAvcc, buildAvcDecoderConfig, splitAnnexB } from '../../lib/h264Sample'

import styles from './GamePlaySurface.module.scss'

type GamePlaySurfaceProps = {
  offer: GameSessionOffer
  onExit: () => void
}

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

export const GamePlaySurface = (props: GamePlaySurfaceProps) => {
  const { offer, onExit } = props
  const { url, token, certHash } = offer
  const [status, setStatus] = useState('Connecting')
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const sendInputRef = useRef<(event: RemoteControlEvent) => void>(() => undefined)
  const onExitRef = useRef(onExit)

  onExitRef.current = onExit

  useEffect(() => {
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
      const hash = Uint8Array.from(atob(certHash), (char) => char.charCodeAt(0))
      transport = new WebTransport(url, {
        serverCertificateHashes: [{ algorithm: 'sha-256', value: hash }],
      })
      await transport.ready
      if (isStopped) return

      const datagramWriter = transport.datagrams.writable.getWriter()
      await datagramWriter.write(new TextEncoder().encode(JSON.stringify({ type: 'hello', token })))
      if (isStopped) return

      sendInputRef.current = (event) => {
        datagramWriter.write(new TextEncoder().encode(JSON.stringify(event))).catch(() => undefined)
      }

      const incoming = transport.incomingUnidirectionalStreams.getReader()
      const stream = await incoming.read()
      if (stream.done || !stream.value || isStopped) return

      setStatus('')
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
      const sendInput = sendInputRef.current
      sendInputRef.current = () => undefined
      sendInput({ type: 'release' })
      if (decoder.state !== 'closed') decoder.close()
      transport?.close()
    }
  }, [certHash, token, url])

  const handleExit = () => {
    sendInputRef.current({ type: 'release' })
    onExitRef.current()
  }

  return (
    <div className={styles.surface}>
      <canvas
        ref={canvasRef}
        className={styles.canvas}
      />
      {status && <p className={styles.status}>{status}</p>}
      <RemoteControlLayer
        videoRef={canvasRef}
        onControlEvent={(event) => {
          sendInputRef.current(event)
        }}
        onExit={handleExit}
      />
    </div>
  )
}
