/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Injectable } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import TLDRAW_PERSISTENCE_INTERVAL from '@libs/tldraw-sync/constants/persistenceInterval';
import RoomState from '@libs/tldraw-sync/types/tdlraw-sync-rooms';
import { UnknownRecord } from 'tldraw';
import { TldrawSyncRoom, TldrawSyncRoomDocument } from './tldraw-sync-room.schema';

@Injectable()
export default class TldrawSyncService {
  private readonly roomsMap = new Map<string, RoomState>();

  private readonly roomLocks = new Map<string, Promise<void>>();

  constructor(
    @InjectModel(TldrawSyncRoom.name)
    private readonly roomModel: Model<TldrawSyncRoomDocument>,
  ) {}

  @Interval(TLDRAW_PERSISTENCE_INTERVAL)
  handleRoomPersistence(): void {
    this.roomsMap.forEach((state, roomId) => {
      if (state.needsPersist) {
        const newState = { ...state, needsPersist: false };
        this.roomsMap.set(roomId, newState);
        void this.saveToMongo(roomId, state.room.getCurrentSnapshot());
      }
      if (state.room.isClosed()) {
        void this.removeRoom(roomId);
      }
    });
  }

  private async withGlobalRoomLock<T>(roomId: string, criticalSection: () => Promise<T>): Promise<T> {
    while (this.roomLocks.has(roomId)) {
      // eslint-disable-next-line no-await-in-loop
      await this.roomLocks.get(roomId);
    }

    let resolveLock: () => void;
    const lockPromise = new Promise<void>((resolve) => {
      resolveLock = resolve;
    });
    this.roomLocks.set(roomId, lockPromise);

    try {
      return await criticalSection();
    } finally {
      resolveLock!();
      this.roomLocks.delete(roomId);
    }
  }

  async makeOrLoadRoom(roomId: string): Promise<TLSocketRoom<UnknownRecord, void>> {
    const existing = this.roomsMap.get(roomId);

    if (existing && !existing.room.isClosed()) {
      return existing.room;
    }

    return this.withGlobalRoomLock(roomId, async () => {
      const existingAfterLock = this.roomsMap.get(roomId);
      if (existingAfterLock && !existingAfterLock.room.isClosed()) {
        return existingAfterLock.room;
      }

      const roomDoc = await this.roomModel.findOne({ roomId }).lean();
      const room = this.createRoom(roomId, roomDoc?.roomData || null);

      this.roomsMap.set(roomId, {
        roomId,
        room,
        needsPersist: false,
      });

      return room;
    });
  }

  private createRoom(roomId: string, snapshot: RoomSnapshot | null): TLSocketRoom<UnknownRecord, void> {
    return new TLSocketRoom<UnknownRecord, void>({
      initialSnapshot: snapshot || undefined,
      onSessionRemoved: (room, { numSessionsRemaining }) => {
        if (numSessionsRemaining === 0) {
          room.close();
        }
      },
      onDataChange: () => {
        const state = this.roomsMap.get(roomId);
        if (state) {
          state.needsPersist = true;
        }
      },
    });
  }

  private async saveToMongo(roomId: string, snapshot: RoomSnapshot) {
    await this.roomModel.findOneAndUpdate({ roomId }, { roomId, roomData: snapshot }, { upsert: true });
  }

  removeRoom(roomId: string) {
    this.roomsMap.delete(roomId);
  }
}
