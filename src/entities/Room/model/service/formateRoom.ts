import type { RoomModel } from '../types/RoomSchema';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const FormateAtributedRoom = (room: any): RoomModel => ({
    ...room.attributes,
    id: room.id,
    name: room.attributes.name,
  });
