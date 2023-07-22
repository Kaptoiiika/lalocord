import { RTCChatMessage } from "@/entities/RTCClient"

type MessageFileProps = {
  data: RTCChatMessage
}

export const MessageLoadingFile = (props: MessageFileProps) => {
  const { data } = props

  return (
    <i>
      loading {data.blobParams?.type}
      <br />
      {data.blobParams?.loaded}
      <br />
      {data.blobParams?.length}
    </i>
  )
}
