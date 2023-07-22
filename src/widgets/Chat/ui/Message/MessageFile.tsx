import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { Link } from "@mui/material"
import { useState } from "react"
import { RTCChatMessage } from "@/entities/RTCClient"
import { useMountedEffect } from "@/shared/lib/hooks/useMountedEffect/useMountedEffect"

type MessageFileProps = {
  data: RequireOnlyOne<RTCChatMessage, "blob">
}

export const MessageFile = (props: MessageFileProps) => {
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)
  const [error, setError] = useState(false)
  const { data } = props
  const [blobUrl, setBlobUrl] = useState<string>()

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  const handleError = () => {
    setError(true)
  }

  useMountedEffect(() => {
    const url = URL.createObjectURL(data.blob)
    setBlobUrl(url)
    return () => {
      URL.revokeObjectURL(url)
    }
  })

  if (!blobUrl) {
    return <span>...loading</span>
  }

  if (error) {
    return (
      <Link href={blobUrl} target="_blank" rel="noreferrer">
        {data.blob.type || "unknown file"} - {data.blob.size}
      </Link>
    )
  }

  return (
    <img
      onError={handleError}
      onClick={handleClick}
      alt=""
      src={blobUrl}
      style={{ width: "100%", objectFit: "contain" }}
    />
  )
}
