import { VideoPlayer } from "@/shared/ui/VideoPlayer/VideoPlayer"
import { Button, Stack, Tooltip, Typography } from "@mui/material"
import styles from "./ClientStream.module.scss"
import { useId, useState } from "react"
import RemoveIcon from "@mui/icons-material/Remove"
import { classNames } from "@/shared/lib/classNames/classNames"
import { startViewTransition } from "@/shared/lib/utils/ViewTransition/ViewTransition"

type ClientStreamProps = {
  stream: MediaStream | null
  name: string
}

export const LocalClientStream = (props: ClientStreamProps) => {
  const { name, stream } = props
  const componentId = useId().split(":").join("")
  const [hide, setHide] = useState(false)

  const handleHide = async () => {
    await startViewTransition()
    setHide(true)
  }

  const handleUnHide = async () => {
    await startViewTransition()
    setHide(false)
  }

  return (
    <div
      style={{
        viewTransitionName: componentId,
      }}
      className={classNames([styles.stream], {
        [styles.hideStream]: hide,
        [styles.unhideRight]: hide,
      })}
    >
      <VideoPlayer stream={stream} mute controls={!hide}>
        <Stack
          direction="row"
          justifyContent="space-between"
          className={styles.streamTooltip}
        >
          <Typography>{name}</Typography>
          <Tooltip title="Hide stream">
            <Button aria-label="Hide stream" onClick={handleHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </Stack>
      </VideoPlayer>
      {hide && (
        <div className={styles.unhide}>
          <Tooltip title="Unhide stream">
            <Button aria-label="Unhide stream" onClick={handleUnHide}>
              <RemoveIcon />
            </Button>
          </Tooltip>
        </div>
      )}
    </div>
  )
}
