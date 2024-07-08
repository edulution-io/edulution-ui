import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilesharingService from './filesharing.service';
import FilesharingController from './filesharing.controller';
import WebdavModule from './webdav/webdav.module';

@Module({
  imports: [HttpModule, WebdavModule],
  controllers: [FilesharingController],
  providers: [FilesharingService],
})
export default class FilesharingModule {}
