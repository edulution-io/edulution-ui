import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilemanagerService from './filemanager.service';
import FilemanagerController from './filemanager.controller';
import WebdavModule from './webdav/webdav.module';

@Module({
  imports: [HttpModule, WebdavModule],
  controllers: [FilemanagerController],
  providers: [FilemanagerService],
  exports: [FilemanagerService],
})
export default class FilemanagerModule {}
