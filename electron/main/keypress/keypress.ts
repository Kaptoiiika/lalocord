import { ipcMain } from "electron"
import { keyToggle } from "robotjs"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"
import { KeyHtmltoRobotJs } from "./KeyHtmltoRobotJs"

ipcMain.on(
  IpcChannels.keypress,
  (
    e: Electron.IpcMainEvent,
    value: IpcToMainEventMap[IpcChannels.keypress]
  ) => {
    console.log(value.state)
    const key = KeyHtmltoRobotJs(value)
    if (key) {
      keyToggle(key, value.state)
    }
  }
)
