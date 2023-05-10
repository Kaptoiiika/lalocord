import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { getNumberBeetwenTwoValues } from "@/shared/lib/utils/Numbers/getNumberBeetwenTwoValues"
import {
  PriorityNumberToText,
  PriorityTextToNumber,
} from "../../utils/FormatePriority"
import { UserStreamSettings } from "../types/RoomRTCSchema"

const defaultEncodingSettings: RTCRtpEncodingParameters = {
  maxBitrate: 1024 * 1024 * 10,
  priority: "high",
  scaleResolutionDownBy: 1.0,
}

export const getEncodingSettingsFromLocalStorage =
  (): RTCRtpEncodingParameters => {
    const json = localStorage.getItem(localstorageKeys.ENCODINGSETTINGS)
    if (!json) return defaultEncodingSettings
    const data = JSON.parse(json)
    const res: RTCRtpEncodingParameters = {
      maxBitrate:
        Number(data?.maxBitrate) || defaultEncodingSettings.maxBitrate,
      priority: data?.priority
        ? PriorityNumberToText(PriorityTextToNumber(data?.priority))
        : defaultEncodingSettings.priority,
      scaleResolutionDownBy: data?.scaleResolutionDownBy
        ? getNumberBeetwenTwoValues(Number(data?.scaleResolutionDownBy), 1, 10)
        : defaultEncodingSettings.scaleResolutionDownBy,
    }
    return res
  }

export const saveEncodingSettingsToLocalStorage = (
  settings: RTCRtpEncodingParameters
) => {
  localStorage.setItem(
    localstorageKeys.ENCODINGSETTINGS,
    JSON.stringify(settings)
  )
}

export const getAutoPlayfromLocalStorage = (): boolean => {
  const autoplay = localStorage.getItem(localstorageKeys.AUTOPLAY)

  return !!autoplay
}
export const saveAutoPlaytoLocalStorage = (condition: boolean) => {
  localStorage.setItem(localstorageKeys.AUTOPLAY, JSON.stringify(condition))
}

const defaultStreamSettings = {
  audio: {
    noiseSuppression: false,
    echoCancellation: false,
    autoGainControl: false,
    channelCount: 2,
  },
  video: {
    frameRate: 60,
    // width: { ideal: 1924 },
    height: 1080,
    displaySurface: "monitor",
  },
  surfaceSwitching: "include",
}

export const getStreamSettingsfromLocalStorage = (): UserStreamSettings => {
  const json = localStorage.getItem(localstorageKeys.STREAMSETTINGS)
  if (!json) return defaultStreamSettings
  const data = JSON.parse(json)

  const settings: UserStreamSettings = {
    audio: {
      ...defaultStreamSettings.audio,
      deviceId: data?.audio?.deviceId || undefined,
    },
    video: {
      frameRate:
        Number(data?.video?.frameRate) || defaultStreamSettings.video.frameRate,
      height: Number(data?.video?.height) || defaultStreamSettings.video.height,
      hint: data?.video?.hint || "default",
      deviceId: data?.video?.deviceId || undefined,
    },
  }

  return settings
}

export const saveStreamSettingstoLocalStorage = (
  streamSettings: UserStreamSettings
) => {
  localStorage.setItem(
    localstorageKeys.STREAMSETTINGS,
    JSON.stringify(streamSettings)
  )
}