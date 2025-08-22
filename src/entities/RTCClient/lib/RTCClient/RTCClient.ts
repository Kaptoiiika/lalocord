import { socketClient } from 'src/shared/api/socket/socket';
import { logger } from 'src/shared/lib/logger/Logger';
import Emitter from 'src/shared/lib/utils/Emitter/Emitter';

import type { UserModel } from 'src/entities/User';

import { RTCChanelMedia } from './RTCChanelMedia/RTCChanelMedia';
import { RTCChatDataChanel } from './RTCChatDataChanel';
import { RTCDataChanel } from './RTCDataChanel';
import { RTCMedia } from './RTCMedia';
import { useRoomRTCStore } from '../../model/store/RoomRTCStore';


export type Answer = { answer: RTCSessionDescription };
export type Offer = { offer: RTCSessionDescription };
export type Ice = { ice: RTCIceCandidateInit };
export type ClientId = { id: string };

type MessageType =
  | 'offer'
  | 'ice'
  | 'answer'
  | 'request_new_offer'
  | 'text'
  | 'file'
  | 'requset_stream_type'
  | 'receive_stream_type'
  | 'stopStream'
  | 'resumeStream'
  | 'pauseStream'
  | 'clientPressKey'
  | 'clientMouseChange'
  | 'gameMessage';

type RTCClientEvents = {
  iceconnectionStatusChange: RTCIceConnectionState;
  gameMessage: unknown;
};

interface RTCRtpCodec {
  channels?: number;
  clockRate: number;
  mimeType: string;
  sdpFmtpLine?: string;
}

export class RTCClient extends Emitter<RTCClientEvents> {
  id: string;
  user: UserModel;

  peer: RTCPeerConnection | null;
  channel: RTCDataChanel<MessageType>;
  dataChannel: RTCChatDataChanel;
  mediaChannel: RTCChanelMedia;
  media: RTCMedia;

  private offerCreater: boolean;

  static preferCodec(codecs: RTCRtpCodec[] = [], mimeType: string) {
    const otherCodecs: RTCRtpCodec[] = [];
    const sortedCodecs: RTCRtpCodec[] = [];

    codecs.forEach((codec) => {
      if (codec.mimeType === mimeType) {
        sortedCodecs.push(codec);
      } else {
        otherCodecs.push(codec);
      }
    });

    return sortedCodecs.concat(otherCodecs);
  }

