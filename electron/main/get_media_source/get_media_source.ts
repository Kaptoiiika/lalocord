import { desktopCapturer, ipcMain } from 'electron'

import { IpcChannels } from '../types/ipcChannels'

ipcMain.on(IpcChannels.getMediaSource, async (event, arg: Electron.SourcesOptions) => {
  const sources = await desktopCapturer.getSources({
    ...arg,
    types: ['window', 'screen'],
    fetchWindowIcons: true,
  })

  event.reply(IpcChannels.getMediaSource, sources)
})
