import { getLastSelectedSource } from 'electron/renderer/getDisplayMedia/displayMediaSelector'
import { __IS_ELECTRON__ } from 'src/shared/const/config'

import type { MediaSourceBounds } from 'electron/main/get_media_source/get_media_source'

export const getRemoteControlScreenBounds = (
  isAllowed: boolean,
  screenStream: MediaStream | null
): MediaSourceBounds | null => {
  if (!__IS_ELECTRON__ || !isAllowed || !screenStream) return null

  const source = getLastSelectedSource()
  if (!source?.isScreen || !source.bounds) return null
  if (source.bounds.width <= 0 || source.bounds.height <= 0) return null

  return source.bounds
}
