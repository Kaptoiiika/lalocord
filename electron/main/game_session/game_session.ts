import { randomBytes } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { app, BrowserWindow, ipcMain, net, protocol, screen } from 'electron'
import { defaultStreamBitrate, defaultStreamConstraints } from 'src/entities/WebRTC/utils/streamConstraints'
import { toGameCaptureSettings } from 'src/features/GameSession/lib/captureSettings'
import { isGameCaptureSettings } from 'src/shared/types/GameSession'

import type { MediaSourceBounds } from '../get_media_source/get_media_source'
import type { GameCaptureSettings, GameSessionOffer, GameSessionStats } from 'src/shared/types/GameSession'

import { createGameCertificate } from './certificate'
import { listCaptureOutputs } from './display_output'
import { fitCaptureSize, startDesktopCapture } from './ffmpeg_capture'
import { startWebTransportHost } from './webtransport_host'
import { injectRemoteControlEvent, setGameInputBounds } from '../remote_control/remote_control'
import { IpcChannels } from '../types/ipcChannels'

type RunningSession = {
  offer: GameSessionOffer
  stop: () => void
}

type DesktopRect = {
  x: number
  y: number
  width: number
  height: number
}

let runningSession: RunningSession | null = null
let runningCapture: Awaited<ReturnType<typeof startDesktopCapture>> | null = null
let sessionHost: Awaited<ReturnType<typeof startWebTransportHost>> | null = null
let captureSettings: GameCaptureSettings = toGameCaptureSettings(defaultStreamConstraints, defaultStreamBitrate)
let sessionBounds: MediaSourceBounds | undefined
let sessionCodec = 'avc1.640028'
let sessionViewers = 0
let sessionEncoder = 'h264'
let frameCount = 0
let statsTimer: NodeJS.Timeout | null = null
let sessionGeneration = 0
let captureSerial = 0

const sendToWindows = (channel: string, payload: unknown) => {
  BrowserWindow.getAllWindows().forEach((window) => {
    if (window.isDestroyed()) return
    window.webContents.send(channel, payload)
  })
}

const pickLanAddress = () => {
  const listed = Object.values(networkInterfaces()).flatMap((items) => items ?? [])
  const addresses = listed.filter((item) => item.family === 'IPv4' && !item.internal)
  const preferred = addresses.find((item) => item.address.startsWith('192.168.') || item.address.startsWith('10.'))

  return preferred?.address ?? addresses[0]?.address ?? '127.0.0.1'
}

const sameRect = (left: DesktopRect, right: DesktopRect) =>
  left.x === right.x && left.y === right.y && left.width === right.width && left.height === right.height

const sizedTarget = (display: Electron.Display, outputIndex: number, settings: GameCaptureSettings) => {
  const physical = screen.dipToScreenRect(null, display.bounds)
  const size = fitCaptureSize(physical.width, physical.height, settings.width, settings.height)
  const even = (value: number) => Math.max(2, Math.floor(value / 2) * 2)

  return {
    outputIndex,
    bounds: display.bounds,
    width: size.width,
    height: size.height,
    physicalWidth: even(physical.width),
    physicalHeight: even(physical.height),
  }
}

const captureTarget = async (bounds: MediaSourceBounds | undefined, settings: GameCaptureSettings) => {
  const displays = screen.getAllDisplays()
  const matched = bounds
    ? displays.find((display) => sameRect(display.bounds, bounds))
    : undefined
  // Without a chosen screen, follow the Windows primary. displays[0] is the first monitor, not that display.
  const selected = matched ?? screen.getPrimaryDisplay()
  const outputs = await listCaptureOutputs()
  const selectedRect = screen.dipToScreenRect(null, selected.bounds)
  const output = outputs.find((item) => sameRect(item, selectedRect))
  const outputIndex = output ? output.index : 0
  const captured = output ?? outputs.find((item) => item.index === outputIndex)
  const capturedDisplay = captured
    ? displays.find((display) => sameRect(screen.dipToScreenRect(null, display.bounds), captured)) ?? selected
    : selected

  return sizedTarget(capturedDisplay, outputIndex, settings)
}

