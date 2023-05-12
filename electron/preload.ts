import {
  contextBridge,
  DesktopCapturerSource,
  ipcRenderer,
  IpcRendererEvent,
} from "electron"

export type Channels = "get_media_source" | "SET_SOURCE" | "ipc-example"

const getSourcesDisplayMedia = async () => {
  const sources = await new Promise((res, rej) => {
    electronHandler.ipcRenderer.once("get_media_source", (sources) => {
      res(sources)
    })
    electronHandler.ipcRenderer.sendMessage("get_media_source", [])
  })

  return sources as DesktopCapturerSource[]
}

const electronHandler = {
  ipcRenderer: {
    sendMessage(channel: Channels, args: unknown[]) {
      ipcRenderer.send(channel, args)
    },
    on(channel: Channels, func: (...args: unknown[]) => void) {
      const subscription = (_event: IpcRendererEvent, ...args: unknown[]) =>
        func(...args)
      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    once(channel: Channels, func: (...args: unknown[]) => void) {
      ipcRenderer.once(channel, (_event, ...args) => func(...args))
    },
  },
  getSourcesDisplayMedia,
}

contextBridge.exposeInMainWorld("electron", electronHandler)

export type ElectronHandler = typeof electronHandler
