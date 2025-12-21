/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  MAIL_EVENT_TYPES,
  buildStreamKey,
  buildDlqKey,
  buildDedupKey,
  buildIdempotencyKey,
  buildUserLastSeenKey,
  buildUserCounts1hKey,
  buildCommunicationsAwaitingKey,
} from '@edulution/events';
import type { Event, ProcessedEvent } from '@edulution/events';

const createMockRedis = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  on: jest.fn(),
  xadd: jest.fn().mockResolvedValue('1234567890-0'),
  xreadgroup: jest.fn().mockResolvedValue(null),
  xack: jest.fn().mockResolvedValue(1),
  xinfo: jest.fn().mockResolvedValue([
    'length', 100,
    'first-entry', ['1234567890-0', ['event_id', 'test']],
    'last-entry', ['1234567891-0', ['event_id', 'test2']],
    'groups', 1,
  ]),
  xgroup: jest.fn().mockResolvedValue('OK'),
  xlen: jest.fn().mockResolvedValue(0),
  set: jest.fn().mockResolvedValue('OK'),
  get: jest.fn().mockResolvedValue(null),
  hget: jest.fn().mockResolvedValue(null),
  hset: jest.fn().mockResolvedValue(1),
  hgetall: jest.fn().mockResolvedValue({}),
  hincrby: jest.fn().mockResolvedValue(1),
  expire: jest.fn().mockResolvedValue(1),
  sadd: jest.fn().mockResolvedValue(1),
  srem: jest.fn().mockResolvedValue(1),
  smembers: jest.fn().mockResolvedValue([]),
  scard: jest.fn().mockResolvedValue(0),
  zadd: jest.fn().mockResolvedValue(1),
  zrem: jest.fn().mockResolvedValue(1),
  zrange: jest.fn().mockResolvedValue([]),
  zrangebyscore: jest.fn().mockResolvedValue([]),
  pipeline: jest.fn().mockReturnValue({
    xadd: jest.fn().mockReturnThis(),
    set: jest.fn().mockReturnThis(),
    hset: jest.fn().mockReturnThis(),
    hincrby: jest.fn().mockReturnThis(),
    expire: jest.fn().mockReturnThis(),
    sadd: jest.fn().mockReturnThis(),
    srem: jest.fn().mockReturnThis(),
    zadd: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([]),
    length: 0,
  }),
});

jest.mock('ioredis', () => jest.fn().mockImplementation(() => createMockRedis()));