const publishStats = (stats: GameSessionStats) => {
  sendToWindows(IpcChannels.gameSessionStats, stats)
}

const codecFromFrame = (frame: Uint8Array) => {
  for (let index = 0; index < frame.length - 6; index += 1) {
    const isThreeByte = frame[index] === 0 && frame[index + 1] === 0 && frame[index + 2] === 1
    const isFourByte = frame[index] === 0 && frame[index + 1] === 0 && frame[index + 2] === 0 && frame[index + 3] === 1
    let headerAt = -1
    if (isFourByte) headerAt = index + 4
    if (!isFourByte && isThreeByte) headerAt = index + 3
    if (headerAt < 0 || (frame[headerAt] & 0x1f) !== 7) continue

    const hex = (value: number) => value.toString(16).padStart(2, '0')

    return `avc1.${hex(frame[headerAt + 1])}${hex(frame[headerAt + 2])}${hex(frame[headerAt + 3])}`
  }

  return null
}

const stopGameSession = (notify: boolean) => {
  sessionGeneration += 1
  captureSerial += 1
  const hadSession = runningSession !== null
  if (statsTimer) clearInterval(statsTimer)
  statsTimer = null
  runningCapture?.stop()
  runningCapture = null
  sessionHost?.stop()
  sessionHost = null
  runningSession?.stop()
  runningSession = null
  setGameInputBounds(null)
  if (notify && hadSession) sendToWindows(IpcChannels.gameSessionEnded, undefined)
}

// ddagrab frame rate and scale are fixed for the ffmpeg process.
// A settings change restarts that process and keeps the WebTransport offer, so the viewer stays in play.
const launchCapture = async (generation: number) => {
  const serial = captureSerial + 1
  captureSerial = serial
  const target = await captureTarget(sessionBounds, captureSettings)
  if (generation !== sessionGeneration || serial !== captureSerial || !sessionHost) return null

  runningCapture?.stop()
  runningCapture = null
  if (generation !== sessionGeneration || serial !== captureSerial || !sessionHost) return null

  const hostServer = sessionHost
  const capture = await startDesktopCapture({
    outputIndex: target.outputIndex,
    width: target.width,
    height: target.height,
    frameRate: captureSettings.frameRate,
    bitrate: captureSettings.bitrate,
    isNativeSize: target.width === target.physicalWidth && target.height === target.physicalHeight,
    onFrame: (frame) => {
      if (generation !== sessionGeneration || serial !== captureSerial) return

      const nextCodec = codecFromFrame(frame.data)
      if (nextCodec && nextCodec !== sessionCodec) {
        sessionCodec = nextCodec
        hostServer.setConfig(sessionCodec, target.width, target.height)
      }
      frameCount += 1
      hostServer.publishFrame(frame.data, frame.isKey)
    },
    onExit: (error) => {
      if (!error || serial !== captureSerial || generation !== sessionGeneration) return
      sendToWindows(IpcChannels.gameSessionFailed, error.message)
      stopGameSession(true)
    },
  })

  if (generation !== sessionGeneration || serial !== captureSerial) {
    capture.stop()
    return null
  }
  if (capture.exitError()) throw capture.exitError()

  runningCapture = capture
  sessionEncoder = capture.encoder
  hostServer.setConfig(sessionCodec, target.width, target.height)
  setGameInputBounds(target.bounds)

  return capture
}

