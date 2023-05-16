import { Button } from "@mui/material"
import { IpcChannels } from "../../main/types/ipcChannels"
import React from "react"
import { createRoot } from "react-dom/client"

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
        <div
          style={{
            position: "absolute",
            padding: "1em",
            top: "0",
            left: 0,
            bottom: 0,
            right: 0,
          }}
        >
          <div>
            <button
              onClick={() => {
                accept()
              }}
            >
              All screen
            </button>
            {sources.map((source) => (
              <button key={source.id} onClick={() => accept(source)}>
                {source.name}
              </button>
            ))}
          </div>

          <Button variant="contained" onClick={cancel}>
            cancel
          </Button>
        </div>
      )
    }
    main.render(<Selector />)
  })
