import { create, StateCreator } from "zustand"
import { ConnectedUsers, RoomRTCSchema } from "../types/RoomRTCSchema"
import {
  getEncodingSettingsFromLocalStorage,
  saveEncodingSettingsToLocalStorage,
} from "./RoomRTCLocalStorage"

const store: StateCreator<RoomRTCSchema> = (set, get) => ({
  streamSettings: {
    audio: {
      noiseSuppression: false,
      echoCancellation: false,
      autoGainControl: false,
      channelCount: 2,
    },
    video: {
      frameRate: 60,
      width: { ideal: 1924 },
      // height: { ideal: 1080 }, 
      displaySurface: "monitor",
      cursor: "off",
    },
    surfaceSwitching: "include",
  },
  encodingSettings: getEncodingSettingsFromLocalStorage(),
  displayMediaStream: null,
  webCamStream: null,
  connectedUsers: {},

  close: () => {
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
})

export const useRoomRTCStore = create(store)
