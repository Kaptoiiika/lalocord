import { app, BrowserWindow, shell } from "electron"
import "./main/index"
declare const MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY: string
declare const MAIN_WINDOW_WEBPACK_ENTRY: string
import contextMenu from "electron-context-menu"
import updateElectronApp from "update-electron-app"

// if (require("electron-squirrel-startup")) {
//   app.quit()
// }

updateElectronApp()

contextMenu({
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showSelectAll: false,
})

const createWindow = () => {
  const win = new BrowserWindow({
    backgroundColor: "#1c2128",
    minWidth: 380,
    minHeight: 600,
    webPreferences: {
      preload: MAIN_WINDOW_PRELOAD_WEBPACK_ENTRY,
      spellcheck: true,
    },
  })
  if (__IS_DEV__ === false) {
    // win.setMenu(null)
  }
  win.loadURL(MAIN_WINDOW_WEBPACK_ENTRY)
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith("blob:")) return { action: "allow" }
    shell.openExternal(url)

    return { action: "deny" }
  })
}

app.whenReady().then(() => {
  createWindow()
})
