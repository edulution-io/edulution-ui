import { Module } from '@nestjs/common';
import VeyonService from './veyon.service';
import VeyonController from './veyon.controller';

@Module({
  controllers: [VeyonController],
  providers: [VeyonService],
})
export default class VeyonModule {}
