import { contextBridge, ipcRenderer, IpcRendererEvent } from "electron"
import {
  IpcChannels,
  IpcToMainEventMap,
  IpcToRendererEventMap,
} from "./main/types/ipcChannels"
import "./preload/index.ts"

const electronHandler = {
  ipcRenderer: {
    sendMessage<K extends keyof typeof IpcChannels>(
      channel: K,
      args: IpcToMainEventMap[K]
    ) {
      ipcRenderer.send(channel, args)
    },
    invoke<K extends keyof typeof IpcChannels>(
      channel: K,
      args: IpcToMainEventMap[K]
    ): Promise<IpcToRendererEventMap[K]> {
      const data = ipcRenderer.invoke(channel, args)
      return data
    },
    on<K extends keyof typeof IpcChannels>(
      channel: K,
      func: (args: IpcToRendererEventMap[K]) => void
    ) {
      const subscription = (
        _event: IpcRendererEvent,
        args: IpcToRendererEventMap[K]
      ) => func(args)
      ipcRenderer.on(channel, subscription)

      return () => {
        ipcRenderer.removeListener(channel, subscription)
      }
    },
    once<K extends keyof typeof IpcChannels>(
      channel: K,
      func: (args: IpcToRendererEventMap[K]) => void
    ) {
      ipcRenderer.once(channel, (_event, args) => func(args))
    },
  },
}

contextBridge.exposeInMainWorld("electron", electronHandler)

export type ElectronHandler = typeof electronHandler
