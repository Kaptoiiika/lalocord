import { app, BrowserWindow } from "electron"
import "./main/index"
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
    },
  })
  if (__IS_DEV__ === false) {
    win.setMenu(null)
  }
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