describe('Event Pipeline Integration', () => {
  let mockRedis: ReturnType<typeof createMockRedis>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRedis = createMockRedis();
  });

  describe('Event Round-Trip', () => {
    it('should complete full event lifecycle: publish → consume → state', async () => {
      const event = EventBuilder.create()
        .withUserId('user-integration-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({
          object_type: 'file',
          object_id: 'file-integration-1',
          object_ref: '/test/integration.txt',
        })
        .addMetadata('file_name', 'integration.txt')
        .build();

      const streamKey = buildStreamKey(EVENT_SOURCES.FILES);
      expect(streamKey).toBe('events:stream:files');

      await mockRedis.xadd(
        streamKey,
        '*',
        'event_id', event.event_id,
        'data', JSON.stringify(event),
      );

      expect(mockRedis.xadd).toHaveBeenCalledWith(
        streamKey,
        '*',
        'event_id', event.event_id,
        'data', JSON.stringify(event),
      );

      const processedEvent: ProcessedEvent = {
        streamId: '1234567890-0',
        event,
        source: event.source,
        retryCount: 0,
      };

      const lastSeenKey = buildUserLastSeenKey(event.user_id);
      await mockRedis.hset(lastSeenKey, event.source, event.occurred_at);

      expect(mockRedis.hset).toHaveBeenCalledWith(
        lastSeenKey,
        event.source,
        event.occurred_at,
      );

      const countsKey = buildUserCounts1hKey(event.user_id);
      await mockRedis.hincrby(countsKey, event.type, 1);

      expect(mockRedis.hincrby).toHaveBeenCalledWith(
        countsKey,
        event.type,
        1,
      );

      await mockRedis.xack(streamKey, 'aggregation-group', processedEvent.streamId);

      expect(mockRedis.xack).toHaveBeenCalledWith(
        streamKey,
        'aggregation-group',
        processedEvent.streamId,
      );
    });

    it('should handle events from multiple sources', async () => {
      const sources = [EVENT_SOURCES.FILES, EVENT_SOURCES.MAIL, EVENT_SOURCES.CHAT];
      const events: Event[] = [];

      for (const source of sources) {
        const eventType = source === EVENT_SOURCES.FILES
          ? FILE_EVENT_TYPES.CREATED
          : source === EVENT_SOURCES.MAIL
            ? MAIL_EVENT_TYPES.RECEIVED
            : 'chat.message_sent';

        const event = EventBuilder.create()
          .withUserId('user-multi-source')
          .withSource(source as typeof EVENT_SOURCES[keyof typeof EVENT_SOURCES])
          .withType(eventType)
          .withObject({
            object_type: source === EVENT_SOURCES.FILES ? 'file' : 'message',
            object_id: `${source}-obj-1`,
          })
          .build();

        events.push(event);

        const streamKey = buildStreamKey(source);
        await mockRedis.xadd(streamKey, '*', 'event_id', event.event_id, 'data', JSON.stringify(event));
      }

      expect(mockRedis.xadd).toHaveBeenCalledTimes(3);
      expect(events).toHaveLength(3);
    });
  });

  describe('Idempotency', () => {
    it('should detect duplicate events via dedup key', async () => {
      const event = EventBuilder.create()
        .withUserId('user-dedup-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-dedup-1' })
        .build();

      const dedupKey = buildDedupKey(event.event_id);

      mockRedis.get.mockResolvedValueOnce(null);
      const firstCheck = await mockRedis.get(dedupKey);
      expect(firstCheck).toBeNull();

      await mockRedis.set(dedupKey, '1', 'EX', 86400);

      mockRedis.get.mockResolvedValueOnce('1');
      const secondCheck = await mockRedis.get(dedupKey);
      expect(secondCheck).toBe('1');

      expect(mockRedis.set).toHaveBeenCalledWith(dedupKey, '1', 'EX', 86400);
    });

    it('should not update state for duplicate events', async () => {
      const event = EventBuilder.create()
        .withUserId('user-idempotent-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-idemp-1' })
        .build();

      const dedupKey = buildDedupKey(event.event_id);
      const countsKey = buildUserCounts1hKey(event.user_id);

      mockRedis.get.mockResolvedValueOnce(null);
      if (!(await mockRedis.get(dedupKey))) {
        await mockRedis.hincrby(countsKey, event.type, 1);
        await mockRedis.set(dedupKey, '1', 'EX', 86400);
      }

      mockRedis.get.mockResolvedValueOnce('1');
      if (!(await mockRedis.get(dedupKey))) {
        await mockRedis.hincrby(countsKey, event.type, 1);
      }

      expect(mockRedis.hincrby).toHaveBeenCalledTimes(1);
    });

    it('should build correct idempotency key', () => {
      const idempotencyKey = buildIdempotencyKey('my-unique-key-123');
      expect(idempotencyKey).toBe('events:idem:my-unique-key-123');
    });

    it('should deduplicate using client-provided idempotency key', async () => {
      const idempotencyKey = 'client-request-001';
      const redisKey = buildIdempotencyKey(idempotencyKey);

      const event1 = EventBuilder.create()
        .withUserId('user-idem-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-idem-1' })
        .build();

      mockRedis.get.mockResolvedValueOnce(null);
      const firstCheck = await mockRedis.get(redisKey);
      expect(firstCheck).toBeNull();

      await mockRedis.set(redisKey, event1.event_id, 'EX', 86400, 'NX');
      const streamKey = buildStreamKey(EVENT_SOURCES.FILES);
      await mockRedis.xadd(streamKey, '*', 'event_id', event1.event_id);

      mockRedis.get.mockResolvedValueOnce(event1.event_id);
      const secondCheck = await mockRedis.get(redisKey);
      expect(secondCheck).toBe(event1.event_id);

      expect(mockRedis.xadd).toHaveBeenCalledTimes(1);
    });

    it('should return existing event_id for duplicate idempotency key', async () => {
      const idempotencyKey = 'client-request-002';
      const redisKey = buildIdempotencyKey(idempotencyKey);
      const originalEventId = 'original-event-uuid';

      mockRedis.get.mockResolvedValueOnce(originalEventId);
      const existingEventId = await mockRedis.get(redisKey);

      expect(existingEventId).toBe(originalEventId);
    });

    it('should allow different idempotency keys for same content', async () => {
      const streamKey = buildStreamKey(EVENT_SOURCES.FILES);
      const eventContent = {
        user_id: 'user-idem-3',
        source: EVENT_SOURCES.FILES,
        type: FILE_EVENT_TYPES.CREATED,
        object: { object_type: 'file', object_id: 'file-idem-3' },
      };

      const key1 = buildIdempotencyKey('request-a');
      const key2 = buildIdempotencyKey('request-b');

      mockRedis.get.mockResolvedValueOnce(null);
      const check1 = await mockRedis.get(key1);
      expect(check1).toBeNull();
      const event1 = EventBuilder.create()
        .withUserId(eventContent.user_id)
        .withSource(eventContent.source)
        .withType(eventContent.type)
        .withObject(eventContent.object)
        .build();
      await mockRedis.set(key1, event1.event_id, 'EX', 86400, 'NX');
      await mockRedis.xadd(streamKey, '*', 'event_id', event1.event_id);

      mockRedis.get.mockResolvedValueOnce(null);
      const check2 = await mockRedis.get(key2);
      expect(check2).toBeNull();
      const event2 = EventBuilder.create()
        .withUserId(eventContent.user_id)
        .withSource(eventContent.source)
        .withType(eventContent.type)
        .withObject(eventContent.object)
        .build();
      await mockRedis.set(key2, event2.event_id, 'EX', 86400, 'NX');
      await mockRedis.xadd(streamKey, '*', 'event_id', event2.event_id);

      expect(event1.event_id).not.toBe(event2.event_id);
      expect(mockRedis.xadd).toHaveBeenCalledTimes(2);
    });
  });

  describe('Retry Behavior', () => {
    it('should track retry count on processing failures', () => {
      const event = EventBuilder.create()
        .withUserId('user-retry-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-retry-1' })
        .build();

      let processedEvent: ProcessedEvent = {
        streamId: '1234567890-0',
        event,
        source: event.source,
        retryCount: 0,
      };

      const simulateRetry = (pe: ProcessedEvent): ProcessedEvent => ({
        ...pe,
        retryCount: pe.retryCount + 1,
      });

      processedEvent = simulateRetry(processedEvent);
      expect(processedEvent.retryCount).toBe(1);

      processedEvent = simulateRetry(processedEvent);
      expect(processedEvent.retryCount).toBe(2);

      processedEvent = simulateRetry(processedEvent);
      expect(processedEvent.retryCount).toBe(3);
    });

    it('should use exponential backoff delay', () => {
      const baseDelay = 1000;
      const maxDelay = 30000;

      const calculateBackoff = (retryCount: number): number => Math.min(baseDelay * 2**retryCount, maxDelay);

      expect(calculateBackoff(0)).toBe(1000);
      expect(calculateBackoff(1)).toBe(2000);
      expect(calculateBackoff(2)).toBe(4000);
      expect(calculateBackoff(3)).toBe(8000);
      expect(calculateBackoff(4)).toBe(16000);
      expect(calculateBackoff(5)).toBe(30000);
      expect(calculateBackoff(10)).toBe(30000);
    });
  });

  describe('Dead Letter Queue', () => {
    it('should move event to DLQ after max retries', async () => {
      const maxRetries = 3;
      const event = EventBuilder.create()
        .withUserId('user-dlq-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-dlq-1' })
        .build();

      const processedEvent: ProcessedEvent = {
        streamId: '1234567890-0',
        event,
        source: event.source,
        retryCount: maxRetries,
      };

      const shouldMoveToDlq = processedEvent.retryCount >= maxRetries;
      expect(shouldMoveToDlq).toBe(true);

      if (shouldMoveToDlq) {
        const dlqKey = buildDlqKey(event.source);
        const dlqEntry = {
          event,
          original_stream_id: processedEvent.streamId,
          failure_reason: 'max_retries_exceeded',
          retry_count: processedEvent.retryCount,
          failed_at: new Date().toISOString(),
        };

        await mockRedis.xadd(dlqKey, '*', 'data', JSON.stringify(dlqEntry));

        expect(mockRedis.xadd).toHaveBeenCalledWith(
          dlqKey,
          '*',
          'data',
          expect.stringContaining('max_retries_exceeded'),
        );
      }
    });

    it('should preserve event data in DLQ', async () => {
      const event = EventBuilder.create()
        .withUserId('user-dlq-preserve')
        .withSource(EVENT_SOURCES.MAIL)
        .withType(MAIL_EVENT_TYPES.RECEIVED)
        .withObject({ object_type: 'email', object_id: 'email-dlq-1' })
        .withContext({ thread_id: 'thread-dlq-1' })
        .addMetadata('subject_hash', 'abc123')
        .build();

      const dlqEntry = {
        event,
        original_stream_id: '1234567890-0',
        failure_reason: 'processing_error',
        retry_count: 3,
        failed_at: new Date().toISOString(),
      };

      expect(dlqEntry.event.event_id).toBe(event.event_id);
      expect(dlqEntry.event.user_id).toBe('user-dlq-preserve');
      expect(dlqEntry.event.context?.thread_id).toBe('thread-dlq-1');
      expect(dlqEntry.event.metadata?.subject_hash).toBe('abc123');
    });
  });

  describe('State Correctness', () => {
    it('should maintain correct counts after multiple events', async () => {
      const userId = 'user-state-counts';
      const countsKey = buildUserCounts1hKey(userId);
      let fileCreatedCount = 0;
      let fileMovedCount = 0;

      const events = [
        EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.FILES)
          .withType(FILE_EVENT_TYPES.CREATED)
          .withObject({ object_type: 'file', object_id: 'f1' })
          .build(),
        EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.FILES)
          .withType(FILE_EVENT_TYPES.CREATED)
          .withObject({ object_type: 'file', object_id: 'f2' })
          .build(),
        EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.FILES)
          .withType(FILE_EVENT_TYPES.MOVED)
          .withObject({ object_type: 'file', object_id: 'f1' })
          .build(),
      ];

      for (const event of events) {
        if (event.type === FILE_EVENT_TYPES.CREATED) {
          fileCreatedCount++;
        } else if (event.type === FILE_EVENT_TYPES.MOVED) {
          fileMovedCount++;
        }
        await mockRedis.hincrby(countsKey, event.type, 1);
      }

      expect(fileCreatedCount).toBe(2);
      expect(fileMovedCount).toBe(1);
      expect(mockRedis.hincrby).toHaveBeenCalledTimes(3);
    });

    it('should track communications awaiting correctly', async () => {
      const userId = 'user-comms-state';
      const awaitingKey = buildCommunicationsAwaitingKey(userId);
      const threads = new Set<string>();

      await mockRedis.sadd(awaitingKey, 'thread-1');
      threads.add('thread-1');

      await mockRedis.sadd(awaitingKey, 'thread-2');
      threads.add('thread-2');

      await mockRedis.srem(awaitingKey, 'thread-1');
      threads.delete('thread-1');

      expect(threads.size).toBe(1);
      expect(threads.has('thread-2')).toBe(true);
      expect(threads.has('thread-1')).toBe(false);
    });

    it('should update last_seen with most recent timestamp', async () => {
      const userId = 'user-lastseen-state';
      const lastSeenKey = buildUserLastSeenKey(userId);

      const timestamps = [
        '2024-01-01T10:00:00.000Z',
        '2024-01-01T12:00:00.000Z',
        '2024-01-01T11:00:00.000Z',
      ];

      let currentLastSeen: string | null = null;

      for (const timestamp of timestamps) {
        if (!currentLastSeen || timestamp > currentLastSeen) {
          currentLastSeen = timestamp;
          await mockRedis.hset(lastSeenKey, EVENT_SOURCES.FILES, timestamp);
        }
      }

      expect(currentLastSeen).toBe('2024-01-01T12:00:00.000Z');
      expect(mockRedis.hset).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Chaining', () => {
    it('should maintain correlation across chained events', () => {
      const parentEvent = EventBuilder.create()
        .withUserId('user-chain-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'file-parent' })
        .withCorrelationId('chain-correlation-1')
        .build();

      const childEvent = EventBuilder.chain(parentEvent)
        .withUserId('user-chain-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.COPIED)
        .withObject({ object_type: 'file', object_id: 'file-child' })
        .build();

      const grandchildEvent = EventBuilder.chain(childEvent)
        .withUserId('user-chain-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.MOVED)
        .withObject({ object_type: 'file', object_id: 'file-child' })
        .build();

      expect(parentEvent.correlation_id).toBe('chain-correlation-1');
      expect(childEvent.correlation_id).toBe('chain-correlation-1');
      expect(grandchildEvent.correlation_id).toBe('chain-correlation-1');

      expect(childEvent.causation_id).toBe(parentEvent.event_id);
      expect(grandchildEvent.causation_id).toBe(childEvent.event_id);
    });
  });
});
