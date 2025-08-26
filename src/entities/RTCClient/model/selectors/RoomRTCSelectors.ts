import type { RoomRTCSchema } from '../types/RoomRTCSchema'

export const getStreamSettings = (state: RoomRTCSchema) => state.streamSettings
export const getUserStreamSettings = (state: RoomRTCSchema) => state.userStreamSettings
export const getEncodingSettings = (state: RoomRTCSchema) => state.encodingSettings

export const getActionSetEncodingSettings = (state: RoomRTCSchema) => state.setEncodingSettings
