/*
 * LICENSE PLACEHOLDER
 */

import { Controller, Get, Post, Param, Query, Headers, NotFoundException, UseGuards } from '@nestjs/common';
import Public from '@backend-common/decorators/public.decorator';
import EventsApiKeyGuard from '../events/guards/api-key.guard';
import JwtOrApiKeyGuard from '../events/guards/jwt-or-api-key.guard';
import RecommendationsService from './recommendations.service';
import { RuleEngineService } from './rules';
import WhyService from './why.service';
import ActionExecutionService from './actions/action-execution.service';
import type { WhyResponse } from './why.service';
import type { ExecutionResult } from './actions/action-execution.service';
import type { RecommendationVariant } from './variants/variant.types';
import { isValidVariant } from './variants/variant.types';

const RECOMMENDATIONS_ENDPOINT = 'recommendations';
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;

@Controller(RECOMMENDATIONS_ENDPOINT)
class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
    private readonly ruleEngineService: RuleEngineService,
    private readonly whyService: WhyService,
    private readonly actionExecutionService: ActionExecutionService,
  ) {}

  @Get('rules')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  getRules() {
    const rules = this.ruleEngineService.getRules();
    return {
      count: rules.length,
      rules,
    };
  }

  @Post(':userId/generate')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async generate(
    @Param('userId') userId: string,
    @Query('force') force?: string,
    @Query('variant') variant?: string,
  ) {
    const selectedVariant: RecommendationVariant = isValidVariant(variant) ? variant : 'full';

    const result = await this.ruleEngineService.generate(userId, {
      force: force === 'true',
      variant: selectedVariant,
    });
    return result;
  }

  @Get(':userId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async list(
    @Param('userId') userId: string,
    @Query('limit') limitParam?: string,
    @Query('diverse') diverse?: string,
  ) {
    const limit = limitParam ? Math.min(parseInt(limitParam, 10) || DEFAULT_LIMIT, MAX_LIMIT) : DEFAULT_LIMIT;
    const recommendations =
      diverse === 'true'
        ? await this.recommendationsService.listInterleaved(userId, limit)
        : await this.recommendationsService.list(userId, limit);

    return {
      user_id: userId,
      count: recommendations.length,
      recommendations,
    };
  }

  @Get(':userId/:candidateId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getCandidate(@Param('userId') userId: string, @Param('candidateId') candidateId: string) {
    const candidate = await this.recommendationsService.getCandidate(candidateId);

    if (!candidate || candidate.user_id !== userId) {
      throw new NotFoundException('Candidate not found');
    }

    return candidate;
  }

  @Get(':userId/:candidateId/why')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getWhy(
    @Param('userId') userId: string,
    @Param('candidateId') candidateId: string,
  ): Promise<WhyResponse> {
    return this.whyService.getWhy(userId, candidateId);
  }

  @Post(':userId/:candidateId/execute')
  @UseGuards(JwtOrApiKeyGuard)
  async executeAction(
    @Param('userId') userId: string,
    @Param('candidateId') candidateId: string,
    @Headers('authorization') authHeader?: string,
  ): Promise<ExecutionResult> {
    const token = authHeader?.replace('Bearer ', '');
    return this.actionExecutionService.executeAction(userId, candidateId, token);
  }
}

export default RecommendationsController;
