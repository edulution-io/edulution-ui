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

import { Inject, Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { DEFAULT_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import TLDRAW_PERSISTENCE_INTERVAL from '@libs/tldraw-sync/constants/persistenceInterval';
import TLDRAW_CACHE_KEY from '@libs/tldraw-sync/constants/cacheKey';
import RoomState from '@libs/tldraw-sync/types/tdlraw-sync-rooms';
import { UnknownRecord } from 'tldraw';
import { TldrawSyncRoom, TldrawSyncRoomDocument } from './tldraw-sync-room.schema';

const roomsMap = new Map<string, RoomState>();

@Injectable()
export default class TldrawSyncService implements OnModuleInit, OnModuleDestroy {
  private persistInterval: NodeJS.Timeout | null = null;

  constructor(
    @InjectModel(TldrawSyncRoom.name)
    private readonly roomModel: Model<TldrawSyncRoomDocument>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  onModuleInit() {
    this.persistInterval = setInterval(() => {
      roomsMap.forEach((state, roomId) => {
        if (state.needsPersist) {
          const newState = { ...state, needsPersist: false };
          roomsMap.set(roomId, newState);
          void this.persistRoom(roomId, state.room.getCurrentSnapshot());
        }
        if (state.room.isClosed()) {
          void this.removeRoom(roomId);
        }
      });
    }, TLDRAW_PERSISTENCE_INTERVAL);
  }

  onModuleDestroy() {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
  }

  async makeOrLoadRoom(roomId: string): Promise<TLSocketRoom<UnknownRecord, void>> {
    const existing = roomsMap.get(roomId);

    if (existing && !existing.room.isClosed()) {
      return existing.room;
    }

    let snapshot: RoomSnapshot | null = await this.loadFromRedis(roomId);

    if (!snapshot) {
      const roomDoc = await this.roomModel.findOne({ roomId }).lean();

      if (roomDoc) {
        snapshot = roomDoc.roomData;
      }
    }

    const room = this.createRoom(roomId, snapshot);

    roomsMap.set(roomId, { roomId, room, needsPersist: false });

    return room;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  private createRoom(roomId: string, snapshot: RoomSnapshot | null): TLSocketRoom<UnknownRecord, void> {
    return new TLSocketRoom<UnknownRecord, void>({
      initialSnapshot: snapshot || undefined,
      onSessionRemoved: (room, { numSessionsRemaining }) => {
        if (numSessionsRemaining === 0) {
          room.close();
        }
      },
      onDataChange: () => {
        const state = roomsMap.get(roomId);
        if (state) {
          state.needsPersist = true;
        }
      },
    });
  }

  private async loadFromRedis(roomId: string): Promise<RoomSnapshot | null> {
    const snapshot = await this.cacheManager.get<RoomSnapshot>(`${TLDRAW_CACHE_KEY}:${roomId}`);
    return snapshot || null;
  }

  private async saveToRedis(roomId: string, snapshot: RoomSnapshot) {
    await this.cacheManager.set(`${TLDRAW_CACHE_KEY}:${roomId}`, snapshot, DEFAULT_CACHE_TTL_MS);
  }

  private async saveToMongo(roomId: string, snapshot: RoomSnapshot) {
    await this.roomModel.findOneAndUpdate({ roomId }, { roomId, roomData: snapshot }, { upsert: true });
  }

  async persistRoom(roomId: string, snapshot: RoomSnapshot) {
    await this.saveToRedis(roomId, snapshot);
    await this.saveToMongo(roomId, snapshot);
  }

  async removeRoom(roomId: string) {
    await this.cacheManager.del(`${TLDRAW_CACHE_KEY}:${roomId}`);
    roomsMap.delete(roomId);
  }
}
