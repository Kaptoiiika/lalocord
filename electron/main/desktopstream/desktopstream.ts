import { ipcMain } from "electron"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"
// import ffmpeg from "fluent-ffmpeg"

ipcMain.on(
  IpcChannels.desktopstream,
  async (event, arg: IpcToMainEventMap[IpcChannels.desktopstream]) => {
    //ffmpeg -f gdigrab -framerate 60 -i desktop -c:v h264_nvenc -qp 0 output.mkv
  }
)
