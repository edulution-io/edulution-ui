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
import FILESHARING_QUEUE_NAMES from '@libs/filesharing/constants/queueName';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';
import FilesystemService from '../filesystem/filesystem.service';
import OnlyofficeService from './onlyoffice.service';
import FilesharingDuplicateFileConsumer from './consumers/filesharing.duplicateFile.consumer';
import SseService from '../sse/sse.service';
import FilesharingCopyFileConsumer from './consumers/filesharing.copyFile.consumer';

@Module({
  imports: [
    HttpModule,
    AppConfigModule,
    BullModule.registerQueue(
      { name: FILESHARING_QUEUE_NAMES.COPY_QUEUE },
      { name: FILESHARING_QUEUE_NAMES.DELETE_QUEUE },
      { name: FILESHARING_QUEUE_NAMES.DUPLICATE_QUEUE },
      { name: FILESHARING_QUEUE_NAMES.MOVE_QUEUE },
    ),
  ],
  controllers: [FilesharingController],
  providers: [
    FilesharingService,
    FilesystemService,
    OnlyofficeService,
    FilesharingDuplicateFileConsumer,
    FilesharingCopyFileConsumer,
    SseService,
  ],
  exports: [FilesharingService],
})
export default class FilesharingModule {}
