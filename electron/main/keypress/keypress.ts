import { ipcMain } from "electron"
import { keyTap } from "robotjs"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"

ipcMain.on(
  IpcChannels.keypress,
  (
    e: Electron.IpcMainEvent,
    value: IpcToMainEventMap[IpcChannels.keypress]
  ) => {
    keyTap(value)
    console.log('taped')
  }
)
