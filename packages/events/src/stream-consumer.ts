/*
 * LICENSE PLACEHOLDER
 */

import { Redis } from 'ioredis';
import { randomUUID } from 'crypto';
import {
  buildDedupKey,
  buildDlqKey,
  buildStreamKey,
  CONSUMER_GROUPS,
  RETRY_CONFIG,
  STREAM_CONFIG,
  TTL_CONFIG,
} from './constants';
import type {
  DLQEntry,
  Event,
  EventContext,
  EventMetadata,
  EventObject,
  EventPayload,
  EventSensitivity,
  EventSource,
} from './types';

export interface StreamConsumerOptions {
  host: string;
  port: number;
  password?: string;
  groupName?: string;
  consumerName?: string;
  sources: EventSource[];
  batchSize?: number;
  blockMs?: number;
  maxRetries?: number;
  claimIdleMs?: number;
}

export interface ProcessedEvent {
  streamId: string;
  event: Event;
  source: EventSource;
  retryCount: number;
}

export interface ProcessResult {
  success: boolean;
  error?: Error;
}

export type EventHandler = (event: ProcessedEvent) => Promise<ProcessResult>;

interface StreamEntry {
  id: string;
  fields: Record<string, string>;
}

function parseStreamEntryFields(id: string, fields: string[]): StreamEntry {
  const fieldMap: Record<string, string> = {};
  for (let i = 0; i < fields.length; i += 2) {
    fieldMap[fields[i]] = fields[i + 1];
  }
  return { id, fields: fieldMap };
}

function parseEventFromFields(fields: Record<string, string>): Event | null {
  try {
    return {
      event_id: fields.event_id,
      schema_version: fields.schema_version,
      occurred_at: fields.occurred_at,
      received_at: fields.received_at,
      tenant_id: fields.tenant_id || null,
      user_id: fields.user_id,
      source: fields.source as EventSource,
      type: fields.type,
      actor_id: fields.actor_id || null,
      object: JSON.parse(fields.object || '{}') as EventObject,
      context: JSON.parse(fields.context || '{}') as EventContext,
      correlation_id: fields.correlation_id,
      causation_id: fields.causation_id || null,
      sensitivity: fields.sensitivity as EventSensitivity,
      metadata: JSON.parse(fields.metadata || '{}') as EventMetadata,
      payload: JSON.parse(fields.payload || '{}') as EventPayload,
    };
  } catch {
    return null;
  }
}

