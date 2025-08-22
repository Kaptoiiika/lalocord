import type { RoomRTCSchema } from '../types/RoomRTCSchema';

export const getDisplayMediaStream = (state: RoomRTCSchema) => state.displayMediaStream;
export const getWebCamStream = (state: RoomRTCSchema) => state.webCamStream;
export const getStreamSettings = (state: RoomRTCSchema) => state.streamSettings;
export const getUserStreamSettings = (state: RoomRTCSchema) => state.userStreamSettings;
export const getMicrophoneStream = (state: RoomRTCSchema) => state.microphoneStream;
export const getRoomUsers = (state: RoomRTCSchema) => state.connectedUsers;
export const getEncodingSettings = (state: RoomRTCSchema) => state.encodingSettings;
export const getRoomName = (state: RoomRTCSchema) => state.roomName;

//actions
export const getActionDeleteConnectedUsers = (state: RoomRTCSchema) => state.deleteConnectedUser;
export const getActionSetConnectedUsers = (state: RoomRTCSchema) => state.addConnectedUsers;
export const getActionStartWebCamStream = (state: RoomRTCSchema) => state.startWebCamStream;
export const getActionStopWebCamStream = (state: RoomRTCSchema) => state.stopWebCamStream;
export const getActionSetDisaplyMediaStream = (state: RoomRTCSchema) => state.setdisplayMediaStream;
export const getActionStartMicrophoneStream = (state: RoomRTCSchema) => state.startMicrophoneStream;
export const getActionStopMicrophoneStream = (state: RoomRTCSchema) => state.stopMicrophoneStream;

export const getActionSetEncodingSettings = (state: RoomRTCSchema) => state.setEncodingSettings;
