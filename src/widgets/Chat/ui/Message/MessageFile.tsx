import { useState } from 'react'

import { Link } from '@mui/material'
import { getActionSeletFileToImagePreview } from 'src/features/ImagePreview'
import { useImagePreviewStore } from 'src/features/ImagePreview/model/store/ImagePreviewStore'
import { useMountedEffect } from 'src/shared/lib/hooks/useMountedEffect/useMountedEffect'
import { readablizeBytes } from 'src/shared/lib/utils/Numbers/readablizeBytes/ReadablizeBytes'

import type { WebRTCChatMessage } from 'src/entities/WebRTC'

type MessageFileProps = {
  data: RequireOnlyOne<WebRTCChatMessage, 'blob'>
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
      <Link
        href={blobUrl}
        download={data.blobParams?.name}
        target="_blank"
        rel="noreferrer"
      >
        {data.blobParams?.name || data.blob.type || 'unknown file'} - {readablizeBytes(data.blob.size)}
      </Link>
    )
  }

  return (
    <img
      onError={handleError}
      onClick={handleClick}
      alt=""
      src={blobUrl}
      style={{
        width: '100%',
        objectFit: 'contain',
      }}
    />
  )
}
