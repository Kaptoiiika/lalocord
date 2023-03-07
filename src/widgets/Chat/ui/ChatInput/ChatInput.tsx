import { useUserStore, getLocalUser } from "@/entities/User"
import { IconButton, Stack, TextField, Tooltip } from "@mui/material"
import { useState, useCallback } from "react"
import { getActionAddMessage } from "../../model/selectors/ChatStoreSelectors"
import { useChatStore } from "../../model/store/ChatStore"
import styles from "./ChatInput.module.scss"
import SendIcon from "@mui/icons-material/Send"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"

type ChatInputProps = {
  onSendMessage?: (msg: string) => void
  onSendFile?: (blob: Blob) => void
}

export const ChatInput = (props: ChatInputProps) => {
  const { onSendMessage, onSendFile } = props
  const addMessage = useChatStore(getActionAddMessage)
  const localUser = useUserStore(getLocalUser)
  const [text, setText] = useState("")

  const handleChangeText = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setText(e.currentTarget.value)
    },
    []
  )

  const handleSendFile = async (blob: Blob) => {
    onSendFile?.(blob)
    addMessage({
      data: { type: blob.type, src: URL.createObjectURL(blob) },
      user: localUser,
    })
  }

  const handlePasteFile = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const item = items.find((item) => !!item.getAsFile())
    const blob = item?.getAsFile()
    if (blob) handleSendFile(blob)
  }

  const handleDropFile = (e: React.DragEvent) => {
    const items = Array.from(e.dataTransfer.items)
    const item = items.find((item) => !!item.getAsFile())
    const blob = item?.getAsFile()
    if (blob) handleSendFile(blob)
  }

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleSendFile(file)
  }

  const handleSendMessage = () => {
    if (text === "") return
    const message = text.trim()
    addMessage({ data: message, user: localUser })
    onSendMessage?.(message)
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.shiftKey || e.altKey || e.ctrlKey) return

    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.form}>
      <Stack direction="row" alignItems="end">
        <div className={styles.inputWrapper}>
          <TextField
            onPaste={handlePasteFile}
            onDrop={handleDropFile}
            onChange={handleChangeText}
            onKeyDown={handleKeyDown}
            autoComplete="off"
            value={text}
            multiline
            className={styles.input}
          />
        </div>
        <Stack
          className={styles.buttons}
          direction="column"
          alignItems="center"
          justifyContent="end"
          gap={1}
        >
          <Tooltip title={"send file"} placement="top">
            <IconButton>
              <label className={styles.selectInputFile}>
                <InsertDriveFileIcon />
                <input
                  onChange={handleSelectFile}
                  hidden
                  type={"file"}
                  accept="image/*"
                />
              </label>
            </IconButton>
          </Tooltip>
          <IconButton onClick={handleSendMessage} aria-label="send button">
            <SendIcon />
          </IconButton>
        </Stack>
      </Stack>
    </div>
  )
}