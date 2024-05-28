import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import FilemanagerService from './filemanager.service';
import FilemanagerController from './filemanager.controller';
import WebdavModule from './webdav/webdav.module';
import OnlyOfficeModule from './onlyoffice/onlyoffice.module';

@Module({
  imports: [HttpModule, WebdavModule, OnlyOfficeModule],
  controllers: [FilemanagerController],
  providers: [FilemanagerService],
  exports: [FilemanagerService],
})
export default class FilemanagerModule {}
