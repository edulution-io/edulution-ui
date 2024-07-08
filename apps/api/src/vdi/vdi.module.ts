import { Module } from '@nestjs/common';

import VdiService from './vdi.service';
import VdiController from './vdi.controller';

@Module({
  imports: [],
  controllers: [VdiController],
  providers: [VdiService],
})
export default class VdiModule {}
