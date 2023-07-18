import { app, BrowserWindow, shell } from "electron"
import "./main/index"
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
import contextMenu from "electron-context-menu"
import updateElectronApp from "update-electron-app"

updateElectronApp({
  repo: "Kaptoiiika/RipCornd",
  notifyUser: true,
})

contextMenu({
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showSelectAll: false,
})

const createWindow = () => {
  const win = new BrowserWindow({
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      spellcheck: true,
    },
  })
  if (__IS_DEV__ === false) {
    win.setMenu(null)
  }
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url)
    return { action: "deny" }
  })
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
if (require("electron-squirrel-startup")) app.quit()
