import { Link, Modal, Paper, Typography } from "@mui/material"
import { memo } from "react"
import {
  getActionUselectImagePreview,
  getCurrentImagePreview,
} from "../model/selectors/ImagePreviewSelectors"
import { useImagePreviewStore } from "../model/store/ImagePreviewStore"
import styles from "./ImagePreview.module.scss"

type ImagePreviewProps = {}

const style = {
  position: "absolute" as const,
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  pt: 2,
  px: 4,
  pb: 3,
}

export const ImagePreview = memo(function ImagePreview(
  props: ImagePreviewProps
) {
  const {} = props
  const image = useImagePreviewStore(getCurrentImagePreview)
  const unselectImage = useImagePreviewStore(getActionUselectImagePreview)

  const open = !!image

  const handleClose = () => {
    unselectImage()
  }

  return (
    <Modal open={open} onClose={handleClose} keepMounted disablePortal>
      <Paper sx={style} className={styles.box}>
        <Typography variant="h6" component="h2">
          {image && (
            <Link href={image} target="_blank" rel="noopener noreferrer">
              Full size
            </Link>
          )}
        </Typography>
        {image && <img src={image} />}
      </Paper>
    </Modal>
  )
})
