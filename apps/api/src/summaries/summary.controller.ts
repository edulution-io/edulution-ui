/*
 * LICENSE PLACEHOLDER
 */

import { Controller, Get, Param, BadRequestException, UseGuards } from '@nestjs/common';
import Public from '@backend-common/decorators/public.decorator';
import EventsApiKeyGuard from '../events/guards/api-key.guard';
import SummaryService from './summary.service';

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

const SUMMARIES_ENDPOINT = 'summaries';

@Controller(SUMMARIES_ENDPOINT)
class SummaryController {
  constructor(private readonly summaryService: SummaryService) {}

  @Get(':userId/:date')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getDailySummary(@Param('userId') userId: string, @Param('date') date: string) {
    if (!DATE_REGEX.test(date)) {
      throw new BadRequestException('Invalid date format. Use YYYY-MM-DD.');
    }

    const summary = await this.summaryService.getDailySummary(userId, date);

    return summary;
  }
}

export default SummaryController;
