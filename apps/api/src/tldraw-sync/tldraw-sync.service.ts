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

import { Inject, Injectable, Logger } from '@nestjs/common';
import { Cron, Interval } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import TLDRAW_PERSISTENCE_INTERVAL from '@libs/tldraw-sync/constants/persistenceInterval';
import RoomState from '@libs/tldraw-sync/types/tdlraw-sync-rooms';
import { UnknownRecord } from 'tldraw';
import TLDRAW_MULTI_USER_ROOM_PREFIX from '@libs/whiteboard/constants/tldrawMultiUserRoomPrefix';
import type GroupWithMembers from '@libs/groups/types/groupWithMembers';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import GroupMemberDto from '@libs/groups/types/groupMember.dto';
import ROOM_ID_PARAM from '@libs/tldraw-sync/constants/roomIdParam';
import SseService from '../sse/sse.service';
import { TLDrawSyncLog, TLDrawSyncLogDocument } from './tldraw-sync-log.schema';
import { TldrawSyncRoom, TldrawSyncRoomDocument } from './tldraw-sync-room.schema';

@Injectable()
export default class TLDrawSyncService {
  private readonly roomsMap = new Map<string, RoomState>();

  private readonly roomLocks = new Map<string, Promise<void>>();

  private readonly MAX_LOG_ENTRIES_PER_ROOM = 100;

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectModel(TldrawSyncRoom.name) private readonly roomModel: Model<TldrawSyncRoomDocument>,
    @InjectModel(TLDrawSyncLog.name) private readonly logModel: Model<TLDrawSyncLogDocument>,
    private readonly sseService: SseService,
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

  async logRoomMessage(tldRawLog: TLDrawSyncLog, permittedUsers: GroupMemberDto[]) {
    const entry = await this.logModel.create(tldRawLog);

    this.sseService.sendEventToUsers(
      permittedUsers.map((user) => user.username),
      entry,
      SSE_MESSAGE_TYPE.TLDRAW_SYNC_ROOM_LOG_MESSAGE,
    );
  }

  async getPermittedUsers(roomIdWithPrefix: string): Promise<GroupMemberDto[]> {
    const roomId = roomIdWithPrefix.replace(TLDRAW_MULTI_USER_ROOM_PREFIX, '');

    const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
      `${GROUP_WITH_MEMBERS_CACHE_KEY}-/${roomId}`,
    );

    if (!groupWithMembers) return [];

    const { members } = groupWithMembers;

    return members;
  }

  async getHistory(roomIdWithPrefix: string, page: number, limit: number, username: string) {
    const permittedUsers = await this.getPermittedUsers(roomIdWithPrefix);
    if (!permittedUsers.some((user) => user.username === username)) return undefined;

    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      this.logModel.find({ roomId: roomIdWithPrefix }).sort({ createdAt: -1 }).skip(skip).limit(limit).exec(),
      this.logModel.countDocuments({ roomId: roomIdWithPrefix }).exec(),
    ]);

    return { roomIdWithPrefix, page, limit, total, items };
  }

  @Cron('0 4 * * *')
  async cleanupAllRoomLogs(): Promise<void> {
    Logger.log('Starting scheduled cleanup of TLDraw room logs', TLDrawSyncService.name);

    try {
      const rooms = await this.logModel.distinct(ROOM_ID_PARAM);
      Logger.debug(`Found ${rooms.length} rooms to clean up`, TLDrawSyncService.name);

      const results = await Promise.allSettled(
        rooms.map((roomId) => this.cleanupOldLogEntries(roomId, this.MAX_LOG_ENTRIES_PER_ROOM)),
      );

      const successful = results.filter((r) => r.status === 'fulfilled').length;
      const failed = results.filter((r) => r.status === 'rejected').length;

      Logger.log(
        `Cleanup completed. Successful: ${successful}, Failed: ${failed}, Total: ${rooms.length}`,
        TLDrawSyncService.name,
      );
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      Logger.error(`Failed to cleanup room logs: ${errorMessage}`, TLDrawSyncService.name);
    }
  }

  private async cleanupOldLogEntries(roomId: string, keepCount: number): Promise<void> {
    const entriesToKeep = await this.logModel
      .find({ roomId })
      .sort({ createdAt: -1 })
      .limit(keepCount)
      .select('_id')
      .lean();

    if (entriesToKeep.length < keepCount) {
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    const oldestIdToKeep = entriesToKeep[entriesToKeep.length - 1]._id;

    const result = await this.logModel.deleteMany({
      roomId,
      // eslint-disable-next-line no-underscore-dangle
      _id: { $lt: oldestIdToKeep },
    });

    if (result.deletedCount > 0) {
      Logger.verbose(`Cleaned up ${result.deletedCount} old log entries for room: ${roomId}`, TLDrawSyncService.name);
    }
  }
}
