import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';
import FilesystemService from './filesystem.service';
import TokenService from '../common/services/token.service';
import OnlyofficeService from './onlyoffice.service';
import { SseModule } from '../sse/sse.module';

@Module({
  imports: [HttpModule, AppConfigModule, SseModule],
  controllers: [FilesharingController],
  providers: [FilesharingService, FilesystemService, TokenService, OnlyofficeService],
})
export default class FilesharingModule {}
