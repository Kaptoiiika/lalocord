import { LinearProgress } from '@mui/material'
import { readablizeBytes } from 'src/shared/lib/utils/Numbers'

import type { WebRTCChatMessage } from 'src/entities/WebRTC'

type MessageFileProps = {
  data: WebRTCChatMessage
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
      <LinearProgress
        variant="determinate"
        value={progress * 100}
      />
    </i>
  )
}

