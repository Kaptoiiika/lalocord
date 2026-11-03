import { useState, useCallback, memo, useRef } from 'react'

import { File, Send } from 'lucide-react'
import { useLocalUserStore, getLocalUser } from 'src/entities/User'
import { IconButton, Textarea } from 'src/shared/ui'

import { useChatStore } from '../../model/store/ChatStore'

type ChatInputProps = {
  onSendMessage?: (msg: string) => void
  onSendFile?: (blob: Blob, name?: string) => void
}

export const ChatInput = memo(function ChatInput(props: ChatInputProps) {
  const { onSendMessage, onSendFile } = props
  const addMessage = useChatStore((state) => state.addNewMessage)
  const localUser = useLocalUserStore(getLocalUser)
  const [text, setText] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleChangeText = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(event.currentTarget.value)
  }, [])

  const handleSendFile = async (blob: Blob, name?: string) => {
    onSendFile?.(blob, name)
    addMessage(
      {
        id: crypto.randomUUID(),
        blob,
        type: 'file',
        blobParams: { name, length: blob.size, loaded: 0, type: blob.type },
      },
      localUser
    )
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handlePasteFile = (event: React.ClipboardEvent) => {
    const items = Array.from(event.clipboardData.items)
    const item = items.find((clipboardItem) => !!clipboardItem.getAsFile())
    const blob = item?.getAsFile()

    if (blob) handleSendFile(blob)
  }

  const handleDropFile = (event: React.DragEvent) => {
    event.preventDefault()
    const items = Array.from(event.dataTransfer.items)
    const item = items.find((transferItem) => !!transferItem.getAsFile())
    const blob = item?.getAsFile()

    if (blob) handleSendFile(blob, blob.name)
  }

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    if (file) {
      handleSendFile(file, file.name)
    }
  }

  const handleSendMessage = () => {
    if (text === '') return
    const message = text.trim()

    addMessage(
      {
        id: crypto.randomUUID(),
        type: 'text',
        message,
      },
      localUser
    )
    onSendMessage?.(message)
    setText('')
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.shiftKey || event.altKey || event.ctrlKey) return

    if (event.key === 'Enter') {
      event.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex items-end bg-[rgb(var(--bg-primary-color))]">
      <Textarea
        className="min-w-0 flex-1 rounded-none border-0 bg-transparent shadow-none"
        onPaste={handlePasteFile}
        onDrop={handleDropFile}
        onChange={handleChangeText}
        onKeyDown={handleKeyDown}
        autoComplete="off"
        value={text}
        aria-label="message from chat"
      />
      <div className="flex shrink-0">
        <IconButton
          tooltip="send file"
          tooltipSide="top"
          aria-label="send file"
          onClick={() => fileInputRef.current?.click()}
        >
          <File />
        </IconButton>
        <IconButton
          onClick={handleSendMessage}
          aria-label="send button"
        >
          <Send />
        </IconButton>
        <input
          ref={fileInputRef}
          onChange={handleSelectFile}
          className="hidden"
          type="file"
        />
      </div>
    </div>
  )
})
