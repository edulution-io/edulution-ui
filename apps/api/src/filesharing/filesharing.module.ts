import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingController from './filesharing.controller';
import UsersModule from '../users/users.module';
import { FileSharingConfigService } from './filesharing.config.service';
import FilesharingService from './filesharing.service';

@Module({
  imports: [UsersModule, HttpModule],
  controllers: [FilesharingController],
  providers: [FileSharingConfigService, FilesharingService],
})
export default class FilesharingModule {}
