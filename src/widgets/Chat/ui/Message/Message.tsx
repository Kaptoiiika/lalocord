import { Link as MuiLink, Typography, Button, Menu, Stack } from "@mui/material"
import Linkify from "react-linkify"
import { MessageModelNew } from "../../model/types/ChatSchema"
import { useImagePreviewStore } from "@/features/ImagePreview/model/store/ImagePreviewStore"
import { getActionSeletFileToImagePreview } from "@/features/ImagePreview"
import { MessageFile } from "./MessageFile"
import { RTCChatMessage } from "@/entities/RTCClient"
import { MessageLoadingFile } from "./MessageLoadingFile"
import { useState } from "react"
import { useChatStore } from "../../model/store/ChatStore"
import { MessageTransmission } from "./MessageTransmission"

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
  const deleteMessageAction = useChatStore((state) => state.deleteMessage)
  const selectImage = useImagePreviewStore(getActionSeletFileToImagePreview)
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)
  const open = Boolean(anchorEl)
  const handleClick = (e: React.MouseEvent<HTMLImageElement>) => {
    selectImage(e.currentTarget.src)
  }

  const handleDeleteMessage = () => {
    deleteMessageAction(data.message.id)
  }

  const handleOpenContextMenu = (e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    setAnchorEl(e.currentTarget)
  }

  const handleCloseContextMenu = () => {
    setAnchorEl(null)
  }

  return (
    <Typography
      onContextMenu={handleOpenContextMenu}
      component="pre"
      className={className}
    >
      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseContextMenu}>
        <Stack>
          <Button onClick={handleDeleteMessage}>{"Delete message"}</Button>
        </Stack>
      </Menu>

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
      {!!data.message.blob && (
        <MessageFile
          data={data.message as RequireOnlyOne<RTCChatMessage, "blob">}
        />
      )}
      {!!data.message.blobParams && <MessageLoadingFile data={data.message} />}
      {!!data.message.transmission && <MessageTransmission data={data} />}
    </Typography>
  )
}
