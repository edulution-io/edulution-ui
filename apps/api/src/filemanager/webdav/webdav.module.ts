import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import WebdavService from './webdav.service';
import ConfigModule from '../../config/config.module';
import WebdavClientFactory from './webdav.client.factory';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [WebdavClientFactory, WebdavService],
  exports: [WebdavService],
})
export default class WebdavModule {}
