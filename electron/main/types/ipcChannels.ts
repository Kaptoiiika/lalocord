export const enum IpcChannels {
  getMediaSource = "getMediaSource",
  keypress = "keypress",
}

export type IpcEventMap<T = any> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  getMediaSource: any
  keypress: string
}

//renderer sendMessage(key, (value)=>{})
export interface IpcToRendererEventMap {
  getMediaSource: Electron.DesktopCapturerSource[]
  keypress: any
}
