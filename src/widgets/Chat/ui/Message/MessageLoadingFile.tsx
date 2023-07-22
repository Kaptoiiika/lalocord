import { RTCChatMessage } from "@/entities/RTCClient"
import LinearProgress from "@mui/material/LinearProgress"

type MessageFileProps = {
  data: RTCChatMessage
}

export const MessageLoadingFile = (props: MessageFileProps) => {
  const { data } = props

  if (!data.blobParams?.loaded || !data.blobParams?.length) {
    return null
  }

  const progress = data.blobParams.loaded / data.blobParams.length

  return (
    <i>
      loading {data.blobParams?.type}
      <br />
      {data.blobParams?.loaded}/{data.blobParams?.length}
      <LinearProgress variant="determinate" value={progress * 100} />
    </i>
  )
}
