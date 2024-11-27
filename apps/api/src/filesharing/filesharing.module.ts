import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';
import FilesystemService from './filesystem.service';
import OnlyofficeService from './onlyoffice.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [FilesharingController],
  providers: [FilesharingService, FilesystemService, OnlyofficeService],
  exports: [FilesharingService],
})
export default class FilesharingModule {}
