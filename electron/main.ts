import path from "path"
import { app, BrowserWindow } from "electron"

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
  })

  win.loadFile(path.resolve("..", "public", "index.html"))
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
