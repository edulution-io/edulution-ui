import { Module } from '@nestjs/common';
import VeyonService from './veyon.service';
import VeyonController from './veyon.controller';
import AppConfigModule from '../appconfig/appconfig.module';

@Module({
  imports: [AppConfigModule],
  controllers: [VeyonController],
  providers: [VeyonService],
})
export default class VeyonModule {}
