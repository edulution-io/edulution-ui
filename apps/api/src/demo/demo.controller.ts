/*
 * LICENSE PLACEHOLDER
 */

import { Controller, Post, Delete, Get, Body, Param, Query, UseGuards, BadRequestException } from '@nestjs/common';
import Public from '@backend-common/decorators/public.decorator';
import DemoDataService, { DEMO_USER_SETS } from './demo-data.service';
import type { DemoScenario, GenerateDemoResult, BatchGenerateResult, AllUsersGenerateResult } from './demo-data.service';
import EventsApiKeyGuard from '../events/guards/api-key.guard';

interface GenerateBatchDto {
  users: string[];
  scenario: DemoScenario;
  count?: number;
  date?: string;
}

@Controller('demo')
@Public()
@UseGuards(EventsApiKeyGuard)
class DemoController {
  constructor(private readonly demoService: DemoDataService) {}

  @Post('generate/:userId')
  async generateDemoData(
    @Param('userId') userId: string,
    @Query('scenario') scenario?: string,
    @Query('count') count?: string,
    @Query('date') date?: string,
  ): Promise<GenerateDemoResult> {
    const validScenarios: DemoScenario[] = [
      'busy_day',
      'light_day',
      'communication',
      'focus_day',
      'teacher_day',
      'mixed',
      'cross_app_full',
      'cross_app_teacher',
      'cross_app_admin',
      'conference_heavy',
      'exam_day',
      'files_heavy',
    ];

    const selectedScenario: DemoScenario = validScenarios.includes(scenario as DemoScenario)
      ? (scenario as DemoScenario)
      : 'mixed';

    return this.demoService.generateDemoData({
      userId,
      scenario: selectedScenario,
      eventCount: count ? parseInt(count, 10) : undefined,
      date: date ? new Date(date) : new Date(),
    });
  }

  @Post('generate-set/:setName')
  async generateForSet(
    @Param('setName') setName: string,
    @Query('date') date?: string,
  ): Promise<BatchGenerateResult> {
    if (!DEMO_USER_SETS[setName]) {
      throw new BadRequestException(
        `Unknown user set: ${setName}. Available: ${Object.keys(DEMO_USER_SETS).join(', ')}`,
      );
    }

    return this.demoService.generateForUserSet(setName, date ? new Date(date) : new Date());
  }

  @Post('generate-batch')
  async generateBatch(@Body() body: GenerateBatchDto): Promise<AllUsersGenerateResult> {
    return this.demoService.generateForAllUsers(
      body.users,
      body.scenario,
      body.date ? new Date(body.date) : new Date(),
      body.count,
    );
  }

  @Get('sets')
  listSets(): { sets: Array<{ name: string; users: Array<{ userId: string; scenario: string }> }> } {
    return { sets: this.demoService.getAvailableUserSets() };
  }

  @Delete(':userId')
  async clearDemoData(@Param('userId') userId: string): Promise<{ message: string }> {
    return this.demoService.clearDemoData(userId);
  }
}

export default DemoController;
