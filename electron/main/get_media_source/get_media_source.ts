import { desktopCapturer, ipcMain } from "electron"
import { IpcChannels, IpcToMainEventMap } from "../types/ipcChannels"

ipcMain.on(IpcChannels.getMediaSource, async (event, arg: IpcToMainEventMap[IpcChannels.getMediaSource]) => {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen", "audio"],
  })

  event.reply(IpcChannels.getMediaSource, sources)
})
