/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  buildCalendarUpcomingKey,
  REDIS_KEYS,
  EVENT_SOURCES,
  CONFERENCE_EVENT_TYPES,
  CALDAV_EVENT_TYPES,
} from '@edulution/events';
import type { ProcessedEvent } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';

const CONFERENCE_EVENTS: Set<string> = new Set([
  CONFERENCE_EVENT_TYPES.CREATED,
  CONFERENCE_EVENT_TYPES.STARTED,
  CONFERENCE_EVENT_TYPES.ENDED,
]);

const CALENDAR_EVENTS: Set<string> = new Set([
  CALDAV_EVENT_TYPES.EVENT_CREATED,
  CALDAV_EVENT_TYPES.EVENT_UPDATED,
  CALDAV_EVENT_TYPES.EVENT_DELETED,
  CALDAV_EVENT_TYPES.EVENT_STARTED,
  CALDAV_EVENT_TYPES.EVENT_ENDED,
]);

@Injectable()
class CalendarAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'CalendarAggregator';

  constructor(private readonly worker: AggregationWorker) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
    this.worker.registerHandler(this);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  canHandle(event: ProcessedEvent): boolean {
    const { source, type } = event.event;

    if (source === EVENT_SOURCES.CONFERENCES && CONFERENCE_EVENTS.has(type)) {
      return true;
    }

    if (source === EVENT_SOURCES.CALDAV && CALENDAR_EVENTS.has(type)) {
      return true;
    }

    return false;
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const { source, type, user_id, object, context, metadata } = event.event;
    const meetingId = context?.meeting_id || object.object_id;

    if (source === EVENT_SOURCES.CONFERENCES) {
      await this.handleConferenceEvent(user_id, meetingId, type, metadata);
    } else if (source === EVENT_SOURCES.CALDAV) {
      await this.handleCalendarEvent(user_id, meetingId, type, metadata);
    }
  }

  private async handleConferenceEvent(
    userId: string,
    meetingId: string,
    type: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const upcomingKey = buildCalendarUpcomingKey(userId);

    switch (type) {
      case CONFERENCE_EVENT_TYPES.CREATED: {
        const scheduledStart = this.extractScheduledTime(metadata);
        if (scheduledStart) {
          await redis.zadd(upcomingKey, scheduledStart, meetingId);
          this.logger.debug(`Added upcoming conference ${meetingId} for user ${userId}`);
        }
        break;
      }

      case CONFERENCE_EVENT_TYPES.STARTED:
        await redis.sadd(REDIS_KEYS.CONFERENCES_ACTIVE, meetingId);
        await redis.zrem(upcomingKey, meetingId);
        this.logger.debug(`Conference ${meetingId} started, moved to active`);
        break;

      case CONFERENCE_EVENT_TYPES.ENDED:
        await redis.srem(REDIS_KEYS.CONFERENCES_ACTIVE, meetingId);
        this.logger.debug(`Conference ${meetingId} ended`);
        break;

      default:
        break;
    }
  }

  private async handleCalendarEvent(
    userId: string,
    eventId: string,
    type: string,
    metadata?: Record<string, unknown>,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const upcomingKey = buildCalendarUpcomingKey(userId);

    switch (type) {
      case CALDAV_EVENT_TYPES.EVENT_CREATED:
      case CALDAV_EVENT_TYPES.EVENT_UPDATED: {
        const scheduledStart = this.extractScheduledTime(metadata);
        if (scheduledStart) {
          await redis.zadd(upcomingKey, scheduledStart, eventId);
          this.logger.debug(`Added/updated upcoming calendar event ${eventId} for user ${userId}`);
        }
        break;
      }

      case CALDAV_EVENT_TYPES.EVENT_DELETED:
        await redis.zrem(upcomingKey, eventId);
        this.logger.debug(`Removed calendar event ${eventId} for user ${userId}`);
        break;

      case CALDAV_EVENT_TYPES.EVENT_STARTED:
        await redis.zrem(upcomingKey, eventId);
        this.logger.debug(`Calendar event ${eventId} started for user ${userId}`);
        break;

      case CALDAV_EVENT_TYPES.EVENT_ENDED:
        this.logger.debug(`Calendar event ${eventId} ended for user ${userId}`);
        break;

      default:
        break;
    }
  }

  private extractScheduledTime(metadata?: Record<string, unknown>): number | null {
    if (!metadata) return null;

    const scheduledAt = metadata.scheduled_at || metadata.start_time || metadata.starts_at;

    if (typeof scheduledAt === 'string') {
      const timestamp = new Date(scheduledAt).getTime();
      if (!isNaN(timestamp)) {
        return timestamp;
      }
    }

    if (typeof scheduledAt === 'number') {
      return scheduledAt;
    }

    return null;
  }
}

export default CalendarAggregator;
