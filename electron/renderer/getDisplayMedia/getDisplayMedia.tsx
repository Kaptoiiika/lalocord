import { displayMediaSelector } from "./displayMediaSelector"

export const getDisplayMedia = async (
  constatins: MediaStreamConstraints
): Promise<MediaStream> => {
  const { source, allowAudio } = await displayMediaSelector()
  const set: any = {}

  if (typeof constatins.audio === "object" && allowAudio === true) {
    const audioConstains: MediaStreamConstraints["audio"] = {
      ...constatins.audio,
    }
    set.audio = {}
    set.audio.mandatory = {
      ...audioConstains,
      chromeMediaSource: "desktop",
    }
    if (source) set.audio.mandatory.chromeMediaSourceId = source.id
  }

  if (typeof constatins.video === "object") {
    set.video = {}
    set.video.mandatory = {
      ...constatins.video,
      maxFrameRate: constatins.video.frameRate,
      chromeMediaSource: "desktop",
      cursor: "motion",
    }
    if (source) set.video.mandatory.chromeMediaSourceId = source.id
  }

  const stream = await navigator.mediaDevices.getUserMedia(set)
  return stream
}
