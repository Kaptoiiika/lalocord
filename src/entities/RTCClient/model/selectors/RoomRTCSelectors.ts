import type { RoomRTCSchema } from '../types/RoomRTCSchema'

export const getEncodingSettings = (state: RoomRTCSchema) => state.encodingSettings

export const getActionSetEncodingSettings = (state: RoomRTCSchema) => state.setEncodingSettings
