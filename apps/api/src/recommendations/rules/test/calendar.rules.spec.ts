/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import { MeetingPrepRule, BusyDayRule } from '../calendar';
import type { RuleContext } from '../rule.interface';

const createTestContext = (overrides: Partial<RuleContext> = {}): RuleContext => ({
  user_id: 'test-user',
  timestamp: Date.now(),
  signals: {
    activity_level: 'medium',
    primary_source: null,
    pending_communications: 0,
    upcoming_meetings: 0,
    last_computed: new Date().toISOString(),
  },
  last_seen: {},
  counts_1h: {},
  counts_24h: {},
  communications: {
    open_threads: [],
    awaiting_reply: [],
  },
  upcoming_meetings: [],
  ...overrides,
});

describe('Calendar Rules', () => {
  describe('MeetingPrepRule', () => {
    let rule: MeetingPrepRule;

    beforeEach(() => {
      rule = new MeetingPrepRule();
    });

    it('returns empty when no upcoming meetings', () => {
      const context = createTestContext();

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when meeting is too far out (>2h)', () => {
      const threeHoursLater = Date.now() + 3 * 60 * 60 * 1000;
      const context = createTestContext({
        upcoming_meetings: [{ meeting_id: 'meeting-1', scheduled_at: threeHoursLater }],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for meeting within 2 hours', () => {
      const oneHourLater = Date.now() + 60 * 60 * 1000;
      const context = createTestContext({
        upcoming_meetings: [{ meeting_id: 'meeting-1', scheduled_at: oneHourLater }],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].class).toBe(RECOMMENDATION_CLASSES.MEETING);
      expect(results[0].context_id).toBe('meeting-1');
      expect(results[0].rationale).toContain('Meeting');
    });

    it('marks imminent for meeting within 30 minutes', () => {
      const twentyMinutesLater = Date.now() + 20 * 60 * 1000;
      const context = createTestContext({
        upcoming_meetings: [{ meeting_id: 'meeting-1', scheduled_at: twentyMinutesLater }],
      });

      const results = rule.evaluate(context);

      expect(results[0].tags).toContain('imminent');
      expect(results[0].tags).toContain('high-priority');
      expect(results[0].score).toBeGreaterThan(0.85);
    });

    it('ignores past meetings', () => {
      const tenMinutesAgo = Date.now() - 10 * 60 * 1000;
      const context = createTestContext({
        upcoming_meetings: [{ meeting_id: 'meeting-1', scheduled_at: tenMinutesAgo }],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendations for multiple meetings', () => {
      const now = Date.now();
      const context = createTestContext({
        upcoming_meetings: [
          { meeting_id: 'meeting-1', scheduled_at: now + 30 * 60 * 1000 },
          { meeting_id: 'meeting-2', scheduled_at: now + 90 * 60 * 1000 },
        ],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(2);
    });
  });

  describe('BusyDayRule', () => {
    let rule: BusyDayRule;

    beforeEach(() => {
      rule = new BusyDayRule();
    });

    it('returns empty when below threshold', () => {
      const context = createTestContext({
        upcoming_meetings: [
          { meeting_id: 'm1', scheduled_at: Date.now() + 60000 },
          { meeting_id: 'm2', scheduled_at: Date.now() + 120000 },
        ],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation at threshold', () => {
      const now = Date.now();
      const context = createTestContext({
        upcoming_meetings: [
          { meeting_id: 'm1', scheduled_at: now + 60000 },
          { meeting_id: 'm2', scheduled_at: now + 120000 },
          { meeting_id: 'm3', scheduled_at: now + 180000 },
        ],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rationale).toContain('busy');
      expect(results[0].tags).toContain('busy-day');
    });

    it('increases score with more meetings', () => {
      const now = Date.now();
      const meetings3 = Array.from({ length: 3 }, (_, i) => ({
        meeting_id: `m${i}`,
        scheduled_at: now + i * 60000,
      }));
      const meetings5 = Array.from({ length: 5 }, (_, i) => ({
        meeting_id: `m${i}`,
        scheduled_at: now + i * 60000,
      }));

      const results3 = rule.evaluate(createTestContext({ upcoming_meetings: meetings3 }));
      const results5 = rule.evaluate(createTestContext({ upcoming_meetings: meetings5 }));

      expect(results5[0].score).toBeGreaterThan(results3[0].score);
    });
  });
});
