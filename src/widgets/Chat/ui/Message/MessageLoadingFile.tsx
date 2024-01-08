import { RTCChatMessage } from "@/entities/RTCClient"
import { readablizeBytes } from "@/shared/lib/utils/Numbers/readablizeBytes/ReadablizeBytes"
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
      loading {data.blobParams?.name || data.blobParams?.type}
      <br />
      {readablizeBytes(data.blobParams?.loaded)} / {readablizeBytes(data.blobParams?.length)}
      <LinearProgress variant="determinate" value={progress * 100} />
    </i>
  )
}
