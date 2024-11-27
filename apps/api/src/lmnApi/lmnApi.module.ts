import { Module } from '@nestjs/common';
import LmnApiService from './lmnApi.service';
import { LmnApiController } from './lmnApi.controller';
import FilesharingModule from '../filesharing/filesharing.module';

@Module({
  providers: [LmnApiService],
  imports: [FilesharingModule],
  controllers: [LmnApiController],
  exports: [LmnApiService],
})
export default class LmnApiModule {}
