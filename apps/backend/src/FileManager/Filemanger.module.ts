import { Module } from '@nestjs/common';
import { FilemanagerController } from './Filemanager.controller';
import { FileManagerService } from './Filemanger.service';
import { HttpModule } from '@nestjs/axios';
import { WebDAVModule } from './webdav/webdav.module';
import { WebDAVService } from './webdav/webdav.service';
@Module({
  imports: [HttpModule, WebDAVModule],
  controllers: [FilemanagerController],
  providers: [FileManagerService, WebDAVService],
})
export class FilemanagerModule {}