function eventToFields(event: Event | DLQEntry): string[] {
  const fields: string[] = [
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

  if ('original_stream_id' in event) {
    fields.push(
      'original_stream_id', event.original_stream_id,
      'failure_reason', event.failure_reason,
      'retry_count', event.retry_count.toString(),
      'failed_at', event.failed_at,
    );
  }

  return fields;
}

function extractSourceFromKey(streamKey: string): EventSource | null {
  const prefix = 'events:stream:';
  if (streamKey.startsWith(prefix)) {
    return streamKey.slice(prefix.length) as EventSource;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function checkDedupKey(redis: Redis, eventId: string): Promise<boolean> {
  const key = buildDedupKey(eventId);
  const exists = await redis.exists(key);
  return exists === 1;
}

async function setDedupKey(redis: Redis, eventId: string): Promise<void> {
  const key = buildDedupKey(eventId);
  await redis.set(key, '1', 'EX', TTL_CONFIG.DEDUP_TTL_SECONDS);
}

export class StreamConsumer {
  private redis: Redis | null = null;

  private readonly options: Required<StreamConsumerOptions>;

  private running = false;

  private handler: EventHandler | null = null;

  private processedCount = 0;

  private errorCount = 0;

  private dlqCount = 0;

  constructor(options: StreamConsumerOptions) {
    this.options = {
      ...options,
      groupName: options.groupName || CONSUMER_GROUPS.AGGREGATORS,
      consumerName: options.consumerName || `consumer-${randomUUID().slice(0, 8)}`,
      batchSize: options.batchSize || STREAM_CONFIG.READ_COUNT,
      blockMs: options.blockMs || STREAM_CONFIG.BLOCK_MS,
      maxRetries: options.maxRetries || RETRY_CONFIG.MAX_RETRIES,
      claimIdleMs: options.claimIdleMs || STREAM_CONFIG.PENDING_CLAIM_MS,
      password: options.password || '',
    };
  }

  private getRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis connection not established. Call connect() first.');
    }
    return this.redis;
  }

  async connect(): Promise<void> {
    if (this.redis) {
      return;
    }

    const redisClient = new Redis({
      host: this.options.host,
      port: this.options.port,
      password: this.options.password || undefined,
      maxRetriesPerRequest: RETRY_CONFIG.MAX_RETRIES,
      enableReadyCheck: true,
      lazyConnect: true,
    });

    this.redis = redisClient;
    await redisClient.connect();
    await this.ensureConsumerGroups();
  }

  async disconnect(): Promise<void> {
    this.running = false;
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  private async ensureConsumerGroups(): Promise<void> {
    const redis = this.getRedis();

    const createGroup = async (source: EventSource): Promise<void> => {
      const streamKey = buildStreamKey(source);
      try {
        await redis.xgroup('CREATE', streamKey, this.options.groupName, '$', 'MKSTREAM');
      } catch (error) {
        if (!(error as Error).message.includes('BUSYGROUP')) {
          throw error;
        }
      }
    };

    await Promise.all(this.options.sources.map(createGroup));
  }

  onMessage(handler: EventHandler): void {
    this.handler = handler;
  }

  async start(): Promise<void> {
    if (!this.redis || !this.handler) {
      throw new Error('Consumer not connected or handler not set');
    }

    this.running = true;

    // Consumer loop must run sequentially - processing then reading new messages
    // eslint-disable-next-line no-await-in-loop
    while (this.running) {
      try {
        // eslint-disable-next-line no-await-in-loop
        await this.claimPendingMessages();
        // eslint-disable-next-line no-await-in-loop
        await this.readNewMessages();
      } catch (error) {
        if (this.running) {
          // eslint-disable-next-line no-console
          console.error('[StreamConsumer] Error in consume loop:', (error as Error).message);
          // eslint-disable-next-line no-await-in-loop
          await sleep(1000);
        }
      }
    }
  }

  stop(): void {
    this.running = false;
  }

  private async claimPendingMessages(): Promise<void> {
    const redis = this.getRedis();

    const claimForSource = async (source: EventSource): Promise<void> => {
      const streamKey = buildStreamKey(source);

      try {
        const result = await redis.xautoclaim(
          streamKey,
          this.options.groupName,
          this.options.consumerName,
          this.options.claimIdleMs,
          '0-0',
          'COUNT',
          this.options.batchSize,
        );

        const messages = result[1] as Array<[string, string[]]>;

        const processMessage = async ([id, fields]: [string, string[]]): Promise<void> => {
          if (fields && fields.length > 0) {
            const entry = parseStreamEntryFields(id, fields);
            await this.processEntry(source, entry);
          }
        };

        await messages.reduce(
          async (prev, msg) => {
            await prev;
            await processMessage(msg);
          },
          Promise.resolve(),
        );
      } catch (error) {
        if (!(error as Error).message.includes('NOGROUP')) {
          // eslint-disable-next-line no-console
          console.error(`[StreamConsumer] Error claiming pending for ${source}:`, (error as Error).message);
        }
      }
    };

    await this.options.sources.reduce(
      async (prev, source) => {
        await prev;
        await claimForSource(source);
      },
      Promise.resolve(),
    );
  }

  private async readNewMessages(): Promise<void> {
    const redis = this.getRedis();

    const streams = this.options.sources.map((source) => buildStreamKey(source));
    const ids = this.options.sources.map(() => '>');

    try {
      const result = await redis.xreadgroup(
        'GROUP',
        this.options.groupName,
        this.options.consumerName,
        'COUNT',
        this.options.batchSize,
        'BLOCK',
        this.options.blockMs,
        'STREAMS',
        ...streams,
        ...ids,
      );

      if (!result) return;

      const processStream = async ([streamKey, messages]: [string, Array<[string, string[]]>]): Promise<void> => {
        const source = extractSourceFromKey(streamKey);
        if (!source) return;

        const processMessage = async ([id, fields]: [string, string[]]): Promise<void> => {
          const entry = parseStreamEntryFields(id, fields);
          await this.processEntry(source, entry);
        };

        await messages.reduce(
          async (prev, msg) => {
            await prev;
            await processMessage(msg);
          },
          Promise.resolve(),
        );
      };

      await (result as Array<[string, Array<[string, string[]]>]>).reduce(
        async (prev, stream) => {
          await prev;
          await processStream(stream);
        },
        Promise.resolve(),
      );
    } catch (error) {
      if (!(error as Error).message.includes('NOGROUP')) {
        throw error;
      }
    }
  }

  private async processEntry(source: EventSource, entry: StreamEntry): Promise<void> {
    const redis = this.getRedis();
    if (!this.handler) return;

    const event = parseEventFromFields(entry.fields);
    if (!event) {
      await this.acknowledgeMessage(redis, source, entry.id);
      return;
    }

    const isDuplicate = await checkDedupKey(redis, event.event_id);
    if (isDuplicate) {
      await this.acknowledgeMessage(redis, source, entry.id);
      return;
    }

    const retryCount = await this.getRetryCount(redis, source, entry.id);

    const processedEvent: ProcessedEvent = {
      streamId: entry.id,
      event,
      source,
      retryCount,
    };

    try {
      const result = await this.handler(processedEvent);

      if (result.success) {
        await this.acknowledgeMessage(redis, source, entry.id);
        await setDedupKey(redis, event.event_id);
        this.processedCount += 1;
      } else {
        await this.handleFailure(redis, source, entry.id, event, retryCount, result.error);
      }
    } catch (error) {
      await this.handleFailure(redis, source, entry.id, event, retryCount, error as Error);
    }
  }

  private async handleFailure(
    redis: Redis,
    source: EventSource,
    streamId: string,
    event: Event,
    retryCount: number,
    error?: Error,
  ): Promise<void> {
    this.errorCount += 1;

    if (retryCount >= this.options.maxRetries) {
      await this.moveToDeadLetterQueue(redis, source, streamId, event, error);
      await this.acknowledgeMessage(redis, source, streamId);
      this.dlqCount += 1;
    }
    // If not at max retries, just don't acknowledge - Redis will track retry count
  }

  private async getRetryCount(redis: Redis, source: EventSource, streamId: string): Promise<number> {
    const streamKey = buildStreamKey(source);

    try {
      const pending = await redis.xpending(streamKey, this.options.groupName, streamId, streamId, 1);

      if (pending && pending.length > 0) {
        const entry = pending[0] as [string, string, number, number];
        return entry[3] - 1;
      }
    } catch {
      // Ignore errors
    }

    return 0;
  }

  private async acknowledgeMessage(redis: Redis, source: EventSource, streamId: string): Promise<void> {
    const streamKey = buildStreamKey(source);
    await redis.xack(streamKey, this.options.groupName, streamId);
  }

  private async moveToDeadLetterQueue(
    redis: Redis,
    source: EventSource,
    streamId: string,
    event: Event,
    error?: Error,
  ): Promise<void> {
    const dlqKey = buildDlqKey(source);

    const dlqEntry: DLQEntry = {
      ...event,
      original_stream_id: streamId,
      failure_reason: error?.message || 'Unknown error',
      retry_count: this.options.maxRetries,
      failed_at: new Date().toISOString(),
    };

    const fields = eventToFields(dlqEntry);

    await redis.xadd(dlqKey, 'MAXLEN', '~', STREAM_CONFIG.MAX_DLQ_LENGTH.toString(), '*', ...fields);
  }

  getStats(): { processed: number; errors: number; dlq: number } {
    return {
      processed: this.processedCount,
      errors: this.errorCount,
      dlq: this.dlqCount,
    };
  }

  isRunning(): boolean {
    return this.running;
  }
}

export default StreamConsumer;
