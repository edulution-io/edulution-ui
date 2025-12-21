/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  buildCorrelationKey,
  buildContextKey,
  REDIS_KEYS,
  TTL_CONFIG,
  EVENT_SOURCES,
} from '@edulution/events';
import type { ProcessedEvent, CorrelationSignal, EventSource } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';

const CORRELATION_WINDOW_MS = 30 * 60 * 1000;

const SIGNAL_TYPES = {
  MEETING_PREPARATION: 'meeting_preparation',
  ACTIVE_DISCUSSION: 'active_discussion',
  PROJECT_ACTIVITY: 'project_activity',
  FOLLOW_UP: 'follow_up',
} as const;

interface PendingCorrelation {
  correlationId: string;
  sources: Set<EventSource>;
  eventCount: number;
  userIds: Set<string>;
  contextIds: Set<string>;
  firstEventAt: number;
  lastEventAt: number;
}

@Injectable()
class CorrelationAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'CorrelationAggregator';

  private pendingCorrelations: Map<string, PendingCorrelation> = new Map();

  constructor(private readonly worker: AggregationWorker) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
    this.worker.registerHandler(this);
    this.startCleanupInterval();
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  canHandle(event: ProcessedEvent): boolean {
    return !!event.event.correlation_id;
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const { correlation_id, source, user_id, context, occurred_at } = event.event;
    const timestamp = new Date(occurred_at).getTime();

    let pending = this.pendingCorrelations.get(correlation_id);

    if (!pending) {
      pending = {
        correlationId: correlation_id,
        sources: new Set(),
        eventCount: 0,
        userIds: new Set(),
        contextIds: new Set(),
        firstEventAt: timestamp,
        lastEventAt: timestamp,
      };
      this.pendingCorrelations.set(correlation_id, pending);
    }

    pending.sources.add(source);
    pending.eventCount++;
    pending.userIds.add(user_id);
    pending.lastEventAt = Math.max(pending.lastEventAt, timestamp);

    if (context?.context_id) {
      pending.contextIds.add(context.context_id);
    }
    if (context?.project_id) {
      pending.contextIds.add(context.project_id);
    }
    if (context?.thread_id) {
      pending.contextIds.add(context.thread_id);
    }
    if (context?.meeting_id) {
      pending.contextIds.add(context.meeting_id);
    }

    const signal = this.detectSignal(pending);

    if (signal) {
      await this.storeCorrelationSignal(signal);
      await this.updateContextState(signal);
    }
  }

  private detectSignal(pending: PendingCorrelation): CorrelationSignal | null {
    const sources = Array.from(pending.sources);

    if (sources.length < 2) {
      return null;
    }

    const hasMeeting = sources.includes(EVENT_SOURCES.CONFERENCES) || sources.includes(EVENT_SOURCES.CALDAV);
    const hasMail = sources.includes(EVENT_SOURCES.MAIL);
    const hasChat = sources.includes(EVENT_SOURCES.CHAT);
    const hasFiles = sources.includes(EVENT_SOURCES.FILES);

    let signalType: string | null = null;
    let confidence = 0;

    if (hasMeeting && (hasMail || hasChat)) {
      signalType = SIGNAL_TYPES.MEETING_PREPARATION;
      confidence = 0.7;

      if (hasMail && hasChat) {
        confidence = 0.85;
      }
      if (hasFiles) {
        confidence = 0.9;
      }
    } else if (hasMail && hasChat) {
      signalType = SIGNAL_TYPES.ACTIVE_DISCUSSION;
      confidence = 0.75;

      if (hasFiles) {
        confidence = 0.85;
      }
    } else if (hasFiles && (hasMail || hasChat)) {
      signalType = SIGNAL_TYPES.PROJECT_ACTIVITY;
      confidence = 0.6;
    } else if (sources.length >= 2) {
      signalType = SIGNAL_TYPES.FOLLOW_UP;
      confidence = 0.5;
    }

    if (!signalType) {
      return null;
    }

    confidence = Math.min(confidence + (pending.eventCount * 0.02), 0.95);

    return {
      correlation_id: pending.correlationId,
      created_at: new Date(pending.firstEventAt).toISOString(),
      sources,
      event_count: pending.eventCount,
      user_ids: Array.from(pending.userIds),
      context_ids: Array.from(pending.contextIds),
      signal_type: signalType,
      confidence: Math.round(confidence * 100) / 100,
    };
  }

  private async storeCorrelationSignal(signal: CorrelationSignal): Promise<void> {
    const redis = this.ensureRedis();
    const key = buildCorrelationKey(signal.correlation_id);

    await redis.hset(key, {
      correlation_id: signal.correlation_id,
      created_at: signal.created_at,
      sources: signal.sources.join(','),
      event_count: signal.event_count.toString(),
      user_ids: signal.user_ids.join(','),
      context_ids: signal.context_ids.join(','),
      signal_type: signal.signal_type,
      confidence: signal.confidence.toString(),
    });

    await redis.expire(key, TTL_CONFIG.CORRELATION_TTL_SECONDS);

    const expiryTime = Date.now() + (TTL_CONFIG.CORRELATION_TTL_SECONDS * 1000);
    await redis.zadd(REDIS_KEYS.CORRELATION_PENDING, expiryTime, signal.correlation_id);

    this.logger.debug(
      `Stored correlation signal: ${signal.signal_type} (confidence: ${signal.confidence}) ` +
      `for correlation ${signal.correlation_id}`
    );
  }

  private async updateContextState(signal: CorrelationSignal): Promise<void> {
    const redis = this.ensureRedis();

    for (const contextId of signal.context_ids) {
      const key = buildContextKey(contextId);

      const exists = await redis.exists(key);

      if (exists) {
        await redis.hset(key, {
          last_correlation: signal.correlation_id,
          last_signal_type: signal.signal_type,
          last_signal_confidence: signal.confidence.toString(),
          last_activity: new Date().toISOString(),
        });
        await redis.hincrby(key, 'correlation_count', 1);
      } else {
        await redis.hset(key, {
          context_type: 'derived',
          created_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          event_count: '0',
          participant_count: signal.user_ids.length.toString(),
          status: 'active',
          last_correlation: signal.correlation_id,
          last_signal_type: signal.signal_type,
          last_signal_confidence: signal.confidence.toString(),
          correlation_count: '1',
        });
      }
    }
  }

  private startCleanupInterval(): void {
    setInterval(() => {
      this.cleanupExpiredCorrelations();
    }, 60000);
  }

  private async cleanupExpiredCorrelations(): Promise<void> {
    const now = Date.now();
    const expiredIds: string[] = [];

    for (const [id, pending] of this.pendingCorrelations) {
      if (now - pending.lastEventAt > CORRELATION_WINDOW_MS) {
        expiredIds.push(id);
      }
    }

    for (const id of expiredIds) {
      this.pendingCorrelations.delete(id);
    }

    if (expiredIds.length > 0) {
      this.logger.debug(`Cleaned up ${expiredIds.length} expired pending correlations`);
    }

    try {
      const redis = this.ensureRedis();
      await redis.zremrangebyscore(REDIS_KEYS.CORRELATION_PENDING, '-inf', now.toString());
    } catch {
      // Ignore cleanup errors
    }
  }
}

export default CorrelationAggregator;
