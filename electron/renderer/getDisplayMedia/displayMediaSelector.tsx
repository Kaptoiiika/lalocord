import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import { localstorageKeys } from 'src/shared/const/localstorageKeys'
import { Button, CheckboxField } from 'src/shared/ui'

import type { MediaSource } from '../../main/get_media_source/get_media_source'

let lastSelectedSource: MediaSource | null = null

export const getLastSelectedSource = () => lastSelectedSource

const getMediaSource = async () => {
  const data = await new Promise<MediaSource[]>((res, rej) => {
    if (!window.electron) return rej()
    window.electron?.ipcRenderer.once('getMediaSource', (source) => {
      res(source)
    })
    window.electron?.ipcRenderer.sendMessage('getMediaSource', undefined)
  })

  return data
}

const getDesktopAudio = () => {
  const item = Boolean(localStorage.getItem(localstorageKeys.DESKTOPAUDIO))
  return item
}

const setDesktopAudio = (value: boolean) => {
  if (value) localStorage.setItem(localstorageKeys.DESKTOPAUDIO, JSON.stringify(value))
  else localStorage.removeItem(localstorageKeys.DESKTOPAUDIO)
}

export const displayMediaSelector = (): Promise<{
  source?: MediaSource
  allowAudio?: boolean
}> =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (res, rej) => {
    const sources = await getMediaSource()
    const modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)
    const main = createRoot(modalContainer)

    const accept = (source?: MediaSource, allowAudio?: boolean) => {
      lastSelectedSource = source ?? null
      res({ source, allowAudio })
      main.unmount()
    }
    const cancel = () => {
      rej('Permission denied')
      main.unmount()
    }

    const Selector = () => {
      const [allowAudio, setAllowAudio] = useState(getDesktopAudio())
      const handleChangeAudio = (checked: boolean) => {
        setAllowAudio(checked)
        setDesktopAudio(checked)
      }

      return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/60 p-8 backdrop-blur-md">
          <div className="flex w-[75vw] max-w-[1400px] flex-col items-center justify-center gap-6 rounded-2xl bg-[rgb(var(--bg-primary-color))] p-6 shadow-2xl">
            <h2 className="m-0 text-xl font-semibold text-[rgb(var(--primary-color))]">Choose screen for translation</h2>

            <div className="grid max-h-[400px] w-full grid-cols-[repeat(auto-fill,minmax(180px,1fr))] gap-4 overflow-y-auto p-1">
              {sources.map((source) => (
                <div
                  className="group flex cursor-pointer flex-col overflow-hidden rounded-xl border-2 border-transparent bg-white/[0.03] transition hover:-translate-y-0.5 hover:border-[rgba(var(--primary-color),0.5)] hover:bg-white/[0.08] hover:shadow-xl active:translate-y-0"
                  key={source.id}
                  onClick={() => accept(source, allowAudio)}
                >
                  <div className="relative aspect-video w-full overflow-hidden bg-black/30">
                    <img
                      className="h-full w-full object-cover"
                      src={source.thumbnailDataUrl}
                      alt={source.name}
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[rgba(var(--primary-color),0.15)] to-transparent opacity-0 transition group-hover:opacity-100" />
                  </div>
                  <div
                    className="truncate bg-black/20 px-3 py-3 text-center text-xs font-medium text-white/90"
                    title={source.name}
                  >
                    {source.name}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex w-full items-center justify-between border-t border-white/10 pt-2">
              <CheckboxField
                className="text-[rgb(var(--primary-color))]"
                checked={allowAudio}
                label="Capture audio"
                onCheckedChange={handleChangeAudio}
              />
              <Button
                variant="outline"
                onClick={cancel}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )
    }
    main.render(<Selector />)
  })
