import { logger } from 'src/shared/lib/logger/Logger';
import { Emitter } from 'src/shared/lib/utils';

import type { IRTCChatDataChanel, RTCChatDataChanelEvents } from './types/RTCChatDataChanel';

import { MessageCodec } from '../Codec/MessageCodec';


type FileHeader = {
  id: Uint8Array;
  length: number;
  type?: string;
  name?: string;
};
type ChunkFileHeader = Omit<FileHeader, 'id'> & { chunkSize: number };

const maxTransmitionChunkSize = 1024 * 64 - 1;

export class RTCChatDataChanel
  extends Emitter<RTCChatDataChanelEvents>
  implements IRTCChatDataChanel {
  private readonly codec: MessageCodec;
  readonly channel: RTCDataChannel;
  private _isOpen = false;
  get isOpen() {
    return this._isOpen;
  }

  private tempData = new Map<string, Uint8Array>();

  constructor(
    private readonly peer: RTCPeerConnection,
    label = 'chat'
  ) {
    super();

    this.channel = this.peer.createDataChannel(label);
    this.channel.binaryType = 'arraybuffer';
    this.channel.bufferedAmountLowThreshold = maxTransmitionChunkSize;
    this.channel.onopen = () => {
      this._isOpen = true;
      if (this.peer.sctp?.maxMessageSize) {
        this.channel.bufferedAmountLowThreshold = this.peer.sctp.maxMessageSize;
        this.codec.changeChunkSize(this.peer.sctp.maxMessageSize);
      }
    };
    this.channel.onclose = () => {
      this._isOpen = false;
    };
    this.codec = new MessageCodec({
      headerName: 'lalohead',
      maxChunkSize: this.channel.bufferedAmountLowThreshold,
    });

    const datachannelfunction = (e: RTCDataChannelEvent) => {
      if (e.channel.label === label) {
        const fn = (e: MessageEvent) => {
          this.onNewMessage(e.data);
        };

        e.channel.onmessage = fn.bind(this);
        this.peer.removeEventListener('datachannel', datachannelfunction);
      }
    };

    this.peer.addEventListener('datachannel', datachannelfunction);
  }

  private async send(data: string | ArrayBuffer, params: FileHeader, startWith = 0) {
    if (typeof data === 'string') {
      logger('send string message', data);
      this.channel.send(data);
    }
    if (typeof data === 'object') {
      const dataid = params.id;
      let chunknumber = startWith;

      while (params.length > chunknumber * this.codec.chunkSize && this.isOpen) {
        if (this.channel.bufferedAmount > this.channel.bufferedAmountLowThreshold) {
          this.channel.onbufferedamountlow = () => {
            this.channel.onbufferedamountlow = null;
            this.send(data, params, chunknumber);
          };

          return;
        }
        const ChunkParams: ChunkFileHeader = {
          length: params.length,
          type: params.type,
          name: params.name,
          chunkSize: this.codec.chunkSize,
        };
        const chunk = this.codec.createChunk(data, dataid, chunknumber, ChunkParams);

        logger(
          `Send chunk ${dataid}, №${chunknumber}, with chunk.byteLength ${chunk.byteLength} of total length ${params.length}`,
          chunk
        );
        chunknumber++;
        this.emit('transmission', {
          id: dataid.join(''),
          type: 'transmission',
          transmission: {
            length: params.length,
            loaded: chunknumber * this.codec.chunkSize,
          },
          isSystemMessage: true,
        });
        this.channel.send(chunk);
      }
    }
  }

  onNewMessage(data: string | ArrayBuffer) {
    if (typeof data === 'string') {
      this.emit('newMessage', {
        id: crypto.randomUUID(),
        type: 'text',
        message: data,
      });

      return;
    }

    if (typeof data === 'object') {
      const chunk = this.codec.parseChunk(data);

      if (chunk) {
        logger(`recived chunkId ${chunk.chunkid} for data ${chunk.dataid}`, chunk);

        const stringId = chunk.dataid.join('');
        const temp = this.tempData.get(stringId);
        const dataLength = Number(chunk.params.length);
        const chunkType = String(chunk.params?.type);
        const chunkSize = Number(chunk.params?.chunkSize ?? this.codec.chunkSize);
        const fileName = String(chunk.params?.name);
        const params = {
          length: dataLength,
          loaded: this.codec.chunkSize * chunk.chunkid,
          type: chunkType,
          name: fileName,
        };

        this.emit('transmission', {
          id: stringId,
          type: 'fileParams',
          blobParams: params,
        });

        if (temp) {
          temp.set(new Uint8Array(chunk.data), chunkSize * chunk.chunkid);
          logger(`recived chunk data №${chunk.chunkid} size ${chunk.data.byteLength}`);
        } else {
          const head = new Uint8Array(dataLength);

          head.set(new Uint8Array(chunk.data), chunkSize * chunk.chunkid);
          logger(`recived head data №${chunk.chunkid} size ${chunk.data.byteLength}`);
          this.tempData.set(stringId, head);
        }
        if (chunkSize * (chunk.chunkid + 1) >= dataLength) {
          const blobPart: BlobPart = temp ? Buffer.from(temp) : chunk.data;

          const file = new Blob([blobPart], {
            type: chunkType,
          });

          logger('recived all data for create blob', file);
          this.emit('newMessage', {
            id: stringId,
            type: 'file',
            blob: file,
            blobParams: {
              ...params,
              length: 0,
              loaded: 0,
            },
          });
          this.tempData.delete(stringId);
        }

        return;
      }
    }
  }

  async sendBlob(blob: Blob | ArrayBuffer, name?: string) {
    const id = this.codec.createNewId();
    const splitedName = name?.slice(-16);

    if (blob instanceof Blob) {
      const data = await blob.arrayBuffer();
      const headerData: FileHeader = {
        id,
        type: blob.type,
        length: data.byteLength,
        name: splitedName,
      };

      logger(`prepare data ${headerData.id} for send rawdatalength:${data.byteLength}`);

      return this.send(data, headerData);
    }

    logger(`prepare data ${id} for send rawdatalength:${blob.byteLength}`);

    return this.send(blob, {
      length: blob.byteLength,
      id,
      name: splitedName,
    });
  }

  async sendMessage(message: string) {
    this.send(message, {
      length: message.length,
      id: this.codec.createNewId(),
    });
  }

  close() {
    this.channel.close();
    this.tempData = new Map();
  }
}
