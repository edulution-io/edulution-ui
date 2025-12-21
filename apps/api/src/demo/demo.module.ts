/*
 * LICENSE PLACEHOLDER
 */

import { Module, forwardRef } from '@nestjs/common';
import DemoController from './demo.controller';
import DemoDataService from './demo-data.service';
import EventsModule from '../events/events.module';
import RecommendationsModule from '../recommendations/recommendations.module';
import DailyPlanModule from '../ai/daily-plan/daily-plan.module';

@Module({
  imports: [EventsModule, forwardRef(() => RecommendationsModule), forwardRef(() => DailyPlanModule)],
  controllers: [DemoController],
  providers: [DemoDataService],
  exports: [DemoDataService],
})
export default class DemoModule {}
