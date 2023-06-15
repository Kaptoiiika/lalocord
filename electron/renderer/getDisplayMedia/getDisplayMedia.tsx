import { displayMediaSelector } from "./displayMediaSelector"

export const getDisplayMedia = async (
  constatins: MediaStreamConstraints
): Promise<MediaStream> => {
  const selectedSource = await displayMediaSelector()
  const set: any = {}

  if (typeof constatins.audio === "object") {
    set.audio = {}
    set.audio.mandatory = {
      ...constatins.audio,
      chromeMediaSource: "desktop",
    }
    if (selectedSource)
      //@ts-ignore
      set.audio.mandatory.chromeMediaSourceId = selectedSource.id
  }

  if (typeof constatins.video === "object") {
    set.video = {}
    set.video.mandatory = {
      ...constatins.video,
      chromeMediaSource: "desktop",
      cursor: "motion",
    }
    if (selectedSource)
      set.video.mandatory.chromeMediaSourceId = selectedSource.id
  }

  const stream = await navigator.mediaDevices.getUserMedia(set)
  return stream
}
