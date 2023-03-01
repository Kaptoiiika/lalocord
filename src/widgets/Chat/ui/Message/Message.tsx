import { Link, Typography } from "@mui/material"
import Linkify from "react-linkify"
import { MessageModel } from "../../model/types/ChatSchem"
import { MessageFile } from "./MessageFile"
import styles from "./Message.module.scss"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"

type MessageProps = {
  message: MessageModel
  className?: string
}

function checkURLisImageLink(url: string) {
  return (
    url.match(/^http[^\?]*.(jpg|jpeg|gif|png|tiff|bmp)(\?(.*))?$/gim) != null
  )
}

export const Message = (props: MessageProps) => {
  const { message, className } = props
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)

  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  return (
    <Typography component="pre" className={className}>
      {typeof message.data === "string" && (
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
              <Link key={key} href={href} target="_blank" rel="noreferrer">
                {text}
              </Link>
            )
          }}
        >
          {message.data}
        </Linkify>
      )}

      {typeof message.data === "object" && (
        <MessageFile message={message.data} />
      )}
    </Typography>
  )
}
