import path from 'path'

import { app, BrowserWindow, shell } from 'electron'
import './main/index'
import contextMenu from 'electron-context-menu'

declare const __IS_DEV__: boolean

contextMenu({
  showSearchWithGoogle: false,
  showSaveImageAs: true,
  showSelectAll: false,
})

const createWindow = () => {
  const win = new BrowserWindow({
    backgroundColor: '#1c2128',
    minWidth: 800,
    minHeight: 600,
    width: 1600,
    height: 800,
    autoHideMenuBar: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      spellcheck: true,
      contextIsolation: true,
      nodeIntegration: false,
    },
  })

  if (__IS_DEV__) {
    win.loadURL('http://localhost:3000')
    win.webContents.openDevTools()
  } else {
    win.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('blob:')) return { action: 'allow' as const }
    shell.openExternal(url)
    return { action: 'deny' as const }
  })

  win.on('closed', () => {
    app.quit()
  })
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

