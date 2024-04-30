import { Module } from '@nestjs/common';
import { WebDAVService } from './webdav.service';
import { WebDAVClientFactory } from './webdav-client.factory';

@Module({
  providers: [WebDAVService, WebDAVClientFactory],
  exports: [],
})
export class WebDAVModule {}
