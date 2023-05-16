import { ipcMain } from "electron"
import { keyToggle } from "robotjs"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"

ipcMain.on(
  IpcChannels.keypress,
  (
    e: Electron.IpcMainEvent,
    value: IpcToMainEventMap[IpcChannels.keypress]
  ) => {
    keyToggle(value.key, value.state)
  }
)
