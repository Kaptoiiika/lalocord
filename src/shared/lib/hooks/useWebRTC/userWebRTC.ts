import { SocketActions } from "@/shared/api/socket/actions"
import { socketClient } from "@/shared/api/socket/socket"
import { useCallback, useEffect, useRef, useState } from "react"

type Client = {
  id: string
}

export const useWebRTC = (RoomId: string) => {
  const [clients, updateClients] = useState<Client[]>([])

  const addNewClient = (newClient: Client) => {
    updateClients((list) => {
      const client = list.find((clinet) => clinet.id === newClient.id)
      if (client) return list
      else return [...list, newClient]
    })
  }

  const peerConnections = useRef<Record<string, RTCPeerConnection | undefined>>(
    {}
  )
  const LocalMediaStream = useRef<MediaStream | null>(null)
  const peerMediaElements = useRef<Record<string, MediaStream | null>>({})

  //hundleNewPeer
  useEffect(() => {
    async function hundleNewPeer({
      peerId,
      createOffer,
    }: {
      peerId: string
      createOffer: boolean
    }) {
      if (peerId in peerConnections.current)
        return console.warn(`Already connected to peer ${peerId}`)

      const newPeer = new RTCPeerConnection({
        iceServers: [
          { urls: "stun:stun1.l.google.com:19302" },
          {
            urls: "turn:numb.viagenie.ca",
            credential: "muazkh",
            username: "webrtc@live.com",
          },
        ],
      })
      newPeer.onicecandidate = (event) => {
        if (event.candidate) {
          socketClient.emit(SocketActions.RELAY_ICE, {
            peerId,
            iceCandidate: event.candidate,
          })
        }
      }
      
      if (createOffer) {
        const offer = await newPeer.createOffer()
        await newPeer.setLocalDescription(offer)

        socketClient.emit(SocketActions.RELAY_SDP, {
          peerId,
          sessionDescription: offer,
        })
      }
      peerConnections.current[peerId] = newPeer
    }

    socketClient.on(SocketActions.ADD_PEER, hundleNewPeer)
    return () => {
      socketClient.off(SocketActions.ADD_PEER, hundleNewPeer)
    }
  }, [])

  //addIceCandidateToPeer
  useEffect(() => {
    const addIceCandidateToPeer = ({
      peerId,
      iceCandidate,
    }: {
      peerId: string
      iceCandidate: RTCIceCandidate
    }) => {
      const peer = peerConnections.current[peerId]
      peer?.addIceCandidate(new RTCIceCandidate(iceCandidate))
    }
    socketClient.on(SocketActions.ICE_CANDIDATE, addIceCandidateToPeer)

    return () => {
      socketClient.off(SocketActions.ICE_CANDIDATE, addIceCandidateToPeer)
    }
  }, [])

  //setRemoteMedia
  useEffect(() => {
    async function setRemoteMedia({
      peerId,
      sessionDescription,
    }: {
      peerId: string
      sessionDescription: RTCSessionDescriptionInit
    }) {
      const peer = peerConnections.current[peerId]
      if (!peer) return

      const sdp = new RTCSessionDescription(sessionDescription)
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

    socketClient.on(SocketActions.SESSION_DESCRIPTION, setRemoteMedia)

    return () => {
      socketClient.off(SocketActions.SESSION_DESCRIPTION, setRemoteMedia)
    }
  }, [])

  //LEAVE/JOIN
  useEffect(() => {
    // startLocalStreamCapture().then(() => {
    //   socketClient.emit(SocketActions.JOIN, { room: RoomId })
    // })
    socketClient.emit(SocketActions.JOIN, { room: RoomId })

    const peers = peerConnections.current
    const localPeer = LocalMediaStream.current
    return () => {
      localPeer?.getTracks().forEach((track) => track.stop())
      Object.entries(peers).forEach(([, peer]) => {
        peer?.close()
      })
      socketClient.emit(SocketActions.LEAVE)
    }
  }, [RoomId])

  //REMOVE_PEER
  useEffect(() => {
    const deletePeer = ({ peerId }: { peerId: string }) => {
      console.log("peer leave", peerId)

      peerConnections.current[peerId]?.close()
      delete peerConnections.current[peerId]
      delete peerMediaElements.current[peerId]
      updateClients((list) => list.filter((client) => client.id !== peerId))
    }

    socketClient.on(SocketActions.REMOVE_PEER, deletePeer)
    return () => {
      socketClient.off(SocketActions.REMOVE_PEER, deletePeer)
    }
  }, [])

  const provideMediaRef = useCallback((id: string, node: HTMLVideoElement) => {
    const mediaElement =
      id === "local" ? LocalMediaStream.current : peerMediaElements.current[id]

    node.srcObject = mediaElement
  }, [])

  const startLocalStreamCapture = useCallback(async () => {
    const LocalStream = await navigator.mediaDevices?.getUserMedia({
      video: {
        width: 1920,
        height: 1024,
      },
      audio: false,
    })
    addNewClient({
      id: "local",
    })

    Object.values(peerConnections.current).forEach((peer) => {
      LocalStream.getTracks().forEach((track) => {
        const a = peer?.addTrack(track, LocalStream)
        console.log(a)
      })
    })

    LocalMediaStream.current = LocalStream
  }, [])

  const peerList = Object.keys(peerConnections.current)
  console.log(peerList)

  return { clients, peerList, provideMediaRef, startLocalStreamCapture }
}
