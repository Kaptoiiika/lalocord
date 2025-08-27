import { localstorageKeys } from 'src/shared/const/localstorageKeys';
import { clamp } from 'src/shared/lib/utils/Numbers';

import { PriorityNumberToText, PriorityTextToNumber } from '../../utils/FormatePriority';

const defaultEncodingSettings: RTCRtpEncodingParameters = {
  maxBitrate: 1024 * 1024 * 10,
};

export const getEncodingSettingsFromLocalStorage = (): RTCRtpEncodingParameters => {
  const json = localStorage.getItem(localstorageKeys.ENCODINGSETTINGS);

  if (!json) return defaultEncodingSettings;
  const data = JSON.parse(json);
  const res: RTCRtpEncodingParameters = {
    maxBitrate: Number(data?.maxBitrate) || defaultEncodingSettings.maxBitrate,
    priority: data?.priority
      ? PriorityNumberToText(PriorityTextToNumber(data?.priority))
      : defaultEncodingSettings.priority,
    scaleResolutionDownBy: data?.scaleResolutionDownBy
      ? clamp(Number(data?.scaleResolutionDownBy), 1, 10)
      : defaultEncodingSettings.scaleResolutionDownBy,
  };

  return res;
};

export const saveEncodingSettingsToLocalStorage = (settings: RTCRtpEncodingParameters) => {
  localStorage.setItem(localstorageKeys.ENCODINGSETTINGS, JSON.stringify(settings));
};

export const getExperementalEncdoingFromLocalStorage = () => {
  const data = !!localStorage.getItem(localstorageKeys.experementalEncoding);

  return data;
};
