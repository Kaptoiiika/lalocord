import { ipcMain } from "electron"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"

ipcMain.on(
  IpcChannels.mousemove,
  (
    e: Electron.IpcMainEvent,
    value: IpcToMainEventMap[IpcChannels.mousemove]
  ) => {}
)
