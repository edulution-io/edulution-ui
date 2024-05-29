import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import UsersModule from '../../users/users.module';
import WebdavService from './webdav.service';
import ConfigModule from '../../appconfig/appconfig.module';
import WebdavClientFactory from './webdav.client.factory';

@Module({
  imports: [HttpModule, ConfigModule, UsersModule],
  providers: [WebdavClientFactory, WebdavService],
  exports: [WebdavService],
})
export default class WebdavModule {}
