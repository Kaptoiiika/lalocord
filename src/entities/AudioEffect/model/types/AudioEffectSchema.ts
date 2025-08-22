import type { MediaStreamTypes } from 'src/shared/types';

export const enum AudioName {
  notification = 'notification',
  joinToRoom = 'joinToRoom',
  exitFromRoom = 'exitFromRoom',
}

type AudioNames = keyof typeof AudioName | AudioName;
type AudioSettings = {
  muted?: boolean;
  volume: number;
};

export type AudioSettingsList = Record<string, AudioSettings>;
export type AudioUserSettingsList = Record<
  string,
  Partial<Record<MediaStreamTypes, number>>
>;

export interface AudioEffectSchema {
  audioSettings: AudioSettingsList;
  usersAuidoSettings: AudioUserSettingsList;

  play: (audioName: AudioNames) => Promise<void>;
  changeVolume: (audioName: AudioNames, volume: number) => void;
  changeUserVolume: (
    username: string,
    type: MediaStreamTypes,
    volume: number
  ) => void;
  changeMuted: (audioName: AudioNames, mute: boolean) => void;
}
