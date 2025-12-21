/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import { AwaitingReplyRule, HighVolumeInboxRule } from '../communication';
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

describe('Communication Rules', () => {
  describe('AwaitingReplyRule', () => {
    let rule: AwaitingReplyRule;

    beforeEach(() => {
      rule = new AwaitingReplyRule();
    });

    it('returns empty when no threads awaiting reply', () => {
      const context = createTestContext();

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for awaiting thread', () => {
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 'thread-1', last_activity: Date.now() - 1000 }],
          awaiting_reply: ['thread-1'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].class).toBe(RECOMMENDATION_CLASSES.COMMUNICATION);
      expect(results[0].context_id).toBe('thread-1');
    });

    it('increases score for stale threads (3+ days)', () => {
      const threeDaysAgo = Date.now() - 3 * 24 * 60 * 60 * 1000;
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 'thread-1', last_activity: threeDaysAgo }],
          awaiting_reply: ['thread-1'],
        },
      });

      const results = rule.evaluate(context);

      expect(results[0].score).toBeGreaterThan(0.6);
      expect(results[0].rationale).toContain('awaiting your response');
    });

    it('marks high priority for very stale threads (5+ days)', () => {
      const fiveDaysAgo = Date.now() - 5 * 24 * 60 * 60 * 1000;
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 'thread-1', last_activity: fiveDaysAgo }],
          awaiting_reply: ['thread-1'],
        },
      });

      const results = rule.evaluate(context);

      expect(results[0].tags).toContain('high-priority');
      expect(results[0].score).toBeGreaterThan(0.9);
    });

    it('generates multiple recommendations for multiple threads', () => {
      const context = createTestContext({
        communications: {
          open_threads: [
            { thread_id: 'thread-1', last_activity: Date.now() },
            { thread_id: 'thread-2', last_activity: Date.now() },
          ],
          awaiting_reply: ['thread-1', 'thread-2'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(2);
    });
  });

  describe('HighVolumeInboxRule', () => {
    let rule: HighVolumeInboxRule;

    beforeEach(() => {
      rule = new HighVolumeInboxRule();
    });

    it('returns empty when below threshold', () => {
      const context = createTestContext({
        communications: {
          open_threads: [],
          awaiting_reply: ['t1', 't2', 't3'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation when at threshold', () => {
      const context = createTestContext({
        communications: {
          open_threads: [],
          awaiting_reply: ['t1', 't2', 't3', 't4', 't5'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rationale).toContain('threads');
      expect(results[0].tags).toContain('backlog');
    });

    it('increases score with more threads', () => {
      const context5 = createTestContext({
        communications: { open_threads: [], awaiting_reply: Array<string>(5).fill('t') },
      });
      const context10 = createTestContext({
        communications: { open_threads: [], awaiting_reply: Array<string>(10).fill('t') },
      });

      const results5 = rule.evaluate(context5);
      const results10 = rule.evaluate(context10);

      expect(results10[0].score).toBeGreaterThan(results5[0].score);
    });

    it('respects custom threshold', () => {
      rule.setConfig({ enabled: true, thresholds: { awaiting_count: 10 } });
      const context = createTestContext({
        communications: { open_threads: [], awaiting_reply: Array<string>(8).fill('t') },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });
  });
});
