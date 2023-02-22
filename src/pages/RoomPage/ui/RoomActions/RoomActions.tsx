import { IconButton, Tooltip } from "@mui/material"
import VideocamIcon from "@mui/icons-material/Videocam"
import VideocamOffIcon from "@mui/icons-material/VideocamOff"
import RadioButtonCheckedIcon from "@mui/icons-material/RadioButtonChecked"
import styles from "./RoomActions.module.scss"
import { useState } from "react"
import { useRoomRTCStore } from "../../model/store/store/RoomRTCStore"
import {
  getActionSetWebCamStream,
  getDisplayMediaStream,
  getStreamSettings,
  getWebCamStream,
} from "../../model/store/selectors/RoomRTCSelectors"
import { ShareScreenMenu } from "./ShareScreenMenu/ShareScreenMenu"
import { downloadBlob } from "@/shared/lib/utils/downloadBlob/downloadBlob"

type RoomActionsProps = {}

export const RoomActions = (props: RoomActionsProps) => {
  const mediaStream = useRoomRTCStore(getDisplayMediaStream)
  const webCamStream = useRoomRTCStore(getWebCamStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)
  const setWebCamStream = useRoomRTCStore(getActionSetWebCamStream)

  const [error, setError] = useState({ usermedia: null })
  const [recordStarted, setSetREcordStarted] = useState<MediaRecorder>()

  const hundleWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: streamSettings.video,
      })
      setWebCamStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setWebCamStream(null)
        }
      })
    } catch (error: any) {
      setError((prev) => ({ ...prev, usermedia: error?.message }))
    }
  }

  const hundleStopWebCamStream = () => {
    webCamStream?.getTracks().forEach((track) => {
      track.stop()
      setWebCamStream(null)
    })
  }

  const hundleStartRecordStream = () => {
    if (!mediaStream) return
    const recorder = new MediaRecorder(mediaStream)
    recorder.ondataavailable = (e) => {
      downloadBlob(e.data, `${mediaStream.id}`)
    }
    recorder.onstop = (e) => {
      if (setSetREcordStarted) setSetREcordStarted(undefined)
    }

    recorder.start()
    setSetREcordStarted(recorder)
  }


  return (
    <div className={styles.RoomActions}>
      {webCamStream ? (
        <Tooltip title="Turn off camera" arrow>
          <IconButton
            onClick={hundleStopWebCamStream}
            aria-label={"Turn off camera"}
          >
            <VideocamOffIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn on camera" arrow>
          <IconButton
            onClick={hundleWebCamStream}
            aria-label={error.usermedia || "Turn on camera"}
            disabled={!!error.usermedia}
          >
            <VideocamIcon />
          </IconButton>
        </Tooltip>
      )}

      <ShareScreenMenu />
      {!!mediaStream && (
        <Tooltip title="Record stream" arrow>
          <IconButton
            onClick={
              recordStarted
                ? () => {
                    recordStarted.stop()
                  }
                : () => {
                    hundleStartRecordStream()
                  }
            }
          >
            <RadioButtonCheckedIcon />
          </IconButton>
        </Tooltip>
      )}
    </div>
  )
}
