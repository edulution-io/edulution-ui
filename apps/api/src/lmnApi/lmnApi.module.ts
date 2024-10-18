import { Module } from '@nestjs/common';
import LmnApiService from './lmnApi.service';
import { LmnApiController } from './lmnApi.controller';

@Module({
  providers: [LmnApiService],
  controllers: [LmnApiController],
  exports: [LmnApiService],
})
export default class LmnApiModule {}
