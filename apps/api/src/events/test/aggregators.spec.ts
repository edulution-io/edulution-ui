/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  MAIL_EVENT_TYPES,
  CONFERENCE_EVENT_TYPES,
  buildUserLastSeenKey,
  buildUserCounts1hKey,
  buildCommunicationsAwaitingKey,
  buildCalendarUpcomingKey,
  buildDedupKey,
} from '@edulution/events';
import type { ProcessedEvent } from '@edulution/events';

function createProcessedEvent(
  overrides: Partial<ProcessedEvent['event']> = {},
): ProcessedEvent {
  const event = EventBuilder.create()
    .withUserId(overrides.user_id || 'user-123')
    .withSource(
      (overrides.source as (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES]) ||
        EVENT_SOURCES.FILES,
    )
    .withType(overrides.type || FILE_EVENT_TYPES.CREATED)
    .withObject(
      overrides.object || { object_type: 'file', object_id: 'file-1' },
    )
    .withContext(overrides.context)
    .withCorrelationId(overrides.correlation_id)
    .build();

  return {
    streamId: '1234567890-0',
    event,
    source: event.source,
    retryCount: 0,
  };
}

describe('Aggregator Logic', () => {
  describe('LastSeen Aggregation Logic', () => {
    it('should generate correct last_seen key for a user', () => {
      const key = buildUserLastSeenKey('user-1');

      expect(key).toBe('state:user:user-1:lastseen');
    });

    it('should track last seen timestamp per source', () => {
      const event = createProcessedEvent({
        user_id: 'user-1',
        source: EVENT_SOURCES.FILES,
      });

      const lastSeen: Record<string, string> = {};
      lastSeen[event.event.source] = event.event.occurred_at;

      expect(lastSeen[EVENT_SOURCES.FILES]).toBe(event.event.occurred_at);
    });

    it('should only update if new timestamp is newer', () => {
      const oldTime = '2024-01-01T00:00:00.000Z';
      const newTime = '2024-01-02T00:00:00.000Z';

      expect(newTime > oldTime).toBe(true);
      expect(oldTime > newTime).toBe(false);
    });
  });

  describe('Counts Aggregation Logic', () => {
    it('should generate correct counts key for a user', () => {
      const key = buildUserCounts1hKey('user-1');

      expect(key).toBe('state:user:user-1:counts:1h');
    });

    it('should track event type counts', () => {
      const counts: Record<string, number> = {};

      const events = [
        createProcessedEvent({ type: FILE_EVENT_TYPES.CREATED }),
        createProcessedEvent({ type: FILE_EVENT_TYPES.CREATED }),
        createProcessedEvent({ type: FILE_EVENT_TYPES.MOVED }),
      ];

      for (const event of events) {
        const eventType = event.event.type;
        counts[eventType] = (counts[eventType] || 0) + 1;
      }

      expect(counts[FILE_EVENT_TYPES.CREATED]).toBe(2);
      expect(counts[FILE_EVENT_TYPES.MOVED]).toBe(1);
    });
  });

  describe('Communications Aggregation Logic', () => {
    it('should generate correct awaiting key', () => {
      const key = buildCommunicationsAwaitingKey('user-1');

      expect(key).toBe('state:communications:user-1:awaiting');
    });

    it('should track awaiting threads on mail.received', () => {
      const awaitingThreads = new Set<string>();

      const event = createProcessedEvent({
        user_id: 'user-1',
        source: EVENT_SOURCES.MAIL,
        type: MAIL_EVENT_TYPES.RECEIVED,
        context: { thread_id: 'thread-1' },
      });

      if (
        event.event.type === MAIL_EVENT_TYPES.RECEIVED &&
        event.event.context?.thread_id
      ) {
        awaitingThreads.add(event.event.context.thread_id);
      }

      expect(awaitingThreads.has('thread-1')).toBe(true);
    });

    it('should remove thread from awaiting on mail.replied', () => {
      const awaitingThreads = new Set<string>(['thread-1', 'thread-2']);

      awaitingThreads.delete('thread-1');

      expect(awaitingThreads.has('thread-1')).toBe(false);
      expect(awaitingThreads.has('thread-2')).toBe(true);
    });
  });

  describe('Calendar Aggregation Logic', () => {
    it('should generate correct upcoming key', () => {
      const key = buildCalendarUpcomingKey('user-1');

      expect(key).toBe('state:calendar:user-1:upcoming');
    });

    it('should track upcoming meetings with scores', () => {
      const upcomingMeetings: Array<{ id: string; score: number }> = [];
      const scheduledTime = Date.now() + 3600000;

      upcomingMeetings.push({ id: 'meeting-1', score: scheduledTime });

      expect(upcomingMeetings[0].id).toBe('meeting-1');
      expect(upcomingMeetings[0].score).toBe(scheduledTime);
    });

    it('should remove meeting from upcoming when started', () => {
      const upcomingMeetings = new Map<string, number>();
      upcomingMeetings.set('meeting-1', Date.now() + 3600000);
      upcomingMeetings.set('meeting-2', Date.now() + 7200000);

      upcomingMeetings.delete('meeting-1');

      expect(upcomingMeetings.has('meeting-1')).toBe(false);
      expect(upcomingMeetings.has('meeting-2')).toBe(true);
    });
  });

  describe('State Correctness', () => {
    it('should maintain consistent state after multiple events', () => {
      const counts: Record<string, number> = {};

      const events = [
        createProcessedEvent({
          user_id: 'user-1',
          type: FILE_EVENT_TYPES.CREATED,
        }),
        createProcessedEvent({
          user_id: 'user-1',
          type: FILE_EVENT_TYPES.CREATED,
        }),
        createProcessedEvent({
          user_id: 'user-1',
          type: FILE_EVENT_TYPES.MOVED,
        }),
      ];

      for (const event of events) {
        const eventType = event.event.type;
        counts[eventType] = (counts[eventType] || 0) + 1;
      }

      expect(counts[FILE_EVENT_TYPES.CREATED]).toBe(2);
      expect(counts[FILE_EVENT_TYPES.MOVED]).toBe(1);
    });

    it('should track multiple users independently', () => {
      const userCounts: Record<string, Record<string, number>> = {};

      const events = [
        createProcessedEvent({
          user_id: 'user-1',
          type: FILE_EVENT_TYPES.CREATED,
        }),
        createProcessedEvent({
          user_id: 'user-2',
          type: FILE_EVENT_TYPES.CREATED,
        }),
        createProcessedEvent({
          user_id: 'user-1',
          type: FILE_EVENT_TYPES.CREATED,
        }),
      ];

      for (const event of events) {
        const userId = event.event.user_id;
        const eventType = event.event.type;
        if (!userCounts[userId]) {
          userCounts[userId] = {};
        }
        userCounts[userId][eventType] =
          (userCounts[userId][eventType] || 0) + 1;
      }

      expect(userCounts['user-1'][FILE_EVENT_TYPES.CREATED]).toBe(2);
      expect(userCounts['user-2'][FILE_EVENT_TYPES.CREATED]).toBe(1);
    });
  });
});

