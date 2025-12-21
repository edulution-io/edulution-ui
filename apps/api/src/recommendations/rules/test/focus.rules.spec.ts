/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import { FocusTimeRule, BreakSuggestionRule, LowActivityRule } from '../focus';
import type { RuleContext } from '../rule.interface';

const createSignals = (overrides: Partial<RuleContext['signals']> = {}): RuleContext['signals'] => ({
  activity_level: 'medium',
  primary_source: null,
  pending_communications: 0,
  upcoming_meetings: 0,
  last_computed: new Date().toISOString(),
  ...overrides,
});

const createTestContext = (overrides: Partial<RuleContext> = {}): RuleContext => ({
  user_id: 'test-user',
  timestamp: Date.now(),
  signals: createSignals(),
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

describe('Focus Rules', () => {
  describe('FocusTimeRule', () => {
    let rule: FocusTimeRule;

    beforeEach(() => {
      rule = new FocusTimeRule();
    });

    it('returns empty when activity is not high', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'medium' }),
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when meeting is within 2 hours', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'high' }),
        upcoming_meetings: [{ meeting_id: 'm1', scheduled_at: Date.now() + 60 * 60 * 1000 }],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for high activity with no upcoming meetings', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'high' }),
        upcoming_meetings: [],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].class).toBe(RECOMMENDATION_CLASSES.FOCUS);
      expect(results[0].tags).toContain('deep-work');
    });

    it('generates recommendation when meetings are far out (>2h)', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'high' }),
        upcoming_meetings: [{ meeting_id: 'm1', scheduled_at: Date.now() + 3 * 60 * 60 * 1000 }],
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
    });
  });

  describe('BreakSuggestionRule', () => {
    let rule: BreakSuggestionRule;

    beforeEach(() => {
      rule = new BreakSuggestionRule();
    });

    it('returns empty when activity is below threshold', () => {
      const context = createTestContext({
        counts_1h: { 'file.created': 20, 'mail.received': 10 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for high hourly activity', () => {
      const context = createTestContext({
        counts_1h: { 'file.created': 30, 'mail.received': 25 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rationale).toContain('high activity');
      expect(results[0].tags).toContain('break');
    });

    it('increases score with more events', () => {
      const context60 = createTestContext({ counts_1h: { events: 60 } });
      const context100 = createTestContext({ counts_1h: { events: 100 } });

      const results60 = rule.evaluate(context60);
      const results100 = rule.evaluate(context100);

      expect(results100[0].score).toBeGreaterThan(results60[0].score);
    });
  });

  describe('LowActivityRule', () => {
    let rule: LowActivityRule;

    beforeEach(() => {
      rule = new LowActivityRule();
    });

    it('returns empty when activity is medium or high', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'medium' }),
        communications: { open_threads: [], awaiting_reply: ['t1'] },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when no pending items', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'low' }),
        communications: { open_threads: [], awaiting_reply: [] },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for low activity with pending items', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'low' }),
        communications: { open_threads: [], awaiting_reply: ['t1', 't2'] },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('catch-up');
    });

    it('works with none activity level', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'none' }),
        communications: { open_threads: [], awaiting_reply: ['t1'] },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
    });
  });
});
