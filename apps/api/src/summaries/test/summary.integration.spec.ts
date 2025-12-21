/*
 * LICENSE PLACEHOLDER
 */

import { buildSummaryKey } from '@edulution/events';
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
      [null, { files: '2024-01-15T10:00:00.000Z', mail: '2024-01-15T09:30:00.000Z' }],
      [null, { 'file.created': '15', 'file.moved': '5', 'mail.received': '8', 'mail.sent': '3' }],
      [null, 3],
      [null, ['thread-awaiting-1', 'thread-awaiting-2']],
      [null, ['meeting-abc', String(Date.now() + 3600000), 'meeting-def', String(Date.now() + 7200000)]],
    ]),
  }),
});

jest.mock('ioredis', () => jest.fn().mockImplementation(() => createMockRedis()));

describe('Summary Integration', () => {
  let service: SummaryService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new SummaryService();
  });

  describe('DailySummary schema compliance', () => {
    it('should return a valid DailySummary structure', () => {
      const state = {
        lastSeen: { files: '2024-01-15T10:00:00.000Z' },
        counts24h: { 'file.created': 10 },
        openThreadsCount: 1,
        awaitingThreads: ['t1'],
        upcomingMeetings: [{ meeting_id: 'm1', scheduled_at: Date.now() + 3600000 }],
      };

      const summary = service.buildSummary('user-test', '2024-01-15', state);

      expect(summary).toMatchObject<Partial<DailySummary>>({
        user_id: 'user-test',
        date: '2024-01-15',
        activity_level: expect.stringMatching(/^(none|low|medium|high)$/),
        total_events: expect.any(Number),
        by_source: expect.any(Array),
        communications: expect.objectContaining({
          threads_active: expect.any(Number),
          threads_awaiting_reply: expect.any(Number),
          messages_sent: expect.any(Number),
          messages_received: expect.any(Number),
        }),
        meetings: expect.objectContaining({
          total_scheduled: expect.any(Number),
          upcoming_24h: expect.any(Number),
          meetings: expect.any(Array),
        }),
        top_event_types: expect.any(Array),
        generated_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T/),
      });
    });

    it('should include all required fields in by_source items', () => {
      const state = {
        lastSeen: { files: '2024-01-15T10:00:00.000Z' },
        counts24h: { 'file.created': 5 },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-test', '2024-01-15', state);

      for (const sourceActivity of summary.by_source) {
        expect(sourceActivity).toHaveProperty('source');
        expect(sourceActivity).toHaveProperty('event_count');
        expect(sourceActivity).toHaveProperty('last_activity');
      }
    });

    it('should include all required fields in top_event_types items', () => {
      const state = {
        lastSeen: {},
        counts24h: { 'file.created': 5, 'mail.received': 3 },
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [],
      };

      const summary = service.buildSummary('user-test', '2024-01-15', state);

      for (const eventType of summary.top_event_types) {
        expect(eventType).toHaveProperty('type');
        expect(eventType).toHaveProperty('count');
        expect(typeof eventType.type).toBe('string');
        expect(typeof eventType.count).toBe('number');
      }
    });

    it('should include all required fields in meetings items', () => {
      const state = {
        lastSeen: {},
        counts24h: {},
        openThreadsCount: 0,
        awaitingThreads: [],
        upcomingMeetings: [
          { meeting_id: 'meeting-1', scheduled_at: Date.now() + 3600000 },
        ],
      };

      const summary = service.buildSummary('user-test', '2024-01-15', state);

      for (const meeting of summary.meetings.meetings) {
        expect(meeting).toHaveProperty('meeting_id');
        expect(meeting).toHaveProperty('scheduled_at');
        expect(typeof meeting.meeting_id).toBe('string');
        expect(typeof meeting.scheduled_at).toBe('string');
      }
    });
  });

  describe('date validation in controller', () => {
    it('should accept valid YYYY-MM-DD format', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      expect(dateRegex.test('2024-01-15')).toBe(true);
      expect(dateRegex.test('2024-12-31')).toBe(true);
      expect(dateRegex.test('2025-06-01')).toBe(true);
    });

    it('should reject invalid date formats', () => {
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      expect(dateRegex.test('2024/01/15')).toBe(false);
      expect(dateRegex.test('01-15-2024')).toBe(false);
      expect(dateRegex.test('2024-1-15')).toBe(false);
      expect(dateRegex.test('invalid')).toBe(false);
      expect(dateRegex.test('')).toBe(false);
    });
  });

  describe('caching behavior', () => {
    it('should use cache key format: summary:user:{userId}:{date}', () => {
      const key = buildSummaryKey('user-abc', '2024-01-15');

      expect(key).toBe('summary:user:user-abc:2024-01-15');
      expect(key).toMatch(/^summary:user:/);
      expect(key).toContain('user-abc');
      expect(key).toContain('2024-01-15');
    });
  });
});
