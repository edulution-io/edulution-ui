/*
 * LICENSE PLACEHOLDER
 */

import { containsNumerals, validateNoNumerals } from '../validators/safety.validator';
import type { AiDailyPlan } from '../schemas/daily-plan.schema';

describe('Safety Validator', () => {
  describe('containsNumerals', () => {
    it('should detect numerals', () => {
      expect(containsNumerals('You have 5 meetings')).toBe(true);
      expect(containsNumerals('Meeting at 10:00')).toBe(true);
      expect(containsNumerals('Check 3 items')).toBe(true);
      expect(containsNumerals('Room 101')).toBe(true);
    });

    it('should pass clean text', () => {
      expect(containsNumerals('You have several meetings')).toBe(false);
      expect(containsNumerals('Meeting later today')).toBe(false);
      expect(containsNumerals('Check a few items')).toBe(false);
      expect(containsNumerals('The main conference room')).toBe(false);
    });

    it('should handle empty strings', () => {
      expect(containsNumerals('')).toBe(false);
    });
  });

  describe('validateNoNumerals', () => {
    const createValidPlan = (): AiDailyPlan => ({
      user_id: 'test-user',
      date: '2025-12-20',
      plan_title: 'Your productive day ahead',
      priorities: [
        {
          rank: 1,
          title: 'Handle pending communications',
          why: 'Several conversations are awaiting your response.',
          linked_candidate_ids: [],
        },
      ],
      schedule_suggestion: [
        {
          time_window: 'morning',
          focus: 'Communication catch-up',
          items: ['Check messages', 'Reply to pending threads'],
        },
      ],
      recap: 'Focus on clearing communication backlog this morning.',
      notes: [],
      safety: { no_new_facts: true, numerals_allowed: false, checked: true },
      generated_at: new Date().toISOString(),
    });

    it('should pass valid plan without numerals', () => {
      const plan = createValidPlan();
      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject plan with numerals in plan_title', () => {
      const plan = createValidPlan();
      plan.plan_title = 'You have 3 priorities today';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('plan_title');
    });

    it('should reject plan with numerals in priority title', () => {
      const plan = createValidPlan();
      plan.priorities[0].title = 'Review 5 emails';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('priorities[0].title');
    });

    it('should reject plan with numerals in priority why', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'You received 10 messages today';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('priorities[0].why');
    });

    it('should reject plan with numerals in schedule focus', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].focus = 'Complete 4 tasks';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].focus');
    });

    it('should reject plan with numerals in schedule items', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].items = ['Check 2 reports'];

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].items[0]');
    });

    it('should reject plan with numerals in recap', () => {
      const plan = createValidPlan();
      plan.recap = 'You have 7 meetings scheduled for tomorrow.';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('recap');
    });

    it('should reject plan with numerals in notes', () => {
      const plan = createValidPlan();
      plan.notes = ['Remember to check room 101'];

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('notes[0]');
    });

    it('should report multiple violations', () => {
      const plan = createValidPlan();
      plan.plan_title = '3 things to do';
      plan.recap = 'Complete 5 tasks by 4pm';

      const result = validateNoNumerals(plan);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(2);
    });
  });
});
