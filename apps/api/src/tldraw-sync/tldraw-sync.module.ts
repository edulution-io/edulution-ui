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

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { TldrawSyncRoom, TldrawSyncRoomSchema } from './tldraw-sync-room.schema';
import TldrawSyncService from './tldraw-sync.service';
import TldrawSyncGateway from './tldraw-sync.gateway';
import TldrawSyncController from './tldraw-sync.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: TldrawSyncRoom.name, schema: TldrawSyncRoomSchema }])],
  providers: [TldrawSyncService, TldrawSyncGateway],
  controllers: [TldrawSyncController],
  exports: [TldrawSyncService],
})
export default class TldrawSyncModule {}
