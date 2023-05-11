import path from "path"
import { app, BrowserWindow } from "electron"

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })
  win.setMenu(null)
  win.loadFile(path.resolve(__dirname, "app", "index.html"))
}

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit()
})
