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
import { HttpModule } from '@nestjs/axios';
import { BullModule } from '@nestjs/bullmq';
import APPS from '@libs/appconfig/constants/apps';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import OnlyofficeService from './onlyoffice.service';
import DuplicateFileConsumer from './consumers/duplicateFile.consumer';
import QueueService from '../queue/queue.service';
import CollectFileConsumer from './consumers/collectFile.consumer';
import DeleteFileConsumer from './consumers/deleteFile.consumer';
import WebdavService from '../webdav/webdav.service';
import AppConfigModule from '../appconfig/appconfig.module';
import MoveOrRenameConsumer from './consumers/moveOrRename.consumer';
import CopyFileConsumer from './consumers/copyFile.consumer';

@Module({
  imports: [
    HttpModule,
    AppConfigModule,
    BullModule.registerQueue({
      name: APPS.FILE_SHARING,
    }),
  ],
  controllers: [FilesharingController],
  providers: [
    FilesharingService,

    OnlyofficeService,
    QueueService,
    DuplicateFileConsumer,
    CollectFileConsumer,
    DeleteFileConsumer,
    MoveOrRenameConsumer,
    CopyFileConsumer,
    WebdavService,
  ],
  exports: [FilesharingService],
})
export default class FilesharingModule {}
