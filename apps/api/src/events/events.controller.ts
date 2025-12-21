/*
 * LICENSE PLACEHOLDER
 */

import { Controller, Post, Get, Body, Param, Query, UseGuards, HttpStatus, HttpCode } from '@nestjs/common';
import Public from '@backend-common/decorators/public.decorator';
import type { EventInput } from '@edulution/events';
import EventsApiKeyGuard from './guards/api-key.guard';
import EventsService from './events.service';
import EventsQueryService from './events-query.service';
import EventsMetrics from './events.metrics';

const EVENTS_ENDPOINT = 'events';

interface IngestEventDto {
  event: EventInput;
  idempotency_key?: string;
}

interface IngestEventsDto {
  events: EventInput[];
}

@Controller(EVENTS_ENDPOINT)
class EventsController {
  constructor(
    private readonly eventsService: EventsService,
    private readonly queryService: EventsQueryService,
    private readonly metricsService: EventsMetrics,
  ) {}

  @Post('ingest')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  async ingestEvent(@Body() body: IngestEventDto) {
    const result = await this.eventsService.ingest(body.event, { idempotencyKey: body.idempotency_key });

    if (!result.success) {
      return {
        success: false,
        error: result.error,
      };
    }

    return {
      success: true,
      event_id: result.eventId,
      stream_id: result.streamId,
      deduplicated: result.deduplicated,
    };
  }

  @Post('ingest/batch')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  @HttpCode(HttpStatus.CREATED)
  async ingestEvents(@Body() body: IngestEventsDto) {
    const result = await this.eventsService.ingestMany(body.events);

    return {
      total: result.total,
      successful: result.successful,
      deduplicated: result.deduplicated,
      failed: result.failed,
      results: result.results.map((r) => ({
        success: r.success,
        event_id: r.eventId,
        stream_id: r.streamId,
        deduplicated: r.deduplicated,
        error: r.error,
      })),
    };
  }

  @Get('health')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getHealth() {
    const health = await this.eventsService.getHealth();
    return health;
  }

  @Get('dlq/stats')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getDlqStats() {
    const stats = await this.eventsService.getDlqStats();
    return stats;
  }

  @Get('ready')
  @Public()
  isReady() {
    const ready = this.eventsService.isReady();
    return {
      ready,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('signals/:userId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getUserSignals(@Param('userId') userId: string) {
    const signals = await this.queryService.getUserSignals(userId);
    return signals;
  }

  @Get('state/:contextId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getContextState(@Param('contextId') contextId: string) {
    const state = await this.queryService.getContextState(contextId);
    return state;
  }

  @Get('correlations/:correlationId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getCorrelation(@Param('correlationId') correlationId: string) {
    const correlation = await this.queryService.getCorrelation(correlationId);

    if (!correlation) {
      return {
        found: false,
        correlation_id: correlationId,
      };
    }

    return {
      found: true,
      ...correlation,
    };
  }

  @Get('communications/:userId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getUserCommunications(@Param('userId') userId: string) {
    const communications = await this.queryService.getUserCommunications(userId);
    return {
      user_id: userId,
      ...communications,
      computed_at: new Date().toISOString(),
    };
  }

  @Get('calendar/:userId')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  async getUserUpcomingMeetings(
    @Param('userId') userId: string,
    @Query('window_hours') windowHours?: string,
  ) {
    const windowMs = windowHours
      ? parseInt(windowHours, 10) * 60 * 60 * 1000
      : 24 * 60 * 60 * 1000;

    const meetings = await this.queryService.getUserUpcomingMeetings(userId, windowMs);

    return {
      user_id: userId,
      window_hours: windowMs / (60 * 60 * 1000),
      upcoming_meetings: meetings,
      computed_at: new Date().toISOString(),
    };
  }

  @Get('metrics')
  @Public()
  @UseGuards(EventsApiKeyGuard)
  getMetrics() {
    const eventMetrics = this.metricsService.getEventMetrics();
    const aggregatorMetrics = this.metricsService.getAggregatorMetrics();
    const uptime = this.metricsService.getUptime();

    return {
      timestamp: new Date().toISOString(),
      uptime_ms: uptime,
      events: eventMetrics,
      aggregators: aggregatorMetrics,
    };
  }
}

export default EventsController;
