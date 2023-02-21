import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"

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
      priority: data?.priority || defaultEncodingSettings.priority,
      scaleResolutionDownBy:
        data?.scaleResolutionDownBy ||
        defaultEncodingSettings.scaleResolutionDownBy,
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
