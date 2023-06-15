import { ipcMain } from "electron"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"
import { KeyHtmltoRobotJs } from "./KeyHtmltoRobotJs"

// import { keyToggle } from "robotjs"
ipcMain.on(
  IpcChannels.keypress,
  (
    e: Electron.IpcMainEvent,
    value: IpcToMainEventMap[IpcChannels.keypress]
  ) => {
    const key = KeyHtmltoRobotJs(value)
    if (key) {
      // keyToggle(key, value.state)
    } else {
      try {
        // keyToggle(value.key.toLowerCase(), value.state)
      } catch (error) {}
    }
  }
)
