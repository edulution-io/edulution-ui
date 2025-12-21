/*
 * LICENSE PLACEHOLDER
 */

/* eslint-disable max-classes-per-file */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import BaseRule from '../base.rule';
import type { RuleContext, RuleResult } from '../rule.interface';

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

class TestRule extends BaseRule {
  readonly id = 'test:rule';

  readonly name = 'Test Rule';

  readonly class = RECOMMENDATION_CLASSES.COMMUNICATION;

  readonly priority = 50;

  evaluate(_context: RuleContext): RuleResult[] {
    if (!this.isEnabled()) return [];

    return [
      this.createResult({
        class: this.class,
        title: 'Test',
        rationale: 'Test rationale',
        score: 0.5,
        evidence: [],
      }),
    ];
  }

  testGetThreshold(key: string, defaultValue: number): number {
    return this.getThreshold(key, defaultValue);
  }

  static testDaysSince(timestamp: number | string, now: number): number {
    return BaseRule.daysSince(timestamp, now);
  }

  static testHoursSince(timestamp: number | string, now: number): number {
    return BaseRule.hoursSince(timestamp, now);
  }

  static testMinutesUntil(timestamp: number | string, now: number): number {
    return BaseRule.minutesUntil(timestamp, now);
  }
}

describe('BaseRule', () => {
  let rule: TestRule;

  beforeEach(() => {
    rule = new TestRule();
  });

  describe('time utilities', () => {
    it('calculates days since timestamp', () => {
      const now = Date.now();
      const threeDaysAgo = now - 3 * 24 * 60 * 60 * 1000;

      const days = TestRule.testDaysSince(threeDaysAgo, now);

      expect(days).toBeCloseTo(3, 1);
    });

    it('calculates days since ISO string', () => {
      const now = Date.now();
      const twoDaysAgo = new Date(now - 2 * 24 * 60 * 60 * 1000).toISOString();

      const days = TestRule.testDaysSince(twoDaysAgo, now);

      expect(days).toBeCloseTo(2, 1);
    });

    it('calculates hours since timestamp', () => {
      const now = Date.now();
      const fiveHoursAgo = now - 5 * 60 * 60 * 1000;

      const hours = TestRule.testHoursSince(fiveHoursAgo, now);

      expect(hours).toBeCloseTo(5, 1);
    });

    it('calculates minutes until future timestamp', () => {
      const now = Date.now();
      const thirtyMinutesLater = now + 30 * 60 * 1000;

      const minutes = TestRule.testMinutesUntil(thirtyMinutesLater, now);

      expect(minutes).toBeCloseTo(30, 1);
    });

    it('returns negative for past timestamps in minutesUntil', () => {
      const now = Date.now();
      const tenMinutesAgo = now - 10 * 60 * 1000;

      const minutes = TestRule.testMinutesUntil(tenMinutesAgo, now);

      expect(minutes).toBeCloseTo(-10, 1);
    });
  });

  describe('createResult', () => {
    it('creates result with generated rule_id', () => {
      const context = createTestContext();
      const results = rule.evaluate(context);

      expect(results).toHaveLength(1);
      expect(results[0].rule_id).toMatch(/^test:rule:/);
    });

    it('clamps score to 0-1 range', () => {
      const ruleWithHighScore = new (class extends TestRule {
        evaluate(): RuleResult[] {
          return [
            this.createResult({
              class: this.class,
              title: 'Test',
              rationale: 'Test',
              score: 1.5,
              evidence: [],
            }),
          ];
        }
      })();

      const results = ruleWithHighScore.evaluate(createTestContext());

      expect(results[0].score).toBe(1);
    });

    it('clamps negative score to 0', () => {
      const ruleWithNegativeScore = new (class extends TestRule {
        evaluate(): RuleResult[] {
          return [
            this.createResult({
              class: this.class,
              title: 'Test',
              rationale: 'Test',
              score: -0.5,
              evidence: [],
            }),
          ];
        }
      })();

      const results = ruleWithNegativeScore.evaluate(createTestContext());

      expect(results[0].score).toBe(0);
    });
  });

  describe('configuration', () => {
    it('returns default threshold when not configured', () => {
      const threshold = rule.testGetThreshold('test_key', 10);

      expect(threshold).toBe(10);
    });

    it('returns configured threshold', () => {
      rule.setConfig({ enabled: true, thresholds: { test_key: 25 } });

      const threshold = rule.testGetThreshold('test_key', 10);

      expect(threshold).toBe(25);
    });

    it('can be disabled', () => {
      rule.setConfig({ enabled: false });

      const results = rule.evaluate(createTestContext());

      expect(results).toHaveLength(0);
    });
  });
});
