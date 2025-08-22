import { LinearProgress } from '@mui/material'

import type { MessageModelNew } from '../../model/types/ChatSchema'

type MessageFileProps = {
  data: MessageModelNew
}

export const MessageTransmission = (props: MessageFileProps) => {
  const { data } = props

  if (!data.message.transmission || !data.message.transmission) {
    return null
  }

  if (data.message.transmission.loaded >= data.message.transmission.length) return null

  const progress = data.message.transmission.loaded / data.message.transmission.length

  return (
    <i>
      {data.user.username} is loading
      <LinearProgress
        variant="determinate"
        value={progress * 100}
      />
    </i>
  )
}

