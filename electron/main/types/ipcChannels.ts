import {
  ClientKeyPressEvent,
  ClientMouseEvent,
} from "../../../src/shared/types/ClientEvents"

export const enum IpcChannels {
  getMediaSource = "getMediaSource",
  desktopstream = "desktopstream",
  keypress = "keypress",
  keyRelease = "keyRelease",
  mousemove = "mousemove",
}

export type IpcEventMap<T = any> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: any
  desktopstream: any
  keyRelease: any
  keypress: ClientKeyPressEvent
  mousemove: ClientMouseEvent
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: Electron.DesktopCapturerSource[]
  desktopstream: any
  keyRelease: any
  keypress: void
  mousemove: void
}
