import type { BrowserWindow } from 'electron'

let roomWindow: BrowserWindow | null = null

export const setRoomWindow = (window: BrowserWindow) => {
  roomWindow = window
  window.on('closed', () => {
    if (roomWindow === window) roomWindow = null
  })
}

export const getRoomWindow = () => roomWindow
