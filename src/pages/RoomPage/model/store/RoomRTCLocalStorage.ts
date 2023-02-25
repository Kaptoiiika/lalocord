import { localstorageKeys } from "@/shared/const/localstorageKeys/localstorageKeys"
import { getNumberBeetwenTwoValues } from "@/shared/lib/utils/Numbers/getNumberBeetwenTwoValues"
import {
  PriorityNumberToText,
  PriorityTextToNumber,
} from "../../utils/FormatePriority"

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