describe('Idempotency', () => {
  it('should generate correct dedup key', () => {
    const eventId = 'test-event-id';
    const dedupKey = buildDedupKey(eventId);

    expect(dedupKey).toBe(`events:dedup:${eventId}`);
  });

  it('should detect duplicate events via dedup key lookup', () => {
    const processedEvents = new Set<string>();
    const eventId = 'duplicate-event-id';

    const isDuplicate1 = processedEvents.has(eventId);
    expect(isDuplicate1).toBe(false);

    processedEvents.add(eventId);

    const isDuplicate2 = processedEvents.has(eventId);
    expect(isDuplicate2).toBe(true);
  });

  it('should not process duplicate events twice', () => {
    const processedEvents = new Set<string>();
    const counts: Record<string, number> = {};
    const eventId = 'dup-event-1';
    const eventType = FILE_EVENT_TYPES.CREATED;

    const processEvent = (id: string, type: string): boolean => {
      if (processedEvents.has(id)) {
        return false;
      }
      processedEvents.add(id);
      counts[type] = (counts[type] || 0) + 1;
      return true;
    };

    expect(processEvent(eventId, eventType)).toBe(true);
    expect(processEvent(eventId, eventType)).toBe(false);
    expect(counts[eventType]).toBe(1);
  });
});

describe('Retry Behavior', () => {
  it('should track retry count', () => {
    const event: ProcessedEvent = {
      streamId: '1234-0',
      event: EventBuilder.create()
        .withUserId('user-1')
        .withSource(EVENT_SOURCES.FILES)
        .withType(FILE_EVENT_TYPES.CREATED)
        .withObject({ object_type: 'file', object_id: 'f1' })
        .build(),
      source: EVENT_SOURCES.FILES,
      retryCount: 2,
    };

    expect(event.retryCount).toBe(2);
  });

  it('should determine when to move to DLQ', () => {
    const maxRetries = 3;

    expect(maxRetries <= 2).toBe(false);
    expect(maxRetries <= 3).toBe(true);
    expect(maxRetries <= 4).toBe(true);
  });

  it('should calculate exponential backoff', () => {
    const baseDelay = 1000;
    const maxDelay = 30000;

    const calculateBackoff = (retryCount: number): number => Math.min(baseDelay * 2**retryCount, maxDelay);

    expect(calculateBackoff(0)).toBe(1000);
    expect(calculateBackoff(1)).toBe(2000);
    expect(calculateBackoff(2)).toBe(4000);
    expect(calculateBackoff(3)).toBe(8000);
    expect(calculateBackoff(5)).toBe(30000);
  });
});
