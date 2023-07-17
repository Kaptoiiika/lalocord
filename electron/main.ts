import { app, BrowserWindow, shell } from "electron"
import "./main/index"
declare const MAIN_WINDOW_VITE_DEV_SERVER_URL: string
declare const MAIN_WINDOW_VITE_NAME: string
import contextMenu from "electron-context-menu"
import updateElectronApp from "update-electron-app"
import path from "path"

updateElectronApp({
  host: "https://github.com",
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
      preload: path.join(__dirname, `preload.js`),
      spellcheck: true,
    },
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    win.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    win.setMenu(null)
    win.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }

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
