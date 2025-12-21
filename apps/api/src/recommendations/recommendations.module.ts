/*
 * LICENSE PLACEHOLDER
 */

/* eslint-disable import/no-cycle */
import { forwardRef, Module } from '@nestjs/common';
import EventsModule from '../events/events.module';
import McpModule from '../mcp/mcp.module';
import UsersModule from '../users/users.module';
import RecommendationsController from './recommendations.controller';
import RecommendationsService from './recommendations.service';
import WhyService from './why.service';
import { RuleEngineService } from './rules';
import CrossAppModule from './rules/cross-app/cross-app.module';
import ActionExecutionService from './actions/action-execution.service';
/* eslint-enable import/no-cycle */

@Module({
  imports: [forwardRef(() => EventsModule), CrossAppModule, McpModule, forwardRef(() => UsersModule)],
  controllers: [RecommendationsController],
  providers: [RecommendationsService, WhyService, RuleEngineService, ActionExecutionService],
  exports: [RecommendationsService, WhyService, RuleEngineService, CrossAppModule, ActionExecutionService],
})
export default class RecommendationsModule {}
