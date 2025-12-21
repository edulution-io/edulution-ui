/*
 * LICENSE PLACEHOLDER
 */

import {
  EVENT_SOURCES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
  FILE_EVENT_TYPES,
  buildSummaryKey,
} from '@edulution/events';
import type { DailySummary } from '@edulution/events';
import SummaryService from '../summary.service';

const createMockRedis = () => ({
  connect: jest.fn().mockResolvedValue(undefined),
  quit: jest.fn().mockResolvedValue(undefined),
  get: jest.fn().mockResolvedValue(null),
  set: jest.fn().mockResolvedValue('OK'),
  pipeline: jest.fn().mockReturnValue({
    hgetall: jest.fn().mockReturnThis(),
    zcard: jest.fn().mockReturnThis(),
    smembers: jest.fn().mockReturnThis(),
    zrangebyscore: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue([
      [null, { files: '2024-01-15T10:00:00.000Z' }],
      [null, { 'file.created': '5', 'mail.received': '3' }],
      [null, 2],
      [null, ['thread-1']],
      [null, ['meeting-1', String(Date.now() + 3600000)]],
    ]),
  }),
});

jest.mock('ioredis', () => jest.fn().mockImplementation(() => createMockRedis()));

describe('SummaryService', () => {
  let service: SummaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SummaryService();
  });

  describe('buildSummary determinism', () => {
    it('should produce identical output for identical state', () => {
      const state = {
        lastSeen: { files: '2024-01-15T10:00:00.000Z' },
        counts24h: {
          [FILE_EVENT_TYPES.CREATED]: 5,
          [MAIL_EVENT_TYPES.RECEIVED]: 3,
        },
        openThreadsCount: 2,
        awaitingThreads: ['thread-1'],
        upcomingMeetings: [{ meeting_id: 'meeting-1', scheduled_at: 1705320000000 }],
      };

      const summary1 = service.buildSummary('user-1', '2024-01-15', state);
      const summary2 = service.buildSummary('user-1', '2024-01-15', state);

      expect(summary1.user_id).toEqual(summary2.user_id);
      expect(summary1.date).toEqual(summary2.date);
      expect(summary1.activity_level).toEqual(summary2.activity_level);
      expect(summary1.total_events).toEqual(summary2.total_events);
      expect(summary1.by_source).toEqual(summary2.by_source);
      expect(summary1.communications).toEqual(summary2.communications);
      expect(summary1.top_event_types).toEqual(summary2.top_event_types);
    });
  });

  describe('activity level computation', () => {
    it('should return none for zero events', () => {
      const state = {
        lastSeen: {},
        counts24h: {},
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);
      expect(summary.activity_level).toBe('none');
    });

    it('should return low for 1-20 events', () => {
      const state = {
        lastSeen: {},
        counts24h: { [FILE_EVENT_TYPES.CREATED]: 10 },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);
      expect(summary.activity_level).toBe('low');
    });

    it('should return medium for 21-50 events', () => {
      const state = {
        lastSeen: {},
        counts24h: { [FILE_EVENT_TYPES.CREATED]: 30 },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);
      expect(summary.activity_level).toBe('medium');
    });

    it('should return high for 51+ events', () => {
      const state = {
        lastSeen: {},
        counts24h: { [FILE_EVENT_TYPES.CREATED]: 60 },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);
      expect(summary.activity_level).toBe('high');
    });
  });

  describe('communications summary', () => {
    it('should aggregate mail and chat messages', () => {
      const state = {
        lastSeen: {},
        counts24h: {
          [MAIL_EVENT_TYPES.SENT]: 5,
          [MAIL_EVENT_TYPES.RECEIVED]: 10,
          [CHAT_EVENT_TYPES.MESSAGE_SENT]: 3,
          [CHAT_EVENT_TYPES.MESSAGE_RECEIVED]: 7,
        },
        openThreadsCount: 4,
        awaitingThreads: ['t1', 't2'],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);

      expect(summary.communications.messages_sent).toBe(8);
      expect(summary.communications.messages_received).toBe(17);
      expect(summary.communications.threads_active).toBe(4);
      expect(summary.communications.threads_awaiting_reply).toBe(2);
    });
  });

  describe('top event types', () => {
    it('should return top 5 event types sorted by count', () => {
      const state = {
        lastSeen: {},
        counts24h: {
          [FILE_EVENT_TYPES.CREATED]: 100,
          [FILE_EVENT_TYPES.MOVED]: 50,
          [MAIL_EVENT_TYPES.RECEIVED]: 30,
          [CHAT_EVENT_TYPES.MESSAGE_SENT]: 20,
          [FILE_EVENT_TYPES.DELETED]: 10,
          [MAIL_EVENT_TYPES.SENT]: 5,
        },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);

      expect(summary.top_event_types).toHaveLength(5);
      expect(summary.top_event_types[0].type).toBe(FILE_EVENT_TYPES.CREATED);
      expect(summary.top_event_types[0].count).toBe(100);
      expect(summary.top_event_types[4].type).toBe(FILE_EVENT_TYPES.DELETED);
    });
  });

  describe('source activity', () => {
    it('should group events by source', () => {
      const state = {
        lastSeen: {
          files: '2024-01-15T10:00:00.000Z',
          mail: '2024-01-15T09:00:00.000Z',
        },
        counts24h: {
          [FILE_EVENT_TYPES.CREATED]: 5,
          [FILE_EVENT_TYPES.MOVED]: 3,
          [MAIL_EVENT_TYPES.RECEIVED]: 10,
        },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);

      const fileSource = summary.by_source.find((s) => s.source === EVENT_SOURCES.FILES);
      const mailSource = summary.by_source.find((s) => s.source === EVENT_SOURCES.MAIL);

      expect(fileSource?.event_count).toBe(8);
      expect(fileSource?.last_activity).toBe('2024-01-15T10:00:00.000Z');
      expect(mailSource?.event_count).toBe(10);
      expect(mailSource?.last_activity).toBe('2024-01-15T09:00:00.000Z');
    });
  });

  describe('meetings summary', () => {
    it('should format upcoming meetings', () => {
      const scheduledAt = Date.now() + 3600000;
      const state = {
        lastSeen: {},
        counts24h: {},
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [
          { meeting_id: 'meeting-1', scheduled_at: scheduledAt },
          { meeting_id: 'meeting-2', scheduled_at: scheduledAt + 7200000 },
        ],
      };

      const summary = service.buildSummary('user-1', '2024-01-15', state);

      expect(summary.meetings.total_scheduled).toBe(2);
      expect(summary.meetings.upcoming_24h).toBe(2);
      expect(summary.meetings.meetings).toHaveLength(2);
      expect(summary.meetings.meetings[0].meeting_id).toBe('meeting-1');
    });
  });
});

describe('buildSummaryKey', () => {
  it('should generate correct Redis key format', () => {
    const key = buildSummaryKey('user-123', '2024-01-15');
    expect(key).toBe('summary:user:user-123:2024-01-15');
  });
});
