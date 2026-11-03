import { memo } from 'react'

import { Modal, TextLink } from 'src/shared/ui'

import { getActionUselectImagePreview, getCurrentImagePreview } from '../model/selectors/ImagePreviewSelectors'
import { useImagePreviewStore } from '../model/store/ImagePreviewStore'

export const ImagePreview = memo(function ImagePreview() {
  const image = useImagePreviewStore(getCurrentImagePreview)
  const unselectImage = useImagePreviewStore(getActionUselectImagePreview)

  const open = !!image

  const handleClose = () => {
    unselectImage()
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      className="max-h-[90vh] overflow-auto sm:max-w-[90vw]"
    >
      <h2 className="text-lg font-semibold">
        {image && (
          <TextLink
            href={image}
            target="_blank"
            rel="noopener noreferrer"
          >
            Full size
          </TextLink>
        )}
      </h2>
      {image && (
        <img
          className="max-h-[90vh] max-w-[90vw]"
          src={image}
          alt=""
        />
      )}
    </Modal>
  )
})
