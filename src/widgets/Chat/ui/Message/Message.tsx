import { Link as MuiLink, Typography } from "@mui/material"
import Linkify from "react-linkify"
import { MessageModelNew } from "../../model/types/ChatSchema"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"
import { MessageFile } from "./MessageFile"
import { RTCChatMessage } from "@/entities/RTCClient"
import { MessageLoadingFile } from "./MessageLoadingFile"

type MessageProps = {
  data: MessageModelNew
  className?: string
}

function checkURLisImageLink(url: string) {
  return (
    url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null
  )
}

export const Message = (props: MessageProps) => {
  const { data, className } = props
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  return (
    <Typography component="pre" className={className}>
      <Linkify
        componentDecorator={(href, text, key) => {
          if (checkURLisImageLink(href))
            return (
              <img
                onClick={handleClick}
                alt=""
                src={href}
                style={{ width: "100%", objectFit: "contain" }}
              />
            )

          return (
            <MuiLink key={key} href={href} target="_blank" rel="noreferrer">
              {text}
            </MuiLink>
          )
        }}
      >
        {data.message.message}
      </Linkify>
      {/* type guard don't work with this :( */}
      {!!data.message.blob && <MessageFile data={data.message as RequireOnlyOne<RTCChatMessage, "blob">} />}
      {!!data.message.blobParams && <MessageLoadingFile data={data.message} />}
    </Typography>
  )
}
