/*
 * LICENSE PLACEHOLDER
 */

import { Controller, Post, Param, Delete, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import DailyPlanSchedulerService from './services/daily-plan-scheduler.service';
import type { NotificationResult, TriggerAllResult } from './services/daily-plan-scheduler.service';
import JwtOrApiKeyGuard from '../../events/guards/jwt-or-api-key.guard';

interface CacheClearResult {
  cleared: boolean;
  userId?: string;
  all?: boolean;
}

@ApiTags('ai/daily-plan/scheduler')
@ApiBearerAuth()
@Controller('ai/daily-plan/scheduler')
@UseGuards(JwtOrApiKeyGuard)
class DailyPlanSchedulerController {
  constructor(private readonly schedulerService: DailyPlanSchedulerService) {}

  @Post('trigger/:userId')
  @ApiOperation({ summary: 'Manually trigger daily plan notification for a user' })
  @ApiResponse({ status: 200, description: 'Notification triggered' })
  async triggerNotification(@Param('userId') userId: string): Promise<NotificationResult> {
    return this.schedulerService.triggerNotificationForUser(userId);
  }

  @Post('trigger-all')
  @ApiOperation({ summary: 'Trigger daily plan notifications for all users (like morning push)' })
  @ApiResponse({ status: 200, description: 'Notifications triggered for all users' })
  async triggerAll(): Promise<TriggerAllResult> {
    return this.schedulerService.triggerForAllUsers();
  }

  @Delete('cache/:userId')
  @ApiOperation({ summary: 'Clear notification cache for a specific user' })
  @ApiResponse({ status: 200, description: 'Cache cleared for user' })
  clearUserCache(@Param('userId') userId: string): CacheClearResult {
    this.schedulerService.clearCache(userId);
    return { cleared: true, userId };
  }

  @Delete('cache')
  @ApiOperation({ summary: 'Clear notification cache for all users' })
  @ApiResponse({ status: 200, description: 'Cache cleared for all users' })
  clearAllCache(): CacheClearResult {
    this.schedulerService.clearCache();
    return { cleared: true, all: true };
  }
}

export default DailyPlanSchedulerController;
