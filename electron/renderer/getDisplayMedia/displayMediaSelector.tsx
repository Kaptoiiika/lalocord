import { useState } from 'react'
import { createRoot } from 'react-dom/client'

import { Button, Checkbox, FormControlLabel, Stack } from '@mui/material'

import { localstorageKeys } from '../../../src/shared/const/localstorageKeys'

import styles from './displayMediaSelector.module.scss'

const getMediaSource = async () => {
  const data = await new Promise<Electron.DesktopCapturerSource[]>((res) => {
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
  source?: Electron.DesktopCapturerSource
  allowAudio?: boolean
}> =>
  // eslint-disable-next-line no-async-promise-executor
  new Promise(async (res, rej) => {
    const sources = await getMediaSource()
    const modalContainer = document.createElement('div')
    document.body.appendChild(modalContainer)
    const main = createRoot(modalContainer)

    const accept = (node?: Electron.DesktopCapturerSource, allowAudio?: boolean) => {
      res({ source: node, allowAudio })
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
            <div className={styles.sourceList}>
              <button
                onClick={() => {
                  accept()
                }}
              >
                All screen
              </button>
              {sources.map((source) => (
                <button
                  className={styles.sourceButton}
                  key={source.id}
                  onClick={() => accept(source, allowAudio)}
                >
                  {/* <img  className={styles.sourceButtonImg}  /> */}
                  {source.name}
                </button>
              ))}
            </div>

            <Stack
              direction="row"
              gap={4}
            >
              <FormControlLabel
                className={styles.allowAudioCheckbox}
                checked={allowAudio}
                label="Allow audio"
                control={<Checkbox onChange={handleChangeAudio} />}
              />
              <Button
                variant="contained"
                onClick={cancel}
              >
                cancel
              </Button>
            </Stack>
          </div>
        </div>
      )
    }
    main.render(<Selector />)
  })

