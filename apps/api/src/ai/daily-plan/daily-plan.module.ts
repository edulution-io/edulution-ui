/*
 * LICENSE PLACEHOLDER
 */

import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import DailyPlanController from './daily-plan.controller';
import DailyPlanSchedulerController from './daily-plan-scheduler.controller';
import DailyPlanService from './daily-plan.service';
import DailyPlanMetricsService from './daily-plan.metrics';
import PlanCacheService from './services/plan-cache.service';
import DailyPlanSchedulerService from './services/daily-plan-scheduler.service';
import SummaryModule from '../../summaries/summary.module';
import RecommendationsModule from '../../recommendations/recommendations.module';
import { DailyPlanDocument, DailyPlanDocumentSchema } from './schemas/daily-plan-document.schema';

@Module({
  imports: [
    SummaryModule,
    RecommendationsModule,
    MongooseModule.forFeature([{ name: DailyPlanDocument.name, schema: DailyPlanDocumentSchema }]),
  ],
  controllers: [DailyPlanController, DailyPlanSchedulerController],
  providers: [DailyPlanService, DailyPlanMetricsService, PlanCacheService, DailyPlanSchedulerService],
  exports: [DailyPlanService, DailyPlanMetricsService, PlanCacheService, DailyPlanSchedulerService],
})
export default class DailyPlanModule {}
