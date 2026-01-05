import path from 'path'

import { ipcMain } from 'electron'
import { BrowserWindow } from 'electron'

import { IpcChannels } from '../types/ipcChannels'

export type OverlayOpenArgs = {
  width: number
  height: number
  x: number
  y: number
  parentWindow?: BrowserWindow
}

let overlayWindow: BrowserWindow | null = null

ipcMain.on(IpcChannels.openOverlay, () => {
  if (overlayWindow) {
    return
  }

  overlayWindow = new BrowserWindow({
    transparent: true,
    frame: false,
    focusable: false,
    alwaysOnTop: true,
    hasShadow: false,
    fullscreen: true,

    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  overlayWindow.setIgnoreMouseEvents(true, { forward: true })

  if (__IS_DEV__) {
    overlayWindow.loadURL('http://localhost:3000/electron/renderer/overlay/overlay.html')
    overlayWindow.webContents.openDevTools()
  } else {
    overlayWindow.loadFile(path.join(__dirname, '../../../dist/electron/renderer/overlay/overlay.html'))
    overlayWindow.setMenu(null)
  }
})

ipcMain.on(IpcChannels.closeOverlay, () => {
  overlayWindow?.close()
  overlayWindow = null
})

