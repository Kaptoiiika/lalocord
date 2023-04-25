import { UserStreamSettings } from "../model/types/RoomRTCSchema"

export const ConvertUserSettingsToMediaSettings = (
  userSettings: UserStreamSettings
): MediaStreamConstraints => {
  return {
    audio: userSettings.audio,
    video: {
      frameRate: userSettings.video.frameRate,
      height: { ideal: userSettings.video.height },
      //@ts-ignore it work 
      displaySurface: "monitor",
    },
    surfaceSwitching: "include",
  }
}
