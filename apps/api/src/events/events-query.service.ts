/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  buildUserLastSeenKey,
  buildUserCounts1hKey,
  buildUserCounts24hKey,
  buildUserSignalsKey,
  buildContextKey,
  buildContextEventsKey,
  buildCorrelationKey,
  buildCommunicationsOpenKey,
  buildCommunicationsAwaitingKey,
  buildCalendarUpcomingKey,
  TTL_CONFIG,
} from '@edulution/events';
import type { UserSignals, ContextState, UserLastSeen, UserCounts } from '@edulution/events';
import redisConnection from '../common/redis.connection';

export interface UserSignalsResponse {
  user_id: string;
  last_seen: UserLastSeen;
  counts_1h: UserCounts;
  counts_24h: UserCounts;
  signals: UserSignals | null;
  pending_communications: number;
  upcoming_meetings: number;
  computed_at: string;
}

export interface ContextStateResponse {
  context_id: string;
  state: ContextState | null;
  recent_events: string[];
  correlations: CorrelationInfo[];
  computed_at: string;
}

export interface CorrelationInfo {
  correlation_id: string;
  signal_type: string;
  confidence: number;
  sources: string[];
  created_at: string;
}

@Injectable()
class EventsQueryService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EventsQueryService.name);

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
      this.logger.log('EventsQueryService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize EventsQueryService', error);
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

  async getUserSignals(userId: string): Promise<UserSignalsResponse> {
    const redis = this.ensureRedis();

    const lastSeenKey = buildUserLastSeenKey(userId);
    const counts1hKey = buildUserCounts1hKey(userId);
    const counts24hKey = buildUserCounts24hKey(userId);
    const signalsKey = buildUserSignalsKey(userId);
    const communicationsAwaitingKey = buildCommunicationsAwaitingKey(userId);
    const calendarUpcomingKey = buildCalendarUpcomingKey(userId);

    const pipeline = redis.pipeline();
    pipeline.hgetall(lastSeenKey);
    pipeline.hgetall(counts1hKey);
    pipeline.hgetall(counts24hKey);
    pipeline.hgetall(signalsKey);
    pipeline.scard(communicationsAwaitingKey);
    pipeline.zcount(calendarUpcomingKey, Date.now(), '+inf');

    const results = await pipeline.exec();

    const lastSeen = (results?.[0]?.[1] as Record<string, string>) || {};
    const counts1h = this.parseCountsHash((results?.[1]?.[1] as Record<string, string>) || {});
    const counts24h = this.parseCountsHash((results?.[2]?.[1] as Record<string, string>) || {});
    const signalsRaw = (results?.[3]?.[1] as Record<string, string>) || {};
    const pendingCommunications = (results?.[4]?.[1] as number) || 0;
    const upcomingMeetings = (results?.[5]?.[1] as number) || 0;

    const signals = this.parseSignals(signalsRaw, userId, counts1h, pendingCommunications, upcomingMeetings);

    if (signals && Object.keys(signalsRaw).length === 0) {
      await this.cacheUserSignals(userId, signals);
    }

    return {
      user_id: userId,
      last_seen: lastSeen as UserLastSeen,
      counts_1h: counts1h,
      counts_24h: counts24h,
      signals,
      pending_communications: pendingCommunications,
      upcoming_meetings: upcomingMeetings,
      computed_at: new Date().toISOString(),
    };
  }

  private parseCountsHash(raw: Record<string, string>): UserCounts {
    const counts: UserCounts = {};
    for (const [key, value] of Object.entries(raw)) {
      counts[key] = parseInt(value, 10) || 0;
    }
    return counts;
  }

  private parseSignals(
    raw: Record<string, string>,
    _userId: string,
    counts1h: UserCounts,
    pendingCommunications: number,
    upcomingMeetings: number,
  ): UserSignals {
    if (Object.keys(raw).length > 0) {
      return {
        activity_level: raw.activity_level as UserSignals['activity_level'] || 'none',
        primary_source: raw.primary_source as UserSignals['primary_source'] || null,
        pending_communications: parseInt(raw.pending_communications, 10) || 0,
        upcoming_meetings: parseInt(raw.upcoming_meetings, 10) || 0,
        last_computed: raw.last_computed || new Date().toISOString(),
      };
    }

    const totalEvents = Object.values(counts1h).reduce((sum, count) => sum + count, 0);
    let activityLevel: UserSignals['activity_level'] = 'none';

    if (totalEvents > 50) {
      activityLevel = 'high';
    } else if (totalEvents > 20) {
      activityLevel = 'medium';
    } else if (totalEvents > 0) {
      activityLevel = 'low';
    }

    let primarySource: UserSignals['primary_source'] = null;
    let maxCount = 0;

    for (const [eventType, count] of Object.entries(counts1h)) {
      const source = eventType.split('.')[0];
      if (count > maxCount) {
        maxCount = count;
        primarySource = source as UserSignals['primary_source'];
      }
    }

    return {
      activity_level: activityLevel,
      primary_source: primarySource,
      pending_communications: pendingCommunications,
      upcoming_meetings: upcomingMeetings,
      last_computed: new Date().toISOString(),
    };
  }

  private async cacheUserSignals(userId: string, signals: UserSignals): Promise<void> {
    const redis = this.ensureRedis();
    const key = buildUserSignalsKey(userId);

    await redis.hset(key, {
      activity_level: signals.activity_level,
      primary_source: signals.primary_source || '',
      pending_communications: signals.pending_communications.toString(),
      upcoming_meetings: signals.upcoming_meetings.toString(),
      last_computed: signals.last_computed,
    });

    await redis.expire(key, TTL_CONFIG.SIGNALS_TTL_SECONDS);
  }

  async getContextState(contextId: string): Promise<ContextStateResponse> {
    const redis = this.ensureRedis();

    const contextKey = buildContextKey(contextId);
    const eventsKey = buildContextEventsKey(contextId);

    const pipeline = redis.pipeline();
    pipeline.hgetall(contextKey);
    pipeline.zrevrange(eventsKey, 0, 49);

    const results = await pipeline.exec();

    const stateRaw = (results?.[0]?.[1] as Record<string, string>) || {};
    const recentEvents = (results?.[1]?.[1] as string[]) || [];

    const state = Object.keys(stateRaw).length > 0 ? this.parseContextState(stateRaw) : null;

    const correlations: CorrelationInfo[] = [];

    if (state && stateRaw.last_correlation) {
      const correlationKey = buildCorrelationKey(stateRaw.last_correlation);
      const correlationData = await redis.hgetall(correlationKey);

      if (Object.keys(correlationData).length > 0) {
        correlations.push({
          correlation_id: correlationData.correlation_id,
          signal_type: correlationData.signal_type,
          confidence: parseFloat(correlationData.confidence) || 0,
          sources: correlationData.sources?.split(',') || [],
          created_at: correlationData.created_at,
        });
      }
    }

    return {
      context_id: contextId,
      state,
      recent_events: recentEvents,
      correlations,
      computed_at: new Date().toISOString(),
    };
  }

  private parseContextState(raw: Record<string, string>): ContextState {
    return {
      context_type: raw.context_type || 'unknown',
      created_at: raw.created_at || '',
      last_activity: raw.last_activity || '',
      event_count: parseInt(raw.event_count, 10) || 0,
      participant_count: parseInt(raw.participant_count, 10) || 0,
      status: (raw.status as ContextState['status']) || 'active',
    };
  }

  async getCorrelation(correlationId: string): Promise<CorrelationInfo | null> {
    const redis = this.ensureRedis();
    const key = buildCorrelationKey(correlationId);

    const data = await redis.hgetall(key);

    if (Object.keys(data).length === 0) {
      return null;
    }

    return {
      correlation_id: data.correlation_id,
      signal_type: data.signal_type,
      confidence: parseFloat(data.confidence) || 0,
      sources: data.sources?.split(',') || [],
      created_at: data.created_at,
    };
  }

  async getUserCommunications(userId: string): Promise<{
    open_threads: Array<{ thread_id: string; last_activity: number }>;
    awaiting_reply: string[];
  }> {
    const redis = this.ensureRedis();

    const openKey = buildCommunicationsOpenKey(userId);
    const awaitingKey = buildCommunicationsAwaitingKey(userId);

    const pipeline = redis.pipeline();
    pipeline.zrevrange(openKey, 0, 49, 'WITHSCORES');
    pipeline.smembers(awaitingKey);

    const results = await pipeline.exec();

    const openRaw = (results?.[0]?.[1] as string[]) || [];
    const awaiting = (results?.[1]?.[1] as string[]) || [];

    const openThreads: Array<{ thread_id: string; last_activity: number }> = [];
    for (let i = 0; i < openRaw.length; i += 2) {
      openThreads.push({
        thread_id: openRaw[i],
        last_activity: parseInt(openRaw[i + 1], 10),
      });
    }

    return {
      open_threads: openThreads,
      awaiting_reply: awaiting,
    };
  }

  async getUserUpcomingMeetings(userId: string, windowMs: number = 24 * 60 * 60 * 1000): Promise<
    Array<{ meeting_id: string; scheduled_at: number }>
  > {
    const redis = this.ensureRedis();
    const key = buildCalendarUpcomingKey(userId);

    const now = Date.now();
    const results = await redis.zrangebyscore(key, now, now + windowMs, 'WITHSCORES');

    const meetings: Array<{ meeting_id: string; scheduled_at: number }> = [];
    for (let i = 0; i < results.length; i += 2) {
      meetings.push({
        meeting_id: results[i],
        scheduled_at: parseInt(results[i + 1], 10),
      });
    }

    return meetings;
  }
}

export default EventsQueryService;
