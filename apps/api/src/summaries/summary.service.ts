/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  buildSummaryKey,
  buildUserLastSeenKey,
  buildUserCounts24hKey,
  buildCommunicationsOpenKey,
  buildCommunicationsAwaitingKey,
  buildCalendarUpcomingKey,
  EVENT_SOURCES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
} from '@edulution/events';
import type {
  DailySummary,
  SourceActivity,
  CommunicationsSummary,
  MeetingsSummary,
  EventSource,
  UserSignals,
} from '@edulution/events';
import redisConnection from '../common/redis.connection';

const SUMMARY_CACHE_TTL_SECONDS = 3600;
const TOP_EVENT_TYPES_LIMIT = 5;
const UPCOMING_MEETINGS_WINDOW_MS = 24 * 60 * 60 * 1000;

const EVENT_TYPE_PREFIX_TO_SOURCE: Record<string, EventSource> = {
  file: EVENT_SOURCES.FILES,
  folder: EVENT_SOURCES.FILES,
  mail: EVENT_SOURCES.MAIL,
  chat: EVENT_SOURCES.CHAT,
  conference: EVENT_SOURCES.CONFERENCES,
  calendar: EVENT_SOURCES.CALDAV,
  request: EVENT_SOURCES.HTTP,
  system: EVENT_SOURCES.SYSTEM,
};

interface SummaryState {
  lastSeen: Record<string, string>;
  counts24h: Record<string, number>;
  openThreadsCount: number;
  awaitingThreads: string[];
  upcomingMeetings: Array<{ meeting_id: string; scheduled_at: number }>;
}

@Injectable()
class SummaryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SummaryService.name);

  private redis: Redis | null = null;

  async onModuleInit(): Promise<void> {
    try {
      this.redis = new Redis({
        host: redisConnection.host,
        port: redisConnection.port,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      await this.redis.connect();
      this.logger.log('SummaryService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize SummaryService', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  private ensureRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis not connected');
    }
    return this.redis;
  }

  async getDailySummary(userId: string, date: string): Promise<DailySummary> {
    const redis = this.ensureRedis();
    const cacheKey = buildSummaryKey(userId, date);

    const cached = await redis.get(cacheKey);
    if (cached) {
      return JSON.parse(cached) as DailySummary;
    }

    const state = await this.fetchUserState(userId);
    const summary = this.buildSummary(userId, date, state);

    await redis.set(cacheKey, JSON.stringify(summary), 'EX', SUMMARY_CACHE_TTL_SECONDS);

    return summary;
  }

  private async fetchUserState(userId: string): Promise<SummaryState> {
    const redis = this.ensureRedis();

    const lastSeenKey = buildUserLastSeenKey(userId);
    const counts24hKey = buildUserCounts24hKey(userId);
    const openKey = buildCommunicationsOpenKey(userId);
    const awaitingKey = buildCommunicationsAwaitingKey(userId);
    const calendarKey = buildCalendarUpcomingKey(userId);

    const now = Date.now();
    const pipeline = redis.pipeline();
    pipeline.hgetall(lastSeenKey);
    pipeline.hgetall(counts24hKey);
    pipeline.zcard(openKey);
    pipeline.smembers(awaitingKey);
    pipeline.zrangebyscore(calendarKey, now, now + UPCOMING_MEETINGS_WINDOW_MS, 'WITHSCORES');

    const results = await pipeline.exec();

    const lastSeen = (results?.[0]?.[1] as Record<string, string>) || {};
    const counts24hRaw = (results?.[1]?.[1] as Record<string, string>) || {};
    const openThreadsCount = (results?.[2]?.[1] as number) || 0;
    const awaitingThreads = (results?.[3]?.[1] as string[]) || [];
    const meetingsRaw = (results?.[4]?.[1] as string[]) || [];

    const counts24h: Record<string, number> = Object.fromEntries(
      Object.entries(counts24hRaw).map(([key, value]) => [key, parseInt(value, 10) || 0]),
    );

    const upcomingMeetings: Array<{ meeting_id: string; scheduled_at: number }> = [];
    meetingsRaw.forEach((item, i) => {
      if (i % 2 === 0 && meetingsRaw[i + 1] !== undefined) {
        upcomingMeetings.push({
          meeting_id: item,
          scheduled_at: parseInt(meetingsRaw[i + 1], 10),
        });
      }
    });

    return {
      lastSeen,
      counts24h,
      openThreadsCount,
      awaitingThreads,
      upcomingMeetings,
    };
  }

  buildSummary(userId: string, date: string, state: SummaryState): DailySummary {
    const totalEvents = Object.values(state.counts24h).reduce((sum, count) => sum + count, 0);
    const activityLevel = this.computeActivityLevel(totalEvents);
    const bySource = this.computeSourceActivity(state);
    const communications = this.computeCommunications(state);
    const meetings = this.computeMeetings(state);
    const topEventTypes = this.computeTopEventTypes(state.counts24h);

    return {
      user_id: userId,
      date,
      activity_level: activityLevel,
      total_events: totalEvents,
      by_source: bySource,
      communications,
      meetings,
      top_event_types: topEventTypes,
      generated_at: new Date().toISOString(),
    };
  }

  private computeActivityLevel(totalEvents: number): UserSignals['activity_level'] {
    if (totalEvents > 50) return 'high';
    if (totalEvents > 20) return 'medium';
    if (totalEvents > 0) return 'low';
    return 'none';
  }

  private computeSourceActivity(state: SummaryState): SourceActivity[] {
    const sourceEvents = Object.entries(state.counts24h).reduce<Record<string, number>>(
      (acc, [eventType, count]) => {
        const prefix = eventType.split('.')[0];
        const source = EVENT_TYPE_PREFIX_TO_SOURCE[prefix] || prefix;
        acc[source] = (acc[source] || 0) + count;
        return acc;
      },
      {},
    );

    const sources = Object.values(EVENT_SOURCES) as EventSource[];
    return sources
      .map((source) => ({
        source,
        event_count: sourceEvents[source] || 0,
        last_activity: state.lastSeen[source] || null,
      }))
      .filter((s) => s.event_count > 0 || s.last_activity !== null);
  }

  private computeCommunications(state: SummaryState): CommunicationsSummary {
    const messagesSent =
      (state.counts24h[MAIL_EVENT_TYPES.SENT] || 0) +
      (state.counts24h[CHAT_EVENT_TYPES.MESSAGE_SENT] || 0);

    const messagesReceived =
      (state.counts24h[MAIL_EVENT_TYPES.RECEIVED] || 0) +
      (state.counts24h[CHAT_EVENT_TYPES.MESSAGE_RECEIVED] || 0);

    return {
      threads_active: state.openThreadsCount,
      threads_awaiting_reply: state.awaitingThreads.length,
      messages_sent: messagesSent,
      messages_received: messagesReceived,
    };
  }

  private computeMeetings(state: SummaryState): MeetingsSummary {
    return {
      total_scheduled: state.upcomingMeetings.length,
      upcoming_24h: state.upcomingMeetings.length,
      meetings: state.upcomingMeetings.map((m) => ({
        meeting_id: m.meeting_id,
        scheduled_at: new Date(m.scheduled_at).toISOString(),
      })),
    };
  }

  private computeTopEventTypes(counts: Record<string, number>): Array<{ type: string; count: number }> {
    return Object.entries(counts)
      .map(([type, count]) => ({ type, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, TOP_EVENT_TYPES_LIMIT);
  }
}

export default SummaryService;
