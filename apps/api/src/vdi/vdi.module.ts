import { Module } from '@nestjs/common';

import VdiService from './vdi.service';
import VdiController from './vdi.controller';
import UsersModule from '../users/users.module';

@Module({
  imports: [UsersModule],
  controllers: [VdiController],
  providers: [VdiService],
})
export default class VdiModule {}
