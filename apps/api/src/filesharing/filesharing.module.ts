import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';
import FilesystemService from '../filesystem/filesystem.service';
import OnlyofficeService from './onlyoffice.service';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [FilesharingController],
  providers: [FilesharingService, FilesystemService, OnlyofficeService],
})
export default class FilesharingModule {}
