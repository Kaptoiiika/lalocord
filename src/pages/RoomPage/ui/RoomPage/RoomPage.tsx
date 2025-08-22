import { useEffect } from 'react';
import { useParams } from 'react-router-dom';


import { useRoomRTCStore } from 'src/entities/RTCClient';
import { useUserStore } from 'src/entities/User';
import { socketClient } from 'src/shared/api/socket/socket';
import { PageWrapper } from 'src/widgets/Page';

import { RoomLobby } from '../RoomLobby/RoomLobby';

const emitToJoinRoom = (id: string) => {
  const localUser = useUserStore.getState().localUser;

  socketClient.emit('join', {
    name: id,
    username: localUser.username,
    avatarSrc: localUser.avatarSrc,
  });

  return () => {
    useRoomRTCStore.getState().leaveRoom();
    socketClient.emit('leave', {
      name: id,
    });
  };
};

export const RoomPage = () => {
  const { id = '' } = useParams();
  const joinToRoom = useRoomRTCStore((state) => state.joinRoom);
  const leaveRoom = useRoomRTCStore((state) => state.leaveRoom);

  useEffect(() => {
    joinToRoom(id);
    const fn = emitToJoinRoom(id);
    const prevName = document.title;

    document.title = `${document.title} - ${id}`;

    return () => {
      document.title = prevName;
      leaveRoom();
      socketClient.off('room_is_full');
      fn();
    };
  }, [id, joinToRoom, leaveRoom]);

  useEffect(() => {
    let isConnected = socketClient.active;

    const handleConnect = () => {
      if (isConnected === false) {
        const localUser = useUserStore.getState().localUser;

        socketClient.emit('join', {
          name: id,
          username: localUser.username,
          avatarSrc: localUser.avatarSrc,
          reconnect: true,
        });
      }
      isConnected = true;
    };

    const handleDisconnect = () => {
      isConnected = false;
    };

    socketClient.on('connect', handleConnect);
    socketClient.on('disconnect', handleDisconnect);

    return () => {
      socketClient.off('connect', handleConnect);
      socketClient.off('disconnect', handleDisconnect);
    };
  }, [id]);

  return (
    <PageWrapper>
      <RoomLobby />
    </PageWrapper>
  );
};
