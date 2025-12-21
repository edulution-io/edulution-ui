/*
 * LICENSE PLACEHOLDER
 */

import { RECOMMENDATION_CLASSES } from '@edulution/events';
import { getAllRules, getRulesByClass, getRuleById, ALL_RULES } from '../scoring-rules';

describe('Scoring Rules', () => {
  describe('getAllRules', () => {
    it('returns all registered rules', () => {
      const rules = getAllRules();

      expect(rules.length).toBe(13);
    });

    it('returns new array on each call', () => {
      const rules1 = getAllRules();
      const rules2 = getAllRules();

      expect(rules1).not.toBe(rules2);
      expect(rules1).toEqual(rules2);
    });
  });

  describe('getRulesByClass', () => {
    it('returns communication rules', () => {
      const rules = getRulesByClass(RECOMMENDATION_CLASSES.COMMUNICATION);

      expect(rules.length).toBe(2);
      rules.forEach((rule) => {
        expect(rule.class).toBe(RECOMMENDATION_CLASSES.COMMUNICATION);
      });
    });

    it('returns meeting rules', () => {
      const rules = getRulesByClass(RECOMMENDATION_CLASSES.MEETING);

      expect(rules.length).toBe(2);
      rules.forEach((rule) => {
        expect(rule.class).toBe(RECOMMENDATION_CLASSES.MEETING);
      });
    });

    it('returns focus rules', () => {
      const rules = getRulesByClass(RECOMMENDATION_CLASSES.FOCUS);

      expect(rules.length).toBe(3);
    });

    it('returns planning rules', () => {
      const rules = getRulesByClass(RECOMMENDATION_CLASSES.PLANNING);

      expect(rules.length).toBe(3);
    });

    it('returns cleanup rules', () => {
      const rules = getRulesByClass(RECOMMENDATION_CLASSES.CLEANUP);

      expect(rules.length).toBe(3);
    });

    it('returns empty array for unknown class', () => {
      const rules = getRulesByClass('unknown');

      expect(rules).toHaveLength(0);
    });
  });

  describe('getRuleById', () => {
    it('returns rule by id', () => {
      const rule = getRuleById('reco.comm.awaiting_reply');

      expect(rule).toBeDefined();
      expect(rule?.id).toBe('reco.comm.awaiting_reply');
      expect(rule?.name).toBe('Awaiting Reply Detection');
    });

    it('returns undefined for unknown id', () => {
      const rule = getRuleById('unknown:rule');

      expect(rule).toBeUndefined();
    });
  });

  describe('ALL_RULES', () => {
    it('has unique ids', () => {
      const ids = ALL_RULES.map((r) => r.id);
      const uniqueIds = new Set(ids);

      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all rules have required properties', () => {
      ALL_RULES.forEach((rule) => {
        expect(rule.id).toBeDefined();
        expect(rule.name).toBeDefined();
        expect(rule.class).toBeDefined();
        expect(typeof rule.priority).toBe('number');
        expect(typeof rule.evaluate).toBe('function');
      });
    });

    it('priorities are within expected range', () => {
      ALL_RULES.forEach((rule) => {
        expect(rule.priority).toBeGreaterThanOrEqual(0);
        expect(rule.priority).toBeLessThanOrEqual(100);
      });
    });
  });
});
