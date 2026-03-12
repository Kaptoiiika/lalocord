import { desktopCapturer, ipcMain, screen } from 'electron'

import { IpcChannels } from '../types/ipcChannels'

export interface MediaSourceBounds {
  x: number
  y: number
  width: number
  height: number
}

export interface MediaSource {
  id: string
  name: string
  thumbnailDataUrl: string
  display_id: string
  appIcon: string | null
  bounds?: MediaSourceBounds
  isScreen: boolean
}

ipcMain.on(IpcChannels.getMediaSource, async (event, arg: Electron.SourcesOptions) => {
  const sources = await desktopCapturer.getSources({
    ...arg,
    types: ['window', 'screen'],
    thumbnailSize: { width: 320, height: 180 },
  })

  const displays = screen.getAllDisplays()

  const serializedSources: MediaSource[] = sources.map((source) => {
    const isScreen = source.id.startsWith('screen:')
    let bounds: MediaSourceBounds | undefined

    if (isScreen && source.display_id) {
      const display = displays.find((d) => d.id.toString() === source.display_id)
      if (display) {
        bounds = display.bounds
      }
    }

    return {
      id: source.id,
      name: source.name,
      thumbnailDataUrl: source.thumbnail.toDataURL(),
      display_id: source.display_id,
      appIcon: source.appIcon?.toDataURL() ?? null,
      bounds,
      isScreen,
    }
  })

  event.reply(IpcChannels.getMediaSource, serializedSources)
})
