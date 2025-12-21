/*
 * LICENSE PLACEHOLDER
 */

import { BadRequestException, Controller, Delete, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetCurrentUser } from '@backend-common/decorators';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import DailyPlanService from './daily-plan.service';
import type { AiDailyPlan } from './schemas/daily-plan.schema';
import JwtOrApiKeyGuard from '../../events/guards/jwt-or-api-key.guard';

interface DailyPlanResponse {
  plan: AiDailyPlan;
  cached: boolean;
  duration_ms: number;
  source: 'redis' | 'mongo' | 'generated';
  input_hash: string;
}

@ApiTags('ai/daily-plan')
@ApiBearerAuth()
@Controller('ai/daily-plan')
@UseGuards(JwtOrApiKeyGuard)
class DailyPlanController {
  constructor(private readonly dailyPlanService: DailyPlanService) {}

  @Get('today')
  async getMyDailyPlan(
    @GetCurrentUser() user: JwtUser,
    @Query('refresh') refresh?: string,
    @Query('configId') configId?: string,
  ): Promise<DailyPlanResponse> {
    const today = new Date().toISOString().split('T')[0];
    const userId = user.preferred_username;

    const options = {
      limit: 8,
      refresh: refresh === 'true',
      configId,
    };

    const result = await this.dailyPlanService.getOrGenerateDailyPlan(userId, today, options);

    return {
      plan: result.plan,
      cached: result.cached,
      duration_ms: result.duration_ms,
      source: result.source,
      input_hash: result.inputHash,
    };
  }

  @Post(':userId/:date')
  async generateDailyPlan(
    @Param('userId') userId: string,
    @Param('date') date: string,
    @Query('limit') limit?: string,
    @Query('refresh') refresh?: string,
    @Query('configId') configId?: string,
    @Query('language') language?: string,
  ): Promise<DailyPlanResponse> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    const options = {
      limit: limit ? Math.min(parseInt(limit, 10), 20) : 8,
      refresh: refresh === 'true',
      configId,
      language,
    };

    const result = await this.dailyPlanService.getOrGenerateDailyPlan(userId, date, options);

    return {
      plan: result.plan,
      cached: result.cached,
      duration_ms: result.duration_ms,
      source: result.source,
      input_hash: result.inputHash,
    };
  }

  @Delete(':userId/:date/cache')
  async invalidateCache(@Param('userId') userId: string, @Param('date') date: string): Promise<{ success: boolean }> {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
      throw new BadRequestException('Date must be in YYYY-MM-DD format');
    }

    await this.dailyPlanService.invalidateCache(userId, date);
    return { success: true };
  }
}

export default DailyPlanController;
