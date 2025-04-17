import { Inject, Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { TldrawSyncRoom, TldrawSyncRoomDocument } from './tldraw-sync-room.schema';
import { Model } from 'mongoose';
import { Cache } from 'cache-manager';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { RoomSnapshot, TLSocketRoom } from '@tldraw/sync-core';
import { roomsMap } from './tdlraw-sync-rooms';
import FilesystemService from '../filesystem/filesystem.service';
import { Readable } from 'stream';

function isEphemeralRoomId(roomId: string) {
  return roomId.startsWith('multi-');
}

let roomInitMutex: Promise<null | Error> = Promise.resolve(null);

@Injectable()
export default class TldrawSyncService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(TldrawSyncService.name);
  private readonly EPHEMERAL_ROOM_TTL = 60 * 60;
  private persistInterval: ReturnType<typeof setInterval> | null = null;

  constructor(
    @InjectModel(TldrawSyncRoom.name)
    private readonly roomModel: Model<TldrawSyncRoomDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly filesystemService: FilesystemService,
  ) {}

  async onModuleInit() {
    this.persistInterval = setInterval(() => {
      for (const [roomId, state] of roomsMap.entries()) {
        if (state.needsPersist) {
          state.needsPersist = false;
          this.persistRoom(roomId, state.room.getCurrentSnapshot());
        }
        if (state.room.isClosed()) {
          this.logger.log(`Removing closed room: ${roomId}`);
          roomsMap.delete(roomId);
        }
      }
    }, 2000);
  }

  async onModuleDestroy() {
    if (this.persistInterval) {
      clearInterval(this.persistInterval);
    }
  }

  async makeOrLoadRoom(roomId: string) {
    this.logger.log('makeOrLoadRoom');

    roomInitMutex = roomInitMutex
      .then(async () => {
        const existing = roomsMap.get(roomId);
        if (existing && !existing.room.isClosed()) {
          return null;
        }

        const ephemeral = isEphemeralRoomId(roomId);

        let snapshot: RoomSnapshot | null = null;

        if (ephemeral) {
          snapshot = await this.loadFromRedis(roomId);
          if (!snapshot) {
            this.logger.log(`Ephemeral room not found in Redis: ${roomId}, will create new.`);
          }
        } else {
          const roomDoc = await this.roomModel.findOne({ roomId }).lean();
          if (roomDoc) {
            snapshot = roomDoc.roomData;
            this.logger.log(`Loaded snapshot from Mongo for room: ${roomId}`);
          } else {
            this.logger.log(`No room found in Mongo for room: ${roomId}, will create new.`);
          }
        }

        const roomState = this.createRoomState(roomId, snapshot, ephemeral);
        roomsMap.set(roomId, roomState);
        return null;
      })
      .catch((err) => err);

    const err = await roomInitMutex;
    if (err) throw err;
    return roomsMap.get(roomId)!.room;
  }

  private createRoomState(roomId: string, snapshot: RoomSnapshot | null, ephemeral: boolean) {
    const room = new TLSocketRoom<any, void>({
      initialSnapshot: snapshot || undefined,
      onSessionRemoved: (r, { sessionId, numSessionsRemaining }) => {
        this.logger.log(`Session removed: ${sessionId}, room: ${roomId}`);
        if (numSessionsRemaining === 0) {
          this.logger.log(`No more sessions in room: ${roomId}, closing room.`);
          r.close();
        }
      },
      onDataChange: () => {
        const st = roomsMap.get(roomId);
        if (st) {
          st.needsPersist = true;
        }
      },
    });
    return {
      roomId,
      room,
      isEphemeral: ephemeral,
      needsPersist: false,
    };
  }

  private async loadFromRedis(roomId: string): Promise<RoomSnapshot | null> {
    const data = await this.cacheManager.get<RoomSnapshot>(`room:${roomId}`);
    return data || null;
  }

  private async saveToRedis(roomId: string, snapshot: RoomSnapshot) {
    await this.cacheManager.set<RoomSnapshot>(`room:${roomId}`, snapshot, this.EPHEMERAL_ROOM_TTL);
  }

  private async saveToMongo(roomId: string, snapshot: RoomSnapshot) {
    await this.roomModel.findOneAndUpdate({ roomId }, { roomId, roomData: snapshot }, { upsert: true });
  }

  async persistRoom(roomId: string, snapshot: RoomSnapshot) {
    const ephemeral = isEphemeralRoomId(roomId);
    if (ephemeral) {
      await this.saveToRedis(roomId, snapshot);
    } else {
      await this.saveToMongo(roomId, snapshot);
    }
  }

  async removeFromCache(roomId: string) {
    await this.cacheManager.del(`room:${roomId}`);
  }

  async storeAsset(assetId: string, data: Buffer): Promise<void> {
    await this.filesystemService.writeFile(assetId, data);
  }

  async loadAsset(assetId: string): Promise<Readable> {
    return this.filesystemService.readFileStream(assetId);
  }
}
