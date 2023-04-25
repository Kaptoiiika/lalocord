import { RoomRTCSchema } from "../types/RoomRTCSchema"

export const getDisplayMediaStream = (state: RoomRTCSchema) =>
  state.displayMediaStream
export const getWebCamStream = (state: RoomRTCSchema) => state.webCamStream
export const getStreamSettings = (state: RoomRTCSchema) => state.streamSettings
export const getUserStreamSettings = (state: RoomRTCSchema) => state.userStreamSettings
export const getMicrophoneStream = (state: RoomRTCSchema) => state.microphoneStream
export const getRoomUsers = (state: RoomRTCSchema) => state.connectedUsers
export const getEncodingSettings = (state: RoomRTCSchema) =>
  state.encodingSettings
export const getRoomName = (state: RoomRTCSchema) => state.roomName

//actions
export const getActionDeleteConnectedUsers = (state: RoomRTCSchema) =>
  state.deleteConnectedUser
export const getActionSetConnectedUsers = (state: RoomRTCSchema) =>
  state.addConnectedUsers
export const getActionSetWebCamStream = (state: RoomRTCSchema) =>
  state.setWebCamStream
export const getActionSetDisaplyMediaStream = (state: RoomRTCSchema) =>
  state.setdisplayMediaStream
export const getActionSetMicrophoneStream = (state: RoomRTCSchema) =>
  state.setMicrophoneStream
export const getActionSetEncodingSettings = (state: RoomRTCSchema) =>
  state.setEncodingSettings
