import { desktopCapturer, ipcMain } from 'electron'

import { IpcChannels } from '../types/ipcChannels'

export interface MediaSource {
  id: string
  name: string
  thumbnailDataUrl: string
  display_id: string
  appIcon: string | null
}

ipcMain.on(IpcChannels.getMediaSource, async (event, arg: Electron.SourcesOptions) => {
  const sources = await desktopCapturer.getSources({
    ...arg,
    types: ['window', 'screen'],
    thumbnailSize: { width: 320, height: 180 },
  })

  const serializedSources: MediaSource[] = sources.map((source) => ({
    id: source.id,
    name: source.name,
    thumbnailDataUrl: source.thumbnail.toDataURL(),
    display_id: source.display_id,
    appIcon: source.appIcon?.toDataURL() ?? null,
  }))

  event.reply(IpcChannels.getMediaSource, serializedSources)
})
