/*
 * LICENSE PLACEHOLDER
 */

import { Module } from '@nestjs/common';
import SummaryController from './summary.controller';
import SummaryService from './summary.service';

@Module({
  controllers: [SummaryController],
  providers: [SummaryService],
  exports: [SummaryService],
})
export default class SummaryModule {}
