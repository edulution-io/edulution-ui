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
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';
import FilesystemService from '../filesystem/filesystem.service';
import OnlyofficeService from './onlyoffice.service';
import SseService from '../sse/sse.service';
import {DynamicQueueService} from "../queue/queue.service";
import {JobProducerService} from "../queue/job.producer.service";
import {QueueProvider} from "../queue/queue.provider";
import {WorkerService} from "../queue/worker.service";
import {JobHandlerService} from "../queue/job.handler.service";
import DuplicateFileConsumer from "./consumers/duplicateFile.consumer";


//TODO: Ein Queue Service evtl => mometan sind es noch zuviele. Prüfugen ob der JobProducerService ausreicht.


@Module({
  imports: [
    HttpModule,
    AppConfigModule
  ],
  controllers: [FilesharingController],
  providers: [
    FilesharingService,
    FilesystemService,
    OnlyofficeService,
    SseService,
    DynamicQueueService, JobProducerService, QueueProvider, WorkerService, JobHandlerService,
    DuplicateFileConsumer
  ],
  exports: [FilesharingService],
})
export default class FilesharingModule {}
