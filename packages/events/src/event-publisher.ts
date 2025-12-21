/*
 * LICENSE PLACEHOLDER
 */

import { Redis } from 'ioredis';
import {
  buildStreamKey,
  buildPublishDedupKey,
  buildIdempotencyKey,
  STREAM_CONFIG,
  TTL_CONFIG,
  RETRY_CONFIG,
} from './constants';
import { EventPublisherError } from './errors';
import type { Event, EventSource } from './types';

export interface RedisConnectionOptions {
  host: string;
  port: number;
  password?: string;
  db?: number;
  keyPrefix?: string;
  retryStrategy?: (times: number) => number | void | null;
}

export interface PublishResult {
  success: boolean;
  streamId?: string;
  eventId: string;
  deduplicated?: boolean;
  error?: Error;
}

export interface PublishOptions {
  skipDedup?: boolean;
  maxRetries?: number;
  idempotencyKey?: string;
}

export interface IdempotencyResult {
  isDuplicate: boolean;
  existingEventId?: string;
}

type PipelineResult = [Error | null, unknown][] | null;

function eventToStreamFields(event: Event): string[] {
  return [
    'event_id', event.event_id,
    'schema_version', event.schema_version,
    'occurred_at', event.occurred_at,
    'received_at', event.received_at,
    'tenant_id', event.tenant_id ?? '',
    'user_id', event.user_id,
    'source', event.source,
    'type', event.type,
    'actor_id', event.actor_id ?? '',
    'object', JSON.stringify(event.object),
    'context', JSON.stringify(event.context || {}),
    'correlation_id', event.correlation_id,
    'causation_id', event.causation_id ?? '',
    'sensitivity', event.sensitivity,
    'metadata', JSON.stringify(event.metadata || {}),
    'payload', JSON.stringify(event.payload || {}),
  ];
}

function parseXinfoResult(info: unknown[]): Map<string, unknown> {
  const infoMap = new Map<string, unknown>();
  for (let i = 0; i < info.length; i += 2) {
    infoMap.set(info[i] as string, info[i + 1]);
  }
  return infoMap;
}

export class EventPublisher {
  private redis: Redis | null = null;

  private readonly connectionOptions: RedisConnectionOptions;

  private isConnectedFlag = false;

  private reconnectAttempts = 0;

  constructor(connectionOptions: RedisConnectionOptions) {
    this.connectionOptions = {
      ...connectionOptions,
      retryStrategy: connectionOptions.retryStrategy || this.defaultRetryStrategy.bind(this),
    };
  }

  private defaultRetryStrategy(times: number): number | null {
    this.reconnectAttempts = times;
    if (times > RETRY_CONFIG.MAX_RETRIES) {
      return null;
    }
    return Math.min(
      RETRY_CONFIG.INITIAL_DELAY_MS * (RETRY_CONFIG.BACKOFF_MULTIPLIER ** (times - 1)),
      RETRY_CONFIG.MAX_DELAY_MS,
    );
  }

