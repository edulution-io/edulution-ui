/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import {
  buildCommunicationsOpenKey,
  buildCommunicationsAwaitingKey,
  EVENT_SOURCES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
} from '@edulution/events';
import type { ProcessedEvent } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';

const MAIL_EVENTS: Set<string> = new Set([
  MAIL_EVENT_TYPES.RECEIVED,
  MAIL_EVENT_TYPES.SENT,
  MAIL_EVENT_TYPES.REPLIED,
  MAIL_EVENT_TYPES.THREAD_CREATED,
  MAIL_EVENT_TYPES.THREAD_CLOSED,
]);

const CHAT_EVENTS: Set<string> = new Set([
  CHAT_EVENT_TYPES.MESSAGE_SENT,
  CHAT_EVENT_TYPES.MESSAGE_RECEIVED,
]);

@Injectable()
class CommunicationsAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'CommunicationsAggregator';

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

    if (source === EVENT_SOURCES.MAIL && MAIL_EVENTS.has(type)) {
      return true;
    }

    if (source === EVENT_SOURCES.CHAT && CHAT_EVENTS.has(type)) {
      return true;
    }

    return false;
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const { source, type, user_id, context, occurred_at } = event.event;
    const threadId = context?.thread_id;

    if (!threadId) {
      return;
    }

    if (source === EVENT_SOURCES.MAIL) {
      await this.handleMailEvent(user_id, threadId, type, occurred_at);
    } else if (source === EVENT_SOURCES.CHAT) {
      await this.handleChatEvent(user_id, threadId, type, occurred_at);
    }
  }

  private async handleMailEvent(
    userId: string,
    threadId: string,
    type: string,
    occurredAt: string,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const openKey = buildCommunicationsOpenKey(userId);
    const awaitingKey = buildCommunicationsAwaitingKey(userId);
    const timestamp = new Date(occurredAt).getTime();

    const pipeline = redis.pipeline();

    switch (type) {
      case MAIL_EVENT_TYPES.RECEIVED:
        pipeline.zadd(openKey, timestamp, threadId);
        pipeline.sadd(awaitingKey, threadId);
        break;

      case MAIL_EVENT_TYPES.SENT:
      case MAIL_EVENT_TYPES.REPLIED:
        pipeline.zadd(openKey, timestamp, threadId);
        pipeline.srem(awaitingKey, threadId);
        break;

      case MAIL_EVENT_TYPES.THREAD_CREATED:
        pipeline.zadd(openKey, timestamp, threadId);
        break;

      case MAIL_EVENT_TYPES.THREAD_CLOSED:
        pipeline.zrem(openKey, threadId);
        pipeline.srem(awaitingKey, threadId);
        break;

      default:
        return;
    }

    await pipeline.exec();
    this.logger.debug(`Updated communications for user ${userId} thread ${threadId} type ${type}`);
  }

  private async handleChatEvent(
    userId: string,
    threadId: string,
    type: string,
    occurredAt: string,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const openKey = buildCommunicationsOpenKey(userId);
    const awaitingKey = buildCommunicationsAwaitingKey(userId);
    const timestamp = new Date(occurredAt).getTime();

    const pipeline = redis.pipeline();

    switch (type) {
      case CHAT_EVENT_TYPES.MESSAGE_RECEIVED:
        pipeline.zadd(openKey, timestamp, threadId);
        pipeline.sadd(awaitingKey, threadId);
        break;

      case CHAT_EVENT_TYPES.MESSAGE_SENT:
        pipeline.zadd(openKey, timestamp, threadId);
        pipeline.srem(awaitingKey, threadId);
        break;

      default:
        return;
    }

    await pipeline.exec();
    this.logger.debug(`Updated chat communications for user ${userId} thread ${threadId}`);
  }
}

export default CommunicationsAggregator;
