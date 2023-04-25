import { create, StateCreator } from "zustand"
import { ConvertUserSettingsToMediaSettings } from "../../utils/ConvertUserSettingsToMediaSettings"
import { ConnectedUsers, RoomRTCSchema } from "../types/RoomRTCSchema"
import {
  getAutoPlayfromLocalStorage,
  getEncodingSettingsFromLocalStorage,
  getStreamSettingsfromLocalStorage,
  saveAutoPlaytoLocalStorage,
  saveEncodingSettingsToLocalStorage,
  saveStreamSettingstoLocalStorage,
} from "./RoomRTCLocalStorage"

const store: StateCreator<RoomRTCSchema> = (set, get) => ({
  streamSettings: ConvertUserSettingsToMediaSettings(
    getStreamSettingsfromLocalStorage()
  ),
  userStreamSettings: getStreamSettingsfromLocalStorage(),
  encodingSettings: getEncodingSettingsFromLocalStorage(),
  autoplay: getAutoPlayfromLocalStorage(),
  roomName: null,
  connectedUsers: {},
  displayMediaStream: null,
  webCamStream: null,
  microphoneStream: null,

  setStreamSettings(streamSettings) {
    saveStreamSettingstoLocalStorage(streamSettings)
    set((state) => ({
      ...state,
      userStreamSettings: streamSettings,
      streamSettings: ConvertUserSettingsToMediaSettings(streamSettings),
    }))
  },
  joinRoom: (roomName) => {
    set((state) => ({ ...state, roomName: roomName }))
  },
  leaveRoom: () => {
    const { webCamStream, displayMediaStream, connectedUsers } = get()
    const tracks = [
      ...(displayMediaStream?.getTracks() || []),
      ...(webCamStream?.getTracks() || []),
    ]
    tracks.forEach((tracks) => {
      tracks.onended = null
      tracks.stop()
    })
    Object.values(connectedUsers).forEach((client) => {
      client.close()
    })

    set((state) => ({
      ...state,
      webCamStream: null,
      displayMediaStream: null,
      connectedUsers: {},
    }))
  },
  setEncodingSettings: (settings) => {
    saveEncodingSettingsToLocalStorage(settings)
    set((state) => ({ ...state, encodingSettings: { ...settings } }))
  },
  addConnectedUsers(...newUsers) {
    const users: ConnectedUsers = {}
    newUsers.forEach((usr) => {
      users[usr.id] = usr
    })
    set((state) => ({
      ...state,
      connectedUsers: { ...state.connectedUsers, ...users },
    }))
  },
  deleteConnectedUser: (id) => {
    const usrs = get().connectedUsers
    delete usrs[id]
    set((state) => ({
      ...state,
      connectedUsers: { ...usrs },
    }))
  },
  setWebCamStream(stream) {
    set((state) => ({ ...state, webCamStream: stream }))
  },
  setdisplayMediaStream(stream) {
    set((state) => ({ ...state, displayMediaStream: stream }))
  },
  setMicrophoneStream(stream) {
    set((state) => ({ ...state, microphoneStream: stream }))
  },
  changeAutoplay(condition) {
    saveAutoPlaytoLocalStorage(condition)
    set((state) => ({ ...state, autoplay: condition }))
  },
})

export const useRoomRTCStore = create(store)
