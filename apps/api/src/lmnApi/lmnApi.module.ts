import { Module } from '@nestjs/common';
import LmnApiService from './lmnApi.service';
import { LmnApiController } from './lmnApi.controller';
import UsersModule from '../users/users.module';

@Module({
  imports: [UsersModule],
  providers: [LmnApiService],
  controllers: [LmnApiController],
  exports: [LmnApiService],
})
export default class LmnApiModule {}
