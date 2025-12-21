/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import { StaleThreadsRule, InboxZeroRule, OrganizeFilesRule } from '../cleanup';
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

describe('Cleanup Rules', () => {
  describe('StaleThreadsRule', () => {
    let rule: StaleThreadsRule;

    beforeEach(() => {
      rule = new StaleThreadsRule();
    });

    it('returns empty when no stale threads', () => {
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 't1', last_activity: Date.now() - 1000 }],
          awaiting_reply: [],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for thread stale 7+ days', () => {
      const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 't1', last_activity: sevenDaysAgo }],
          awaiting_reply: [],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].class).toBe(RECOMMENDATION_CLASSES.CLEANUP);
      expect(results[0].rationale).toContain('inactive');
    });

    it('marks very stale for 14+ days', () => {
      const fourteenDaysAgo = Date.now() - 14 * 24 * 60 * 60 * 1000;
      const context = createTestContext({
        communications: {
          open_threads: [{ thread_id: 't1', last_activity: fourteenDaysAgo }],
          awaiting_reply: [],
        },
      });

      const results = rule.evaluate(context);

      expect(results[0].tags).toContain('very-stale');
    });

    it('aggregates multiple stale threads into one recommendation', () => {
      const tenDaysAgo = Date.now() - 10 * 24 * 60 * 60 * 1000;
      const context = createTestContext({
        communications: {
          open_threads: [
            { thread_id: 't1', last_activity: tenDaysAgo },
            { thread_id: 't2', last_activity: tenDaysAgo },
            { thread_id: 't3', last_activity: tenDaysAgo },
          ],
          awaiting_reply: [],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rationale).toContain('Several threads');
    });
  });

  describe('InboxZeroRule', () => {
    let rule: InboxZeroRule;

    beforeEach(() => {
      rule = new InboxZeroRule();
    });

    it('returns empty when too many awaiting replies', () => {
      const context = createTestContext({
        communications: {
          open_threads: [],
          awaiting_reply: ['t1', 't2', 't3', 't4'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when already at inbox zero', () => {
      const context = createTestContext({
        communications: { open_threads: [], awaiting_reply: [] },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when activity is high', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'high' }),
        communications: {
          open_threads: [{ thread_id: 't1', last_activity: Date.now() }],
          awaiting_reply: ['t1'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation when close to inbox zero', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'low' }),
        communications: {
          open_threads: [{ thread_id: 't1', last_activity: Date.now() }],
          awaiting_reply: ['t1'],
        },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].tags).toContain('inbox-zero');
      expect(results[0].tags).toContain('quick-win');
    });
  });

  describe('OrganizeFilesRule', () => {
    let rule: OrganizeFilesRule;

    beforeEach(() => {
      rule = new OrganizeFilesRule();
    });

    it('returns empty when below file event threshold', () => {
      const context = createTestContext({
        counts_24h: { 'file.created': 5, 'file.moved': 5 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('returns empty when activity is high', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'high' }),
        counts_24h: { 'file.created': 15, 'file.moved': 10 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });

    it('generates recommendation for high file activity', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'medium' }),
        counts_24h: { 'file.created': 15, 'file.moved': 10 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rationale).toContain('file activity');
      expect(results[0].tags).toContain('files');
    });

    it('only counts file events', () => {
      const context = createTestContext({
        signals: createSignals({ activity_level: 'medium' }),
        counts_24h: { 'file.created': 5, 'mail.received': 50 },
      });

      const results = rule.evaluate(context);

      expect(results).toHaveLength(0);
    });
  });
});
