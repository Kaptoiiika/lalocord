import { getDisplayMedia } from './getDisplayMedia/getDisplayMedia'

export const initElectron = () => {
  navigator.mediaDevices.getDisplayMedia = getDisplayMedia
}

