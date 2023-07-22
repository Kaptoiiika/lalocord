import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { Link } from "@mui/material"
import { useState } from "react"
import { FileMessage } from "../../model/types/ChatSchema"

type MessageFileProps = {
  message: FileMessage
}

export const MessageFile = (props: MessageFileProps) => {
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)
  const [error, setError] = useState(false)
  const { message } = props

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  const handleError = () => {
    setError(true)
  }

  if (error) {
    return (
      <Link href={message.src} target="_blank" rel="noreferrer">
        {message.type || "unknown file"}
      </Link>
    )
  }

  return (
    <img
      onError={handleError}
      onClick={handleClick}
      alt=""
      src={message.src}
      style={{ width: "100%", objectFit: "contain" }}
    />
  )
}