const startGameSession = async (bounds?: MediaSourceBounds, capture?: GameCaptureSettings) => {
  if (process.platform !== 'win32') throw new Error('Game session is available on Windows')
  if (isGameCaptureSettings(capture)) captureSettings = capture
  sessionBounds = bounds
  stopGameSession(true)
  const generation = sessionGeneration
  const host = pickLanAddress()
  const certificate = await createGameCertificate(host)
  if (generation !== sessionGeneration) return

  const token = randomBytes(32).toString('hex')
  sessionCodec = 'avc1.640028'
  sessionViewers = 0
  sessionEncoder = 'h264'
  frameCount = 0

  const hostServer = await startWebTransportHost({
    cert: certificate.cert,
    privateKey: certificate.privateKey,
    secret: certificate.secret,
    token,
    onInput: injectRemoteControlEvent,
    onViewers: (nextViewers) => {
      sessionViewers = nextViewers
    },
    onFailure: (message) => {
      if (generation !== sessionGeneration) return
      sendToWindows(IpcChannels.gameSessionFailed, message)
      stopGameSession(true)
    },
  })
  if (generation !== sessionGeneration) {
    hostServer.stop()
    return
  }

  sessionHost = hostServer

  try {
    const captureHandle = await launchCapture(generation)
    if (!captureHandle) throw new Error('Game capture did not start')
  } catch (error) {
    hostServer.stop()
    if (sessionHost === hostServer) sessionHost = null
    setGameInputBounds(null)
    if (generation !== sessionGeneration) return
    throw error
  }

  if (generation !== sessionGeneration) {
    if (sessionHost === hostServer) sessionHost = null
    hostServer.stop()
    return
  }

  const offer: GameSessionOffer = {
    url: `https://${host}:${hostServer.port}/game`,
    token,
    certHash: certificate.certHash,
  }

  runningSession = {
    offer,
    stop: () => {
      runningCapture?.stop()
      runningCapture = null
      hostServer.stop()
      if (sessionHost === hostServer) sessionHost = null
    },
  }

  statsTimer = setInterval(() => {
    publishStats({ encoder: sessionEncoder, fps: frameCount, viewers: sessionViewers })
    frameCount = 0
  }, 1000)

  sendToWindows(IpcChannels.gameSessionReady, offer)
}

const configureGameSession = (capture: GameCaptureSettings) => {
  if (!isGameCaptureSettings(capture)) return

  const isSame =
    capture.width === captureSettings.width &&
    capture.height === captureSettings.height &&
    capture.frameRate === captureSettings.frameRate &&
    capture.bitrate === captureSettings.bitrate
  captureSettings = capture
  if (isSame || !runningSession || !sessionHost) return

  const generation = sessionGeneration
  void launchCapture(generation).catch((error: unknown) => {
    if (generation !== sessionGeneration) return
    const message = error instanceof Error ? error.message : 'Game session failed'
    sendToWindows(IpcChannels.gameSessionFailed, message)
    stopGameSession(true)
  })
}

export const registerAppProtocol = () => {
  protocol.registerSchemesAsPrivileged([
    {
      scheme: 'app',
      privileges: {
        standard: true,
        secure: true,
        supportFetchAPI: true,
        corsEnabled: true,
      },
    },
  ])
}

export const handleAppProtocol = () => {
  protocol.handle('app', (request) => {
    const requestUrl = new URL(request.url)
    let pathname = decodeURIComponent(requestUrl.pathname)
    if (pathname === '/' || !path.extname(pathname)) pathname = '/index.html'

    const distRoot = path.normalize(path.join(__dirname, '../dist'))
    const rootWithSep = distRoot.endsWith(path.sep) ? distRoot : `${distRoot}${path.sep}`
    const filePath = path.normalize(path.join(distRoot, pathname))
    if (!filePath.startsWith(rootWithSep)) return new Response('forbidden', { status: 403 })

    return net.fetch(pathToFileURL(filePath).href)
  })
}

ipcMain.on(IpcChannels.gameSessionStart, (_event, value) => {
  void startGameSession(value.bounds, value.capture).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Game session failed'
    sendToWindows(IpcChannels.gameSessionFailed, message)
    stopGameSession(true)
  })
})

ipcMain.on(IpcChannels.gameSessionConfigure, (_event, value) => {
  configureGameSession(value)
})

ipcMain.on(IpcChannels.gameSessionStop, () => {
  stopGameSession(true)
})

app.on('before-quit', () => {
  captureSerial += 1
  runningSession?.stop()
  runningSession = null
  runningCapture = null
  sessionHost = null
  setGameInputBounds(null)
})
