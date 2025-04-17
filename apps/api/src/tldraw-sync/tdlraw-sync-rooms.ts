import { TLSocketRoom } from '@tldraw/sync-core';

interface RoomState {
  roomId: string;
  room: TLSocketRoom<any, void>;
  isEphemeral: boolean;
  needsPersist: boolean;
}

export const roomsMap = new Map<string, RoomState>();
