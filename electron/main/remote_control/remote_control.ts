import { createRequire } from 'node:module'

import { app, ipcMain, screen } from 'electron'
import { isRemoteControlEvent } from 'src/shared/types/ClientEvents'

import type { MediaSourceBounds } from '../get_media_source/get_media_source'
import type { IpcToMainEventMap } from '../types/ipcChannels'
import type { ClientKeys, RemoteControlEvent, RemoteControlMouseButton } from 'src/shared/types/ClientEvents'

import { keyHtmlToNut } from './KeyHtmlToNut'
import { IpcChannels } from '../types/ipcChannels'

type Libnut = {
  setMouseDelay: (delay: number) => void
  setKeyboardDelay: (delay: number) => void
  getMousePos: () => { x: number; y: number }
  moveMouse: (x: number, y: number) => void
  mouseToggle: (state: 'down' | 'up', button: string) => void
  scrollMouse: (x: number, y: number) => void
  keyToggle: (key: string, state: 'down' | 'up') => void
}

const MAX_WHEEL_STEPS = 10

// nut-js loads jimp with the keyboard API. The packaged app calls the same native binding directly.
const nativeRequire = createRequire(import.meta.url)

const loadLibnut = (): Libnut => {
  if (process.platform === 'win32') return nativeRequire('@nut-tree-fork/libnut-win32') as Libnut
  if (process.platform === 'linux') return nativeRequire('@nut-tree-fork/libnut-linux') as Libnut

  return nativeRequire('@nut-tree-fork/libnut-darwin') as Libnut
}

const libnut = loadLibnut()
libnut.setMouseDelay(0)
libnut.setKeyboardDelay(0)

const buttonByName: Record<RemoteControlMouseButton, string> = {
  left: 'left',
  middle: 'middle',
  right: 'right',
}

let screenBounds: MediaSourceBounds | null = null
let gameInputBounds: MediaSourceBounds | null = null

const activeBounds = () => gameInputBounds ?? screenBounds
let wheelX = 0
let wheelY = 0
const pressedKeys = new Set<string>()
const pressedButtons = new Set<string>()

const limitSteps = (steps: number) => {
  if (steps > MAX_WHEEL_STEPS) return MAX_WHEEL_STEPS
  if (steps < -MAX_WHEEL_STEPS) return -MAX_WHEEL_STEPS

  return steps
}

// Electron display bounds are DIP. libnut addresses physical pixels.
const toScreenPoint = (x: number, y: number) => {
  const bounds = activeBounds()
  if (!bounds) return null
  if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || x > 1 || y < 0 || y > 1) return null

  const dipPoint = {
    x: Math.round(bounds.x + x * bounds.width),
    y: Math.round(bounds.y + y * bounds.height),
  }
  let physicalPoint = dipPoint

  try {
    physicalPoint = screen.dipToScreenPoint(dipPoint)
  } catch (error) {
    console.error(error)
  }

  return {
    x: Math.round(physicalPoint.x),
    y: Math.round(physicalPoint.y),
  }
}

const movePointer = (x: number, y: number) => {
  const point = toScreenPoint(x, y)
  if (!point) return

  libnut.moveMouse(point.x, point.y)
}

const virtualDesktop = () => {
  const displays = screen.getAllDisplays()
  let minX = 0
  let minY = 0
  let maxX = 0
  let maxY = 0
  let hasDisplay = false

  displays.forEach((display) => {
    const rect = screen.dipToScreenRect(null, display.bounds)
    const right = rect.x + rect.width
    const bottom = rect.y + rect.height
    if (!hasDisplay) {
      minX = rect.x
      minY = rect.y
      maxX = right
      maxY = bottom
      hasDisplay = true
      return
    }

    minX = Math.min(minX, rect.x)
    minY = Math.min(minY, rect.y)
    maxX = Math.max(maxX, right)
    maxY = Math.max(maxY, bottom)
  })

  if (!hasDisplay) return null

  return { minX, minY, maxX, maxY }
}

// Game mode sends a pixel delta. The cursor may cross every monitor, not only the captured one.
const movePointerBy = (dx: number, dy: number) => {
  if (!gameInputBounds) return
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return

  const desktop = virtualDesktop()
  if (!desktop) return

  const current = libnut.getMousePos()
  const nextX = Math.min(desktop.maxX - 1, Math.max(desktop.minX, Math.round(current.x + dx)))
  const nextY = Math.min(desktop.maxY - 1, Math.max(desktop.minY, Math.round(current.y + dy)))
  libnut.moveMouse(nextX, nextY)
}

const scrollBy = (stepsX: number, stepsY: number) => {
  if (!activeBounds() || (stepsX === 0 && stepsY === 0)) return

  libnut.scrollMouse(stepsX, -stepsY)
}

const flushWheel = () => {
  const stepsX = limitSteps(Math.trunc(wheelX))
  const stepsY = limitSteps(Math.trunc(wheelY))
  wheelX -= stepsX
  wheelY -= stepsY
  scrollBy(stepsX, stepsY)
  if (Math.abs(wheelX) >= 1 || Math.abs(wheelY) >= 1) flushWheel()
}

const pressButton = (name: RemoteControlMouseButton) => {
  const button = buttonByName[name]
  if (pressedButtons.has(button)) return
  pressedButtons.add(button)
  libnut.mouseToggle('down', button)
}

const releaseButton = (name: RemoteControlMouseButton) => {
  const button = buttonByName[name]
  if (!pressedButtons.has(button)) return
  pressedButtons.delete(button)
  libnut.mouseToggle('up', button)
}

const pressKey = (code: ClientKeys) => {
  if (!activeBounds()) return
  const key = keyHtmlToNut(code)
  if (!key || pressedKeys.has(key)) return
  pressedKeys.add(key)
  libnut.keyToggle(key, 'down')
}

const releaseKey = (code: ClientKeys) => {
  const key = keyHtmlToNut(code)
  if (!key || !pressedKeys.has(key)) return
  pressedKeys.delete(key)
  libnut.keyToggle(key, 'up')
}

const releasePressedInputs = () => {
  wheelX = 0
  wheelY = 0
  const keys = Array.from(pressedKeys)
  const buttons = Array.from(pressedButtons)
  pressedKeys.clear()
  pressedButtons.clear()

  keys.forEach((key) => {
    try {
      libnut.keyToggle(key, 'up')
    } catch (error) {
      console.error(error)
    }
  })

  buttons.forEach((button) => {
    try {
      libnut.mouseToggle('up', button)
    } catch (error) {
      console.error(error)
    }
  })
}

const runInput = (action: () => void) => {
  try {
    action()
  } catch (error) {
    console.error(error)
  }
}

const handleInput = (event: RemoteControlEvent) => {
  if (!isRemoteControlEvent(event)) return
  if (!activeBounds() && event.type !== 'release') return

  switch (event.type) {
    case 'mousemove':
      runInput(() => {
        movePointer(event.x, event.y)
      })
      break
    case 'mousedown':
      runInput(() => {
        movePointer(event.x, event.y)
        pressButton(event.button)
      })
      break
    case 'mouseup':
      runInput(() => {
        if (activeBounds()) movePointer(event.x, event.y)
        releaseButton(event.button)
      })
      break
    case 'mousedelta':
      if (!gameInputBounds) return
      runInput(() => {
        movePointerBy(event.dx, event.dy)
      })
      break
    case 'mousebutton':
      if (!gameInputBounds) return
      runInput(() => {
        if (event.pressed) pressButton(event.button)
        else releaseButton(event.button)
      })
      break
    case 'wheel':
      wheelX += event.dx
      wheelY += event.dy
      runInput(flushWheel)
      break
    case 'keydown':
      runInput(() => {
        pressKey(event.code)
      })
      break
    case 'keyup':
      runInput(() => {
        releaseKey(event.code)
      })
      break
    case 'release':
      runInput(releasePressedInputs)
      break
  }
}

const stopControl = () => {
  screenBounds = null
  if (gameInputBounds) return

  releasePressedInputs()
}

export const setGameInputBounds = (bounds: MediaSourceBounds | null) => {
  gameInputBounds = bounds
  if (!bounds) releasePressedInputs()
}

export const injectRemoteControlEvent = (event: RemoteControlEvent) => {
  handleInput(event)
}

ipcMain.on(
  IpcChannels.remoteControlStart,
  (_event, value: IpcToMainEventMap[IpcChannels.remoteControlStart]) => {
    if (value.bounds.width <= 0 || value.bounds.height <= 0) return
    screenBounds = value.bounds
  }
)

ipcMain.on(IpcChannels.remoteControlStop, () => {
  stopControl()
})

ipcMain.on(
  IpcChannels.remoteControlInput,
  (_event, value: IpcToMainEventMap[IpcChannels.remoteControlInput]) => {
    handleInput(value)
  }
)

app.on('before-quit', () => {
  screenBounds = null
  gameInputBounds = null
  releasePressedInputs()
})
