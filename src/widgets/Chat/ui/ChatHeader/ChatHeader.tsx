import { memo } from 'react'

import { MessageCircle } from 'lucide-react'
import { useAudioEffectStore } from 'src/entities/AudioEffect'
import { AudioName } from 'src/entities/AudioEffect/model/types/AudioEffectSchema'
import { usePopup } from 'src/shared/lib/hooks/usePopup/usePopup'
import { cn } from 'src/shared/lib/utils/cn'
import { Button, CounterBadge, Popup } from 'src/shared/ui'

import { useChatStore } from '../../model/store/ChatStore'

type ChatHeaderProps = {
  handleCollapse: () => void
  collapsed: boolean
  unreadedMessage: number
}

export const ChatHeader = memo(function ChatHeader(props: ChatHeaderProps) {
  const { handleCollapse, collapsed, unreadedMessage } = props
  const audioVolumes = useAudioEffectStore((state) => state.audioSettings)
  const handleChangeMode = useAudioEffectStore((state) => state.changeMuted)
  const handleClearChat = useChatStore((state) => state.clearMessages)
  const isSilent = audioVolumes.notification.muted
  const { open, setOpen, handleOpen, handleClose } = usePopup()

  const handleChangeSilentMode = () => {
    handleChangeMode(AudioName.notification, !isSilent)
    handleClose()
  }

  const handleClearChatHistory = () => {
    handleClearChat()
    handleClose()
  }

  const anchorClassName = cn(
    'absolute right-0 block min-w-16 transition-[width] duration-300 max-[625px]:w-full',
    collapsed
      ? 'h-[calc(var(--header-height)-var(--box-border-width))] w-16'
      : 'h-[var(--header-height)] w-[var(--chat-width)] [border-bottom:var(--box-border)]'
  )

  return (
    <Popup
      open={open}
      onOpenChange={setOpen}
      side="bottom"
      align="start"
      anchorClassName={anchorClassName}
      className="min-w-[calc(var(--chat-width)/2)]"
      trigger={
        <header
          className="h-full w-full"
          onContextMenu={handleOpen}
        >
          <Button
            variant="ghost"
            className="h-full w-full rounded-none [border-left:var(--box-border)] max-[625px]:border-l-0"
            onClick={handleCollapse}
            aria-label={collapsed ? 'Open chat' : 'Hide chat'}
          >
            <CounterBadge count={unreadedMessage}>
              <MessageCircle className={isSilent ? 'text-muted-foreground' : 'text-foreground'} />
            </CounterBadge>
          </Button>
        </header>
      }
    >
      <div className="flex flex-col gap-2">
        <Button
          variant="ghost"
          className="justify-start"
          onClick={handleChangeSilentMode}
        >
          {isSilent ? 'unmute' : 'mute'}
        </Button>
        <Button
          variant="ghost"
          className="justify-start"
          onClick={handleClearChatHistory}
        >
          Clear chat history
        </Button>
      </div>
    </Popup>
  )
})
