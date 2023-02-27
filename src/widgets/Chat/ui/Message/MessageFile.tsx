import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { FileMessage } from "../../model/types/ChatSchem"

type MessageFileProps = {
  message: FileMessage
}

export const MessageFile = (props: MessageFileProps) => {
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)
  const { message } = props

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  return (
    <img
      onClick={handleClick}
      alt=""
      src={message.src}
      style={{ width: "100%", objectFit: "contain" }}
    />
  )
}
