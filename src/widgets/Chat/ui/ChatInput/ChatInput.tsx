import { useUserStore, getLocalUser } from "@/entities/User"
import { FilledInput, IconButton, Stack, Tooltip } from "@mui/material"
import { useState, useCallback, memo } from "react"
import { useChatStore } from "../../model/store/ChatStore"
import styles from "./ChatInput.module.scss"
import SendIcon from "@mui/icons-material/Send"
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile"

type ChatInputProps = {
  onSendMessage?: (msg: string) => void
  onSendFile?: (blob: Blob) => void
}

export const ChatInput = memo(function ChatInput(props: ChatInputProps) {
  const { onSendMessage, onSendFile } = props
  const addMessage = useChatStore((state) => state.addNewMessage)
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
    addMessage(
      {
        id: crypto.randomUUID(),
        blob: blob,
        type: "file",
      },
      localUser,
      true
    )
  }

  const handlePasteFile = (e: React.ClipboardEvent) => {
    const items = Array.from(e.clipboardData.items)
    const item = items.find((item) => !!item.getAsFile())
    const blob = item?.getAsFile()
    if (blob) handleSendFile(blob)
  }

  const handleDropFile = (e: React.DragEvent) => {
    e.preventDefault()
    const items = Array.from(e.dataTransfer.items)
    const item = items.find((item) => !!item.getAsFile())
    const blob = item?.getAsFile()
    if (blob) handleSendFile(blob)
  }

  const handleSelectFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleSendFile(file)
    }
  }

  const handleSendMessage = () => {
    if (text === "") return
    const message = text.trim()
    addMessage(
      { id: crypto.randomUUID(), type: "text", message: message },
      localUser,
      true
    )
    onSendMessage?.(message)
    setText("")
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.shiftKey || e.altKey || e.ctrlKey) return

    if (e.key === "Enter") {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className={styles.form}>
      <div className={styles.inputWrapper}>
        <FilledInput
          sx={{
            p: 1,
            pr: 6,
            borderRadius: 0,
            lineHeight: 1.5,
          }}
          onPaste={handlePasteFile}
          onDrop={handleDropFile}
          onChange={handleChangeText}
          onKeyDown={handleKeyDown}
          autoComplete="off"
          value={text}
          multiline
          maxRows={3}
          className={styles.input}
          type="text"
          inputProps={{ "aria-label": "message from chat" }}
        />
      </div>
      <Stack
        className={styles.buttons}
        direction="column-reverse"
        alignItems="end"
        justifyContent="end"
        gap={1}
      >
        <IconButton onClick={handleSendMessage} aria-label="send button">
          <SendIcon />
        </IconButton>
        <Tooltip title={"send file"} placement="top">
          <IconButton>
            <label className={styles.selectInputFile}>
              <InsertDriveFileIcon />
              <input
                value={""}
                onChange={handleSelectFile}
                hidden
                type="file"
              />
            </label>
          </IconButton>
        </Tooltip>
      </Stack>
    </div>
  )
})
