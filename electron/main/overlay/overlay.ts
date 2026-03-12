import path from 'path'

import { ipcMain, screen } from 'electron'
import { BrowserWindow } from 'electron'

import type { OpenOverlayParams } from '../types/ipcChannels';

import { IpcChannels } from '../types/ipcChannels'

export type OverlayOpenArgs = {
  width: number
  height: number
  x: number
  y: number
  parentWindow?: BrowserWindow
}

let overlayWindow: BrowserWindow | null = null

ipcMain.on(IpcChannels.openOverlay, (_event, params?: OpenOverlayParams) => {
  if (overlayWindow) {
    if (params?.bounds) {
      overlayWindow.setFullScreen(false)
      overlayWindow.setPosition(params.bounds.x, params.bounds.y)
      overlayWindow.setFullScreen(true)
    }
    return
  }

  const bounds = params?.bounds ?? screen.getPrimaryDisplay().bounds

  const windowOptions: Electron.BrowserWindowConstructorOptions = {
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    transparent: true,
    frame: false,
    focusable: false,
    hasShadow: false,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    minimizable: false,
    maximizable: false,
    fullscreenable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  }

  overlayWindow = new BrowserWindow(windowOptions)

  overlayWindow.setPosition(bounds.x, bounds.y)
  overlayWindow.setFullScreen(true)
  overlayWindow.setAlwaysOnTop(true, 'screen-saver', 1)
  overlayWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  if (__IS_DEV__) {
    overlayWindow.loadURL('http://localhost:3000/electron/renderer/overlay/overlay.html')
    overlayWindow.webContents.openDevTools()
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../dist/electron/renderer/overlay/overlay.html'))
    overlayWindow.setMenu(null)
  }
})

ipcMain.on(IpcChannels.closeOverlay, () => {
  overlayWindow?.close()
  overlayWindow = null
})

