import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TldrawSyncRoom, TldrawSyncRoomSchema } from './tldraw-sync-room.schema';
import TldrawSyncService from './tldraw-sync.service';
import FilesystemService from '../filesystem/filesystem.service';
import { ScheduleModule } from '@nestjs/schedule';
import TldrawSyncController from './tldraw-sync.controller';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    MongooseModule.forFeature([{ name: TldrawSyncRoom.name, schema: TldrawSyncRoomSchema }]),
  ],
  controllers: [TldrawSyncController],
  providers: [TldrawSyncService, FilesystemService],
  exports: [TldrawSyncService],
})
export default class TldrawSyncModule {}
