import Linkify from 'react-linkify'
import { useImagePreviewStore, getActionSeletFileToImagePreview } from 'src/features/ImagePreview'
import { cn } from 'src/shared/lib/utils/cn'
import { TextLink } from 'src/shared/ui'

import type { MessageModelNew } from '../../model/types/ChatSchema'
import type { WebRTCChatMessage } from 'src/entities/WebRTC'

import { MessageFile } from './MessageFile'
import { MessageLoadingFile } from './MessageLoadingFile'
import { MessageMiniGameRequest } from './MessageMiniGameRequest'
import { MessageTransmission } from './MessageTransmission'

type MessageProps = {
  data: MessageModelNew
  className?: string
}

function checkURLisImageLink(url: string) {
  return url.match(/^http[^?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null
}

export const Message = (props: MessageProps) => {
  const { data, className } = props
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)

  const handleClick = (event: React.MouseEvent<HTMLImageElement>) => {
    selectImage(event.currentTarget.src)
  }

  return (
    <pre className={cn('m-0 ml-1 font-sans whitespace-break-spaces [overflow-wrap:break-word]', className)}>
      <Linkify
        componentDecorator={(href, text, key) => {
          if (checkURLisImageLink(href))
            return (
              <img
                onClick={handleClick}
                alt=""
                src={href}
                className="w-full object-contain"
              />
            )

          return (
            <TextLink
              key={key}
              href={href}
              target="_blank"
              rel="noreferrer"
            >
              {text}
            </TextLink>
          )
        }}
      >
        {data.message.message}
      </Linkify>
      {!!data.message.blob && <MessageFile data={data.message as RequireOnlyOne<WebRTCChatMessage, 'blob'>} />}
      {!!data.message.blobParams && <MessageLoadingFile data={data.message} />}
      {!!data.message.transmission && <MessageTransmission data={data} />}
      {!!data.message.gameType && <MessageMiniGameRequest data={data} />}
    </pre>
  )
}
