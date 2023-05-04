import { create, StateCreator } from "zustand"
import { ConvertUserSettingsToMediaSettings } from "../../utils/ConvertUserSettingsToMediaSettings"
import {
  ConnectedUsers,
  RoomRTCSchema,
} from "../../../../entities/RTCClient/model/types/RoomRTCSchema"
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
    const {
      displayMediaStream,
      webCamStream,
      microphoneStream,
      userStreamSettings,
      startWebCamStream,
      startMicrophoneStream,
    } = get()
    const streamWithVideo = [displayMediaStream, webCamStream]
    streamWithVideo.map((stream) => {
      const videoTrack = stream?.getVideoTracks()
      videoTrack?.forEach((track) =>
        track.applyConstraints({
          frameRate: userStreamSettings.video?.frameRate,
          height: userStreamSettings.video?.height,
        })
      )
    })

    set((state) => ({
      ...state,
      userStreamSettings: streamSettings,
      streamSettings: ConvertUserSettingsToMediaSettings(streamSettings),
    }))

    //restart stream?
    if (
      streamSettings.video.deviceId !== userStreamSettings.video.deviceId &&
      webCamStream
    ) {
      startWebCamStream()
    }
    if (
      streamSettings.audio.deviceId !== userStreamSettings.audio.deviceId &&
      microphoneStream
    ) {
      startMicrophoneStream()
    }
  },
  joinRoom: (roomName) => {
    set((state) => ({ ...state, roomName: roomName }))
  },
  leaveRoom: () => {
    const {
      webCamStream,
      displayMediaStream,
      microphoneStream,
      connectedUsers,
    } = get()
    const tracks = [
      ...(displayMediaStream?.getTracks() || []),
      ...(webCamStream?.getTracks() || []),
      ...(microphoneStream?.getTracks() || []),
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
      microphoneStream: null,
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
  async startWebCamStream() {
    const { webCamStream, streamSettings, stopWebCamStream } = get()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: streamSettings.video,
      audio: false,
    })
    webCamStream?.getTracks().forEach((tracks) => {
      tracks.onended = null
      tracks.stop()
    })
    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        stopWebCamStream()
      }
    })
    set((state) => ({ ...state, webCamStream: stream }))
  },
  stopWebCamStream() {
    const { webCamStream } = get()
    webCamStream?.getTracks().forEach((tracks) => {
      tracks.onended = null
      tracks.stop()
    })
    set((state) => ({ ...state, webCamStream: null }))
  },
  setdisplayMediaStream(stream) {
    set((state) => ({ ...state, displayMediaStream: stream }))
  },
  async startMicrophoneStream() {
    const { microphoneStream, streamSettings, stopMicrophoneStream } = get()
    const stream = await navigator.mediaDevices.getUserMedia({
      video: false,
      audio: streamSettings.audio,
    })
    microphoneStream?.getTracks().forEach((tracks) => {
      tracks.onended = null
      tracks.stop()
    })
    stream.getVideoTracks().forEach((track) => {
      track.onended = () => {
        stopMicrophoneStream()
      }
    })
    set((state) => ({ ...state, microphoneStream: stream }))
  },
  stopMicrophoneStream() {
    const { microphoneStream } = get()
    microphoneStream?.getTracks().forEach((tracks) => {
      tracks.onended = null
      tracks.stop()
    })
    set((state) => ({ ...state, microphoneStream: null }))
  },
  changeAutoplay(condition) {
    saveAutoPlaytoLocalStorage(condition)
    set((state) => ({ ...state, autoplay: condition }))
  },
})

export const useRoomRTCStore = create(store)
