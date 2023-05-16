export const enum IpcChannels {
  getMediaSource = "getMediaSource",
  keypress = "keypress",
}

export type IpcEventMap<T = any> = Record<IpcChannels, T>

//main on(key, (value)=>{})
export interface IpcToMainEventMap {
  [IpcChannels.getMediaSource]: any 
  [IpcChannels.keypress]: string
}

//renderer invoke(key, (value)=>{})
export interface IpcToRendererEventMap {
  [IpcChannels.getMediaSource]: Electron.DesktopCapturerSource[]
  [IpcChannels.keypress]: any
}
