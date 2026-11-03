import { VideoSettingsMenu } from './SettingsMenu/VideoSettingsMenu'
import { ShareMicrophoneMenu } from './ShareMicrophoneMenu/ShareMicrophoneMenu'
import { ShareScreenMenu } from './ShareScreenMenu/ShareScreenMenu'
import { ShareWebCamMenu } from './ShareWebCamMenu/ShareWebCamMenu'
import { StartMiniGame } from './StartMiniGame/StartMiniGame'

export const RoomActions = () => (
  <div className="flex shrink-0 flex-row items-center [border-top:var(--box-border)] max-[625px]:[border-bottom:var(--box-border)]">
    <ShareMicrophoneMenu />
    <ShareWebCamMenu />
    <ShareScreenMenu />
    <StartMiniGame />
    <div className="flex h-full flex-row items-center [border-left:var(--box-border)]">
      <VideoSettingsMenu />
    </div>
  </div>
)
