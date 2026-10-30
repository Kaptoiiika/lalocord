import { randomBytes } from 'node:crypto'
import { networkInterfaces } from 'node:os'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

import { app, BrowserWindow, ipcMain, net, protocol, screen } from 'electron'

import type { MediaSourceBounds } from '../get_media_source/get_media_source'
import type { GameSessionOffer, GameSessionStats } from 'src/shared/types/GameSession'

import { createGameCertificate } from './certificate'
import { fitCaptureSize, startDesktopCapture } from './ffmpeg_capture'
import { startWebTransportHost } from './webtransport_host'
import { injectRemoteControlEvent, setGameInputBounds } from '../remote_control/remote_control'
import { IpcChannels } from '../types/ipcChannels'
import { getRoomWindow } from '../windows'

declare const __IS_DEV__: boolean

type RunningSession = {
  offer: GameSessionOffer
  stop: () => void
}

let runningSession: RunningSession | null = null
let panelWindow: BrowserWindow | null = null
let frameCount = 0
let statsTimer: NodeJS.Timeout | null = null
let isClosingPanel = false
let sessionGeneration = 0

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

const captureTarget = (bounds?: MediaSourceBounds) => {
  const displays = screen.getAllDisplays()
  const matchedIndex = bounds
    ? displays.findIndex((display) => {
        const item = display.bounds
        return item.x === bounds.x && item.y === bounds.y && item.width === bounds.width && item.height === bounds.height
      })
    : -1
  const index = matchedIndex >= 0 ? matchedIndex : 0
  const display = displays[index] ?? displays[0]
  if (!display) throw new Error('No display found')

  const physicalWidth = Math.round(display.bounds.width * display.scaleFactor)
  const physicalHeight = Math.round(display.bounds.height * display.scaleFactor)
  const size = fitCaptureSize(physicalWidth, physicalHeight)
  const even = (value: number) => Math.max(2, Math.floor(value / 2) * 2)

  return {
    outputIndex: index,
    bounds: display.bounds,
    width: size.width,
    height: size.height,
    physicalWidth: even(physicalWidth),
    physicalHeight: even(physicalHeight),
  }
}

const windowUrl = (hashPath: string) => {
  if (!__IS_DEV__) return `app://local/index.html#${hashPath}`

  const roomUrl = getRoomWindow()?.webContents.getURL()
  const origin = roomUrl ? new URL(roomUrl).origin : 'http://localhost:3000'

  return `${origin}/#${hashPath}`
}

const openPanel = () => {
  if (panelWindow && !panelWindow.isDestroyed()) {
    panelWindow.focus()
    return
  }

  panelWindow = new BrowserWindow({
    width: 420,
    height: 280,
    autoHideMenuBar: true,
    backgroundColor: '#1c2128',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  })
  const openedPanel = panelWindow
  void openedPanel.loadURL(windowUrl('/game-session'))
  openedPanel.on('closed', () => {
    if (panelWindow === openedPanel) panelWindow = null
    if (isClosingPanel) {
      isClosingPanel = false
      return
    }
    stopGameSession(true)
  })
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
  const hadSession = runningSession !== null
  if (statsTimer) clearInterval(statsTimer)
  statsTimer = null
  runningSession?.stop()
  runningSession = null
  setGameInputBounds(null)
  if (notify && hadSession) sendToWindows(IpcChannels.gameSessionEnded, undefined)

  const panel = panelWindow
  if (!panel || panel.isDestroyed()) return
  isClosingPanel = true
  panel.close()
}

const startGameSession = async (bounds?: MediaSourceBounds) => {
  if (process.platform !== 'win32') throw new Error('Game session is available on Windows')
  stopGameSession(true)
  const generation = sessionGeneration

  const target = captureTarget(bounds)
  const host = pickLanAddress()
  const certificate = await createGameCertificate(host)
  const token = randomBytes(32).toString('hex')
  let encoder = 'h264'
  let viewers = 0
  let codec = 'avc1.640028'
  frameCount = 0

  const hostServer = await startWebTransportHost({
    cert: certificate.cert,
    privateKey: certificate.privateKey,
    secret: certificate.secret,
    token,
    onInput: injectRemoteControlEvent,
    onViewers: (nextViewers) => {
      viewers = nextViewers
    },
    onFailure: (message) => {
      if (generation !== sessionGeneration) return
      sendToWindows(IpcChannels.gameSessionFailed, message)
      stopGameSession(true)
    },
  })

  hostServer.setConfig(codec, target.width, target.height)
  setGameInputBounds(target.bounds)

  let capture: Awaited<ReturnType<typeof startDesktopCapture>>
  try {
    capture = await startDesktopCapture({
      outputIndex: target.outputIndex,
      width: target.width,
      height: target.height,
      isNativeSize: target.width === target.physicalWidth && target.height === target.physicalHeight,
      onFrame: (frame) => {
        const nextCodec = codecFromFrame(frame.data)
        if (nextCodec && nextCodec !== codec) {
          codec = nextCodec
          hostServer.setConfig(codec, target.width, target.height)
        }
        frameCount += 1
        hostServer.publishFrame(frame.data, frame.isKey)
      },
      onExit: (error) => {
        if (!error || runningSession === null) return
        sendToWindows(IpcChannels.gameSessionFailed, error.message)
        stopGameSession(true)
      },
    })
  } catch (error) {
    hostServer.stop()
    setGameInputBounds(null)
    throw error
  }
  if (capture.exitError()) {
    hostServer.stop()
    setGameInputBounds(null)
    throw capture.exitError()
  }
  encoder = capture.encoder
  if (generation !== sessionGeneration) {
    capture.stop()
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
      capture.stop()
      hostServer.stop()
    },
  }

  statsTimer = setInterval(() => {
    publishStats({ encoder, fps: frameCount, viewers })
    frameCount = 0
  }, 1000)

  sendToWindows(IpcChannels.gameSessionReady, offer)
  openPanel()
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
  void startGameSession(value.bounds).catch((error: unknown) => {
    const message = error instanceof Error ? error.message : 'Game session failed'
    sendToWindows(IpcChannels.gameSessionFailed, message)
    stopGameSession(true)
  })
})

ipcMain.on(IpcChannels.gameSessionStop, () => {
  stopGameSession(true)
})

app.on('before-quit', () => {
  runningSession?.stop()
  runningSession = null
  setGameInputBounds(null)
})
