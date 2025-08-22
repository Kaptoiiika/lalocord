import type { UserStreamSettings } from '../model/types/RoomRTCSchema';

export const ConvertUserSettingsToMediaSettings = (
  userSettings: UserStreamSettings
): MediaStreamConstraints => ({
    audio: {
      ...userSettings.audio,
      channelCount: 2,
      deviceId: userSettings.audio.deviceId,
    },
    video: {
      frameRate: userSettings.video.frameRate,
      height: {
        ideal: userSettings.video.height,
      },
      deviceId: userSettings.video.deviceId,
      displaySurface: 'monitor',
    },
  });
