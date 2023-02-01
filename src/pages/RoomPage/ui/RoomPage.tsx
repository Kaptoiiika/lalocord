import { PageWrapper } from "@/widgets/Page"
import { StreamViewer } from "@/widgets/StreamViewer/ui/StreamViewer"
import { SpeedDial, SpeedDialAction } from "@mui/material"
import { useParams } from "react-router-dom"
import styles from "./RoomPage.module.scss"
import SpeedDialIcon from "@mui/material/SpeedDialIcon"
import VideocamIcon from "@mui/icons-material/Videocam"
import { useCallback, useEffect, useRef, useState } from "react"
import { socketClient } from "@/shared/api/socket/socket"
import { SocketActions } from "@/shared/api/socket/actions"

type Client = {
  id: string
  loading?: boolean
  peer: RTCPeerConnection
  chat?: RTCDataChannel
  video?: MediaStream
}

export type AddPeerRespounce = {
  peerId: string
  createOffer: boolean
}

export type RemoteDescriptionRespounce = {
  peerId: string
  sessionDescription: RTCSessionDescriptionInit
}

export type RemoteClientLeaveRespounce = { peerId: string }

export type AddIceCandidateRespounce = {
  peerId: string
  iceCandidate: RTCIceCandidate
}

export const RoomPage = () => {
  const { id = "" } = useParams()
  const connectedClients = useRef<Record<string, Client>>({})
  const [, updateClients] = useState<Record<string, Client>>({})
  const localStream = useRef<MediaStream | null>(null)
  const [, setLocalStream] = useState<MediaStream | null>(null)

  const getClientById = (id: string) => {
    const connectedClient = connectedClients.current[id]
    if (!connectedClient) return console.warn("can not find peer", id)

    return connectedClient
  }

  useEffect(() => {
    socketClient.emit(SocketActions.JOIN, { room: id })

    socketClient.on(SocketActions.ADD_PEER, async (data: AddPeerRespounce) => {
      const { peerId, createOffer } = data

      const newPeer = new RTCPeerConnection()
      console.log("new peer")

      newPeer.onicecandidate = (event) => {
        if (event.candidate) {
          socketClient.emit(SocketActions.RELAY_ICE, {
            peerId,
            iceCandidate: event.candidate,
          })
        }
      }

      const chatChannel = newPeer.createDataChannel("chat")

      chatChannel.onopen = () => {
        newPeer.onnegotiationneeded = async () => {
          const offer = await newPeer.createOffer()
          await newPeer.setLocalDescription(offer)
          console.log("try to create offer")

          chatChannel.send(JSON.stringify({ type: "newOffer", data: offer }))
        }
      }

      newPeer.ondatachannel = (event) => {
        const remoteChanel = event.channel

        remoteChanel.onmessage = async (event) => {
          const resp = JSON.parse(event.data)
          const { type, data } = resp

          switch (type) {
            case "newOffer":
              await newPeer.setRemoteDescription(data)
              const answer = await newPeer.createAnswer()
              await newPeer.setLocalDescription(answer)
              chatChannel.send(
                JSON.stringify({ type: "newAnswer", data: answer })
              )
              break
            case "newAnswer":
              await newPeer.setRemoteDescription(data)
              break
          }
        }
      }

      newPeer.ontrack = (event) => {
        console.log("track add")
        const { streams, track } = event
        if (track.kind === "video") {
          connectedClients.current[peerId].video = streams[0]
          updateClients({ ...connectedClients.current })
        }
      }

      connectedClients.current[peerId] = {
        id: peerId,
        peer: newPeer,
        chat: chatChannel,
      }

      updateClients({ ...connectedClients.current })

      if (localStream.current) {
        localStream.current.getTracks().forEach((track) => {
          console.log("track send", peerId)
          newPeer.addTrack(track, localStream.current!)
        })
      }

      newPeer.onsignalingstatechange = () => {
        console.log("state", newPeer.signalingState)
        switch (newPeer.signalingState) {
          case "have-local-offer":
            connectedClients.current[peerId].loading = true
            break
          case "have-remote-offer":
            connectedClients.current[peerId].loading = true
            break
          case "stable":
            connectedClients.current[peerId].loading = false
            break
        }
      }

      if (createOffer) {
        const offer = await newPeer.createOffer()
        await newPeer.setLocalDescription(offer)

        console.log("createOffer")
        socketClient.emit(SocketActions.RELAY_SDP, {
          peerId,
          sessionDescription: offer,
        })
      }
    })

    socketClient.on(
      SocketActions.SESSION_DESCRIPTION,
      async (data: RemoteDescriptionRespounce) => {
        const { peerId, sessionDescription } = data

        const connectedClient = getClientById(peerId)
        if (!connectedClient) return

        const { peer } = connectedClient
        const sdp = new RTCSessionDescription(sessionDescription)
        console.log("get", sdp.type)
        await peer.setRemoteDescription(sdp)

        if (sdp.type === "offer") {
          const answer = await peer.createAnswer()
          await peer.setLocalDescription(answer)

          socketClient.emit(SocketActions.RELAY_SDP, {
            peerId,
            sessionDescription: answer,
          })
        }
      }
    )

    socketClient.on(
      SocketActions.REMOVE_PEER,
      (data: RemoteClientLeaveRespounce) => {
        const { peerId } = data
        const client = connectedClients.current[peerId]
        client?.peer.close()
        client?.video?.getTracks().forEach((track) => track.stop())
        delete connectedClients.current[peerId]
        updateClients({ ...connectedClients.current })
      }
    )

    socketClient.on(
      SocketActions.ICE_CANDIDATE,
      (data: AddIceCandidateRespounce) => {
        const { peerId, iceCandidate } = data
        const connectedClient = getClientById(peerId)
        connectedClient?.peer.addIceCandidate(new RTCIceCandidate(iceCandidate))
      }
    )

    return () => {
      socketClient.emit(SocketActions.LEAVE)
      localStream.current?.getTracks().forEach((track) => track.stop())

      socketClient.off(SocketActions.ADD_PEER)
      socketClient.off(SocketActions.SESSION_DESCRIPTION)
      socketClient.off(SocketActions.REMOVE_PEER)
      socketClient.off(SocketActions.ICE_CANDIDATE)
    }
  }, [id])

  const startLocalStreamCapture = useCallback(async () => {
    const LocalStream = await navigator.mediaDevices?.getUserMedia({
      video: {
        width: 1920,
        height: 1024,
      },
      audio: false,
    })

    Object.values(connectedClients.current).forEach((client) => {
      LocalStream.getTracks().forEach((track) => {
        console.log("track send", client.id)
        client?.peer.addTrack(track, LocalStream)
      })
    })
    localStream.current = LocalStream

    setLocalStream(LocalStream)
  }, [])

  const clients = Object.entries(connectedClients.current)

  return (
    <PageWrapper>
      <SpeedDial
        ariaLabel="user action"
        sx={{ position: "absolute", bottom: 16, right: 16 }}
        icon={<SpeedDialIcon />}
      >
        <SpeedDialAction
          onClick={startLocalStreamCapture}
          icon={<VideocamIcon />}
          tooltipTitle={"Turn on camera"}
        />
        <SpeedDialAction
          onClick={() => {
            updateClients({ ...connectedClients.current })
          }}
          icon={<VideocamIcon />}
          tooltipTitle={"Rerender"}
        />
      </SpeedDial>

      <StreamViewer>
        <div>
          <div className={styles.username}>{"local"}</div>
          <video
            className={styles.video}
            ref={(node) => {
              if (node) node.srcObject = localStream.current
            }}
            autoPlay
          />
        </div>

        {clients.map(([id, client]) => (
          <div className={styles.stream} key={id}>
            <div className={styles.username}>{id}</div>
            {client.loading && <div className={styles.loading}></div>}
            <video
              className={styles.video}
              ref={(node) => {
                if (node) node.srcObject = client.video ?? null
              }}
              autoPlay
            />
          </div>
        ))}
      </StreamViewer>
    </PageWrapper>
  )
}