  async connect(): Promise<void> {
    if (this.redis && this.isConnectedFlag) {
      return;
    }

    const redisClient = new Redis({
      host: this.connectionOptions.host,
      port: this.connectionOptions.port,
      password: this.connectionOptions.password,
      db: this.connectionOptions.db,
      keyPrefix: this.connectionOptions.keyPrefix,
      retryStrategy: this.connectionOptions.retryStrategy,
      maxRetriesPerRequest: RETRY_CONFIG.MAX_RETRIES,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    redisClient.on('connect', () => {
      this.isConnectedFlag = true;
      this.reconnectAttempts = 0;
    });

    redisClient.on('close', () => {
      this.isConnectedFlag = false;
    });

    redisClient.on('error', (err: Error) => {
      this.isConnectedFlag = false;
      // eslint-disable-next-line no-console
      console.error('[EventPublisher] Redis error:', err.message);
    });

    this.redis = redisClient;
    await redisClient.connect();
  }

  async disconnect(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
      this.isConnectedFlag = false;
    }
  }

  private getRedis(): Redis {
    if (!this.redis || !this.isConnectedFlag) {
      throw new EventPublisherError('Redis connection not established. Call connect() first.');
    }
    return this.redis;
  }

  private async checkDedup(eventId: string): Promise<boolean> {
    const redis = this.getRedis();
    const dedupKey = buildPublishDedupKey(eventId);
    const result = await redis.set(dedupKey, '1', 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS, 'NX');
    return result === 'OK';
  }

  private async checkIdempotency(idempotencyKey: string, eventId: string): Promise<IdempotencyResult> {
    const redis = this.getRedis();
    const key = buildIdempotencyKey(idempotencyKey);

    const existing = await redis.get(key);
    if (existing) {
      return { isDuplicate: true, existingEventId: existing };
    }

    await redis.set(key, eventId, 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS, 'NX');
    return { isDuplicate: false };
  }

  async publish(event: Event, options: PublishOptions = {}): Promise<PublishResult> {
    const { skipDedup = false, idempotencyKey } = options;

    try {
      const redis = this.getRedis();

      if (idempotencyKey) {
        const idempotencyResult = await this.checkIdempotency(idempotencyKey, event.event_id);
        if (idempotencyResult.isDuplicate) {
          return {
            success: true,
            eventId: idempotencyResult.existingEventId ?? event.event_id,
            deduplicated: true,
          };
        }
      } else if (!skipDedup) {
        const isNew = await this.checkDedup(event.event_id);
        if (!isNew) {
          return {
            success: true,
            eventId: event.event_id,
            deduplicated: true,
          };
        }
      }

      const streamKey = buildStreamKey(event.source);
      const fields = eventToStreamFields(event);

      const streamId = await redis.xadd(
        streamKey,
        'MAXLEN',
        '~',
        STREAM_CONFIG.MAX_STREAM_LENGTH.toString(),
        '*',
        ...fields,
      );

      return {
        success: true,
        streamId: streamId ?? undefined,
        eventId: event.event_id,
        deduplicated: false,
      };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return {
        success: false,
        eventId: event.event_id,
        error: err,
      };
    }
  }

  async publishMany(events: Event[], options: PublishOptions = {}): Promise<PublishResult[]> {
    const publishPromises = events.map((event) => this.publish(event, options));
    return Promise.all(publishPromises);
  }

  async publishBatch(events: Event[], options: PublishOptions = {}): Promise<PublishResult[]> {
    const { skipDedup = false } = options;

    try {
      const redis = this.getRedis();

      const results: PublishResult[] = [];
      const pipeline = redis.pipeline();
      const eventsToPush = events.map((event, index) => ({ event, index }));

      if (!skipDedup) {
        eventsToPush.forEach(({ event }) => {
          const dedupKey = buildPublishDedupKey(event.event_id);
          pipeline.set(dedupKey, '1', 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS, 'NX');
        });
      }

      const dedupResults: PipelineResult = skipDedup ? null : await pipeline.exec();

      const streamPipeline = redis.pipeline();
      const eventsToStream: { event: Event; originalIndex: number }[] = [];

      eventsToPush.forEach(({ event, index }, i) => {
        if (!skipDedup && dedupResults) {
          const [err, result] = dedupResults[i] || [null, null];
          if (err || result !== 'OK') {
            results[index] = {
              success: true,
              eventId: event.event_id,
              deduplicated: true,
            };
            return;
          }
        }

        const streamKey = buildStreamKey(event.source);
        const fields = eventToStreamFields(event);

        streamPipeline.xadd(
          streamKey,
          'MAXLEN',
          '~',
          STREAM_CONFIG.MAX_STREAM_LENGTH.toString(),
          '*',
          ...fields,
        );

        eventsToStream.push({ event, originalIndex: index });
      });

      const streamResults: PipelineResult = await streamPipeline.exec();

      eventsToStream.forEach(({ event, originalIndex }, streamIndex) => {
        const [err, streamId] = streamResults?.[streamIndex] || [null, null];

        if (err) {
          results[originalIndex] = {
            success: false,
            eventId: event.event_id,
            error: err,
          };
        } else {
          results[originalIndex] = {
            success: true,
            streamId: streamId as string,
            eventId: event.event_id,
            deduplicated: false,
          };
        }
      });

      events.forEach((event, i) => {
        if (!results[i]) {
          results[i] = {
            success: true,
            eventId: event.event_id,
            deduplicated: true,
          };
        }
      });

      return results;
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      return events.map((event) => ({
        success: false,
        eventId: event.event_id,
        error: err,
      }));
    }
  }

  async getStreamInfo(source: EventSource): Promise<{
    length: number;
    firstEntryId: string | null;
    lastEntryId: string | null;
    groups: number;
  }> {
    const redis = this.getRedis();
    const streamKey = buildStreamKey(source);

    try {
      const info = await redis.xinfo('STREAM', streamKey) as unknown[];
      const infoMap = parseXinfoResult(info);

      return {
        length: (infoMap.get('length') as number) ?? 0,
        firstEntryId: (infoMap.get('first-entry') as string[])?.[0] ?? null,
        lastEntryId: (infoMap.get('last-entry') as string[])?.[0] ?? null,
        groups: (infoMap.get('groups') as number) ?? 0,
      };
    } catch (error) {
      if ((error as Error).message.includes('no such key')) {
        return {
          length: 0,
          firstEntryId: null,
          lastEntryId: null,
          groups: 0,
        };
      }
      throw error;
    }
  }

  async createConsumerGroup(source: EventSource, groupName: string, startId = '$'): Promise<boolean> {
    const redis = this.getRedis();
    const streamKey = buildStreamKey(source);

    try {
      await redis.xgroup('CREATE', streamKey, groupName, startId, 'MKSTREAM');
      return true;
    } catch (error) {
      if ((error as Error).message.includes('BUSYGROUP')) {
        return false;
      }
      throw error;
    }
  }

  isReady(): boolean {
    return this.isConnectedFlag && this.redis !== null;
  }

  getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}

export { EventPublisherError } from './errors';

export default EventPublisher;
