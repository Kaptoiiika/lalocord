import { ipcMain } from 'electron'

import type { IpcToMainEventMap } from '../types/ipcChannels'

import { KeyHtmltoRobotJs } from './KeyHtmltoRobotJs'
import { IpcChannels } from '../types/ipcChannels'
// import { keyToggle } from "robotjs"

const keyDown = new Set<string>()

const sendKeyToPC = (key: string, isDown: boolean) => {
  const state = isDown ? 'down' : 'up'
  console.log(state)
  // try {
  //   keyToggle(key, state)
  // } catch (error) {}
}

ipcMain.on(IpcChannels.keypress, (e: Electron.IpcMainEvent, value: IpcToMainEventMap[IpcChannels.keypress]) => {
  const key = KeyHtmltoRobotJs(value)
  if (!key) return
  if (value.state === 'down') {
    keyDown.add(key)
  } else {
    keyDown.delete(key)
  }
  sendKeyToPC(key, value.state === 'down')
})

ipcMain.on(IpcChannels.keyRelease, () => {
  keyDown.forEach((key) => {
    sendKeyToPC(key, false)
  })
})
