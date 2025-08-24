import { memo, useEffect, useState } from 'react';




import { useAudioEffectStore } from 'src/entities/AudioEffect';
import {
  useRoomRTCStore,
} from 'src/entities/RTCClient';
import { getLocalUser, useLocalUserStore } from 'src/entities/User';
import { classNames } from 'src/shared/lib/classNames/classNames';
import { useThrottle } from 'src/shared/lib/hooks/useThrottle/useThrottle';
import { startViewTransition } from 'src/shared/lib/utils/ViewTransition/ViewTransition';
import { StreamViewer } from 'src/widgets/StreamViewer/ui/StreamViewer';

import type { RTCClient,
  RTCClientMediaStream } from 'src/entities/RTCClient';

import { RoomStream } from './RoomStream/RoomStream';
import {
  getDisplayMediaStream,
  getRoomUsers,
  getWebCamStream,
} from '../../../../entities/RTCClient/model/selectors/RoomRTCSelectors';

import styles from './RoomStreams.module.scss';

type UserWithStream = {
  client: RTCClient;
  clientStream: RTCClientMediaStream;
};

export const RoomStreams = memo(function RoomStreams() {
  const users = useRoomRTCStore(getRoomUsers);
  const localUser = useLocalUserStore(getLocalUser);
  const mediaStream = useRoomRTCStore(getDisplayMediaStream);
  const webCamStream = useRoomRTCStore(getWebCamStream);
  const streamVolumeList = useAudioEffectStore(
    (state) => state.usersAuidoSettings
  );
  const changeVolumeHandle = useAudioEffectStore(
    (state) => state.changeUserVolume
  );
  const [hiddenStream, setHiddenStream] = useState<Set<string>>(new Set());
  const [, update] = useState(0);

  const changeUserStreamVolume = useThrottle(
    (user: UserWithStream, volume: number) => {
      user.clientStream.volume = volume;
      changeVolumeHandle(
        user.client.user.username,
        user.clientStream.type,
        volume
      );
    },
    500
  );

  useEffect(() => {
    const listeners = Object.values(users).map((user) => {
      const fn = async () => {
        await startViewTransition();
        update((prev) => prev + 1);
      };

      user.media.on('newstream', fn);

      return {
        user,
        fn,
      };
    });

    return () => {
      listeners.forEach(({ user, fn }) => {
        user.media.off('newstream', fn);
      });
    };
  }, [users]);

  // useEffect(() => {
  //   console.log("mediaStream")
  //   if (!mediaStream) return
  //   setHiddenStream((prev) => {
  //     prev.add(mediaStream.id)
  //     return new Set(prev)
  //   })

  //   return () => {
  //     setHiddenStream((prev) => {
  //       prev.delete(mediaStream.id)
  //       return new Set(prev)
  //     })
  //   }
  // }, [mediaStream])

  const streams = Object.values(users).reduce<UserWithStream[]>(
    (prev, curent) => {
      curent.media.availableStreamList.forEach((stream) => {
        prev.push({
          client: curent,
          clientStream: stream,
        });
      });

      return prev;
    },
    []
  );

  const localStreams = [];

  if (mediaStream)
    localStreams.push({
      stream: mediaStream,
      name: localUser.username,
      autoplay: false,
    });
  if (webCamStream)
    localStreams.push({
      stream: webCamStream,
      name: localUser.username,
      autoplay: true,
    });

  const someStreamIsHide = hiddenStream.size;
  const hiddenStreamIds = [...hiddenStream];

  return (
    <StreamViewer
      className={classNames(styles.RoomStreams, {
        [styles.RoomStreamsWithHiddenStream]: !!someStreamIsHide,
      })}
    >
      {localStreams.map(({ stream, name, autoplay }) => (
        <RoomStream
          key={stream.id}
          stream={stream}
          title={name}
          autoplay={autoplay}
          mute
          volume={0}
          hide={hiddenStream.has(stream.id)}
          hideId={hiddenStreamIds.findIndex((id) => id === stream.id)}
          onHide={() => {
            hiddenStream.add(stream.id);
            setHiddenStream(new Set(hiddenStream));
          }}
          onUnHide={() => {
            hiddenStream.delete(stream.id);
            setHiddenStream(new Set(hiddenStream));
          }}
        />
      ))}

      {streams.map((user) => (
        <RoomStream
          key={user.clientStream.stream.id}
          stream={user.clientStream.stream}
          title={user.client?.user?.username ?? user.client?.user?.id}
          hide={hiddenStream.has(user.clientStream.stream.id)}
          hideId={hiddenStreamIds.findIndex(
            (id) => id === user.clientStream.stream.id
          )}
          onHide={() => {
            hiddenStream.add(user.clientStream.stream.id);
            setHiddenStream(new Set(hiddenStream));
          }}
          onUnHide={() => {
            hiddenStream.delete(user.clientStream.stream.id);
            setHiddenStream(new Set(hiddenStream));
          }}
          onPlay={() => {
            user.client.channel.sendData('resumeStream', user.clientStream.type);
          }}
          onPause={() => {
            user.client.channel.sendData('pauseStream', user.clientStream.type);
          }}
          onVolumeChange={(value) => {
            changeUserStreamVolume(user, value);
          }}
          volume={
            streamVolumeList[user.client.user.username]?.[
              user.clientStream.type
            ] ?? user.clientStream.volume
          }
          autoplay
        />
      ))}
    </StreamViewer>
  );
});
