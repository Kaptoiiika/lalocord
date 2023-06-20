import { Button } from "@mui/material"
import { IpcChannels } from "../../main/types/ipcChannels"
import { createRoot } from "react-dom/client"
import styles from './displayMediaSelector.module.scss'

type SourceType = Awaited<
  ReturnType<typeof window.electron.ipcRenderer.invoke<IpcChannels.getMediaSource>>
>[0]

const getMediaSource = async ():Promise<SourceType[]>=>{
  const data = await new Promise<SourceType[]>((res, rej)=>{
    window.electron.ipcRenderer.once('getMediaSource', (source)=>{
      res(source)
    })
    window.electron.ipcRenderer.sendMessage('getMediaSource', undefined)
  })
  
  return data
}

export const displayMediaSelector = (): Promise<SourceType | undefined> =>
  new Promise(async (res, rej) => {
    const sources = await getMediaSource()
    const modalContainer = document.createElement("div")
    document.body.appendChild(modalContainer)
    const main = createRoot(modalContainer)

    const accept = (node?: SourceType) => {
      res(node)
      main.unmount()
    }
    const cancel = () => {
      rej("Permission denied")
      main.unmount()
    }
    const Selector = () => {
      return (
        <div className={styles.wrapper}>
          <div
            className={styles.container}
          >
            <div className={styles.sourceList}>
              <button
                onClick={() => {
                accept()
              }}
              >
                All screen
              </button>
              {sources.map((source) => (
                <button className={styles.sourceButton} key={source.id} onClick={() => accept(source)}>
                  {/* <img  className={styles.sourceButtonImg}  /> */}
                  {source.name}
                </button>
            ))}
            </div>

            <Button variant="contained" onClick={cancel}>
              cancel
            </Button>
          </div>
        </div>
      )
    }
    main.render(<Selector />)
  })
