import { app, BrowserWindow, desktopCapturer, ipcMain } from "electron"
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

ipcMain.on("get_media_source", async (event, arg) => {
  const sources = await desktopCapturer.getSources({
    types: ["window", "screen", "audio"],
  })

  event.reply("get_media_source", sources)
})

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  // win.setMenu(null)
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
}

app.commandLine.appendSwitch("force_high_performance_gpu")

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
