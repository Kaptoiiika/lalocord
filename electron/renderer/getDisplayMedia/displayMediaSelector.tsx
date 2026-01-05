import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Button, Checkbox, FormControlLabel } from '@mui/material'
import { localstorageKeys } from 'src/shared/const/localstorageKeys'

import type { MediaSource } from '../../main/get_media_source/get_media_source'

import styles from './displayMediaSelector.module.scss'

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
      res({ source, allowAudio })
      main.unmount()
    }
    const cancel = () => {
      rej('Permission denied')
      main.unmount()
    }

    const Selector = () => {
      const [allowAudio, setAllowAudio] = useState(getDesktopAudio())
      const handleChangeAudio = (e: React.ChangeEvent<HTMLInputElement>) => {
        setAllowAudio(e.target.checked)
        setDesktopAudio(e.target.checked)
      }

      return (
        <div className={styles.wrapper}>
          <div className={styles.container}>
            <h2 className={styles.title}>Choose screen for translation</h2>

            <div className={styles.sourceList}>
              {sources.map((source) => (
                <div
                  className={styles.sourceCard}
                  key={source.id}
                  onClick={() => accept(source, allowAudio)}
                >
                  <div className={styles.sourceCardImgWrapper}>
                    <img
                      className={styles.sourceCardImg}
                      src={source.thumbnailDataUrl}
                      alt={source.name}
                    />
                  </div>
                  <div
                    className={styles.sourceCardName}
                    title={source.name}
                  >
                    {source.name}
                  </div>
                </div>
              ))}
            </div>

            <div className={styles.footer}>
              <FormControlLabel
                className={styles.allowAudioCheckbox}
                checked={allowAudio}
                label="Capture audio"
                control={<Checkbox onChange={handleChangeAudio} />}
              />
              <Button
                variant="outlined"
                className={styles.cancelButton}
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
