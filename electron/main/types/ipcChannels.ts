import {
  ClientKeyPressEvent,
  ClientMouseEvent,
} from "../../../src/shared/types/ClientEvents"

export const enum IpcChannels {
  getMediaSource = "getMediaSource",
  keypress = "keypress",
  mousemove = "mousemove",
}

export type IpcEventMap<T = any> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: any
  keypress: ClientKeyPressEvent
  mousemove: ClientMouseEvent
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: Electron.DesktopCapturerSource[]
  keypress: void
  mousemove: void
}
