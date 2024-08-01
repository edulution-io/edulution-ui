import { Module } from '@nestjs/common';
import CleanUpService from './cleanUp.service';
import CleanUpController from './cleanUp.controller';

@Module({
  imports: [],
  controllers: [CleanUpController],
  providers: [CleanUpService],
})
export default class CleanUpModule {}