  constructor(user: UserModel, sendOffer?: boolean) {
    super();
    if (!RTCPeerConnection) throw new Error('Your browser does not support WEBRTC');

    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: 'stun:api.kapitoxa.lol:5349',
        },
        {
          urls: 'stun:api.kapitoxa.lol:3478',
        },
        {
          urls: ['turn:api.kapitoxa.lol:5349', 'turn:api.kapitoxa.lol:3478'],
          username: 'lalocord',
          credential: 'lalopas',
        },
      ],
    });
    this.id = user.id;
    this.user = user;
    this.channel = new RTCDataChanel(this.peer);
    this.dataChannel = new RTCChatDataChanel(this.peer, 'chat');
    this.mediaChannel = new RTCChanelMedia(this.peer, 'media');
    this.media = new RTCMedia(this.peer);
    this.media.on('needUpdateStreamType', () => {
      this.channel.sendData('requset_stream_type');
    });
    this.media.on('stopStream', (type: string) => {
      this.channel.sendData('stopStream', type);
    });
    this.media.on('sendStream', () => {
      const streamtype = this.media.getStreamType();

      this.channel.sendData('receive_stream_type', streamtype);
    });
    useRoomRTCStore.getState().addConnectedUsers(this);

    this.peer.ondatachannel = (event) => {
      const remoteChannel = event.channel;

      if (event.channel.label !== 'text') {
        return;
      }
      remoteChannel.onmessage = this.initDataChanel.bind(this);
    };
    this.peer.onicecandidate = (event) => {
      if (event.candidate) {
        const resp = {
          id: this.id,
          ice: event.candidate,
        };

        socketClient.emit('new_ice', resp);
      }
    };

    this.offerCreater = !!sendOffer;
    this.peer.onnegotiationneeded = () => {
      if (!this.offerCreater) this.createOffer();
      else this.requestNewOffer();
    };

    this.peer.oniceconnectionstatechange = () => {
      if (this.peer) this.emit('iceconnectionStatusChange', this.peer.iceConnectionState);
      switch (this.peer?.iceConnectionState) {
        case 'completed':
        case 'connected':
          break;
        case 'checking':
        case 'new':
          break;
        case 'disconnected':
        case 'failed':
          break;
        case 'closed':
        default:
          break;
      }
    };

    this.peer.onconnectionstatechange = () => {
      switch (this.peer?.connectionState) {
        case 'closed':
          this.close();
          break;
        case 'disconnected':
        case 'failed':
          break;
        case 'new':
        case 'connected':
        default:
          break;
      }
    };
    logger('New RTCClient', this);
  }

  reconnect() {
    console.log('reconnect');
  }

  private requestNewOffer() {
    if (!this.channel.channelIsOpen) return;
    if (this.offerCreater) {
      this.createOffer();
    } else {
      this.channel.sendData('request_new_offer');
    }
    this.offerCreater = !this.offerCreater;
  }

  changeCodecs() {
    if (!this.peer) return;
    const transceivers = this.peer.getTransceivers();

    transceivers.forEach((transceiver) => {
      const kind = transceiver.sender.track?.kind;

      if (!kind) return;
      const sendCodecs = RTCRtpSender.getCapabilities(kind)?.codecs;
      const recvCodecs = RTCRtpReceiver.getCapabilities(kind)?.codecs;

      if (kind === 'video') {
        const newsendCodecs = RTCClient.preferCodec(sendCodecs, 'video/H264');
        const newrecvCodecs = RTCClient.preferCodec(recvCodecs, 'video/H264');

        transceiver.setCodecPreferences([...newsendCodecs, ...newrecvCodecs]);
        logger('change codecs to', [...newsendCodecs, ...newrecvCodecs]);
      }
    });
  }

  private changeSDP(sdp?: string) {
    const changedSDP = sdp
      ?.split('a=')
      // .filter(
      //   (option) =>
      //     // if (option.includes("transport-cc")) return false
      //     // if (option.includes("goog-remb")) return false
      //     // if (option.includes("nack")) return false
      //     // if (option.includes("nack pli")) return false
      //     // if (option.includes("ccm fir")) return false
      //     true
      // )
      .join('a=');

    return changedSDP;
  }

  async createAnswer(offer: RTCSessionDescription) {
    if (!this.peer) return;
    await this.peer.setRemoteDescription(offer);
    const answer = await this.peer.createAnswer();
    const changedSDP = this.changeSDP(answer.sdp);
    const changedAnswer: RTCLocalSessionDescriptionInit = {
      sdp: changedSDP,
      type: answer.type,
    };

    await this.peer.setLocalDescription(changedAnswer);
    const resp = {
      id: this.id,
      answer: changedAnswer,
    };

    logger('createAnswer', changedAnswer);
    if (this.channel.channelIsOpen) this.channel.sendData('answer', changedAnswer);
    else socketClient.emit('new_answer', resp);
  }

  async createOffer() {
    if (!this.peer) return;
    this.changeCodecs();
    const offer = await this.peer.createOffer();
    const changedSDP = this.changeSDP(offer.sdp);
    const changedOffer: RTCLocalSessionDescriptionInit = {
      sdp: changedSDP,
      type: offer.type,
    };

    await this.peer.setLocalDescription(changedOffer);
    const data = {
      id: this.id,
      offer: changedOffer,
    };

    logger('createdoffer', changedOffer);
    if (this.channel.channelIsOpen) this.channel.sendData('offer', changedOffer);
    else socketClient.emit('new_offer', data);
  }

  async saveAnswer(answer: RTCSessionDescription) {
    await this.peer?.setRemoteDescription(answer);
    this.media.updateBitrate('media');
    this.media.updateBitrate('webCam');
  }

  saveIce(ice: RTCIceCandidateInit) {
    this.peer?.addIceCandidate(ice);
  }

  async close() {
    if (!this.peer) return console.warn('Connection already close');
    this.channel.close();
    this.media.close();
    await this.peer.setLocalDescription();
    this.peer.close();
    this.peer = null;
    logger('peer closed');
  }

  private initDataChanel(e: MessageEvent) {
    if (e.data instanceof ArrayBuffer) return console.log(e.data);
    try {
      const msg: {
        type: MessageType;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: any;
      } = JSON.parse(e.data);

      logger('reciveData', msg);

      if (!msg.type) return;
      const { data, type } = msg;

      switch (type) {
        case 'request_new_offer':
          this.requestNewOffer();
          break;
        case 'answer':
          this.saveAnswer(data);
          break;
        case 'offer':
          this.createAnswer(data);
          break;
        case 'ice':
          this.saveIce(data);
          break;
        case 'requset_stream_type':
          this.channel.sendData('receive_stream_type', this.media.getStreamType());
          break;
        case 'receive_stream_type':
          this.media.updateStreamType(data);
          break;
        case 'resumeStream':
          this.media.reqestResumeStream(data);
          break;
        case 'pauseStream':
          this.media.reqestPauseStream(data);
          break;
        case 'stopStream':
          this.media.remoteClosedStream(data);
          break;
        case 'clientPressKey':
          this.media.clientPressKey(data);
          break;
        case 'gameMessage':
          this.emit('gameMessage', data);
          break;
        default:
          logger(msg);
          break;
      }
    } catch (error) {
      console.error(error);
    }
  }
}
