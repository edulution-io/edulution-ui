import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingController from './filesharing.controller';
import FilesharingService from './filesharing.service';
import AppConfigModule from '../appconfig/appconfig.module';

@Module({
  imports: [HttpModule, AppConfigModule],
  controllers: [FilesharingController],
  providers: [FilesharingService],
})
export default class FilesharingModule {}
