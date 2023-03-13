import {
  getStreamSettings,
  getActionSetMicrophoneStream,
  getMicrophoneStream,
} from "@/pages/RoomPage/model/selectors/RoomRTCSelectors"
import { useRoomRTCStore } from "@/pages/RoomPage/model/store/RoomRTCStore"
import { Tooltip, IconButton } from "@mui/material"
import { useCallback } from "react"
import MicIcon from "@mui/icons-material/Mic"
import MicOffIcon from "@mui/icons-material/MicOff"
// import styles from "./ShareMicrophoneMenu.module.scss"

export const ShareMicrophoneMenu = () => {
  const setMicrophoneStream = useRoomRTCStore(getActionSetMicrophoneStream)
  const microphoneStream = useRoomRTCStore(getMicrophoneStream)
  const streamSettings = useRoomRTCStore(getStreamSettings)

  const handleStartWebCamStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: false,
        audio: streamSettings.audio,
      })
      microphoneStream?.getTracks().forEach((tracks) => {
        tracks.onended = null
        tracks.stop()
      })
      setMicrophoneStream(stream)
      stream.getVideoTracks().forEach((track) => {
        track.onended = () => {
          setMicrophoneStream(null)
        }
      })
    } catch (error: any) {
      console.log(error)
    }
  }

  const handleStopStream = useCallback(() => {
    microphoneStream?.getTracks().forEach((track) => {
      track.stop()
    })
    setMicrophoneStream(null)
  }, [microphoneStream, setMicrophoneStream])

  return (
    <>
      {!!microphoneStream ? (
        <Tooltip title="Turn off microphone" arrow>
          <IconButton onClick={handleStopStream}>
            <MicOffIcon />
          </IconButton>
        </Tooltip>
      ) : (
        <Tooltip title="Turn on microphone" arrow>
          <IconButton onClick={handleStartWebCamStream}>
            <MicIcon />
          </IconButton>
        </Tooltip>
      )}
    </>
  )
}
