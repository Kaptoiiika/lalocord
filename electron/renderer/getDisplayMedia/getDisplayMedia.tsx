import { displayMediaSelector } from "./displayMediaSelector"

export const getDisplayMedia = async (
  constatins: MediaStreamConstraints
): Promise<MediaStream> => {
  const selectedSource = await displayMediaSelector()
  const set: any = {}

  if (typeof constatins.audio === "object") {
    const audioConstains: MediaStreamConstraints["audio"] = {
      ...constatins.audio,
    }
    set.audio = {}
    set.audio.mandatory = {
      ...audioConstains,
      chromeMediaSource: "desktop",
    }
    if (selectedSource)
      set.audio.mandatory.chromeMediaSourceId = selectedSource.id
  }

  if (typeof constatins.video === "object") {
    set.video = {}
    set.video.mandatory = {
      ...constatins.video,
      maxFrameRate: constatins.video.frameRate,
      chromeMediaSource: "desktop",
      cursor: "motion",
    }
    if (selectedSource)
      set.video.mandatory.chromeMediaSourceId = selectedSource.id
  }

  console.log(set)
  const stream = await navigator.mediaDevices.getUserMedia(set)
  return stream
}
