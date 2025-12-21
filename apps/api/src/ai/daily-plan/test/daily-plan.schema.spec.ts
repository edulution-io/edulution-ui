/*
 * LICENSE PLACEHOLDER
 */

import { AiDailyPlanSchema, PriorityItemSchema, ScheduleItemSchema } from '../schemas/daily-plan.schema';

describe('Daily Plan Schema', () => {
  describe('PriorityItemSchema', () => {
    it('should validate valid priority item', () => {
      const item = {
        rank: 1,
        title: 'Handle communications',
        why: 'Several threads are awaiting your response.',
        linked_candidate_ids: ['cand-123'],
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should reject rank out of range', () => {
      const item = {
        rank: 10,
        title: 'Task',
        why: 'Reason',
        linked_candidate_ids: [],
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject title too long', () => {
      const item = {
        rank: 1,
        title: 'A'.repeat(101),
        why: 'Reason',
        linked_candidate_ids: [],
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should default linked_candidate_ids to empty array', () => {
      const item = {
        rank: 1,
        title: 'Task',
        why: 'Reason',
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.linked_candidate_ids).toEqual([]);
      }
    });

    it('should reject empty title', () => {
      const item = {
        rank: 1,
        title: '',
        why: 'Reason',
        linked_candidate_ids: [],
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject empty why', () => {
      const item = {
        rank: 1,
        title: 'Task',
        why: '',
        linked_candidate_ids: [],
      };

      const result = PriorityItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('ScheduleItemSchema', () => {
    it('should validate valid schedule item', () => {
      const item = {
        time_window: 'morning',
        focus: 'Deep work session',
        items: ['Review documents', 'Prepare presentation'],
      };

      const result = ScheduleItemSchema.safeParse(item);
      expect(result.success).toBe(true);
    });

    it('should reject invalid time_window', () => {
      const item = {
        time_window: 'night',
        focus: 'Work',
        items: ['Task'],
      };

      const result = ScheduleItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should accept all valid time windows', () => {
      const windows = ['morning', 'midday', 'afternoon', 'evening'];

      windows.forEach((time_window) => {
        const item = { time_window, focus: 'Work', items: ['Task'] };
        const result = ScheduleItemSchema.safeParse(item);
        expect(result.success).toBe(true);
      });
    });

    it('should reject empty items array', () => {
      const item = {
        time_window: 'morning',
        focus: 'Work',
        items: [],
      };

      const result = ScheduleItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject empty focus string', () => {
      const item = {
        time_window: 'morning',
        focus: '',
        items: ['Task'],
      };

      const result = ScheduleItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });

    it('should reject too many items', () => {
      const item = {
        time_window: 'morning',
        focus: 'Work',
        items: ['One', 'Two', 'Three', 'Four', 'Five', 'Six'],
      };

      const result = ScheduleItemSchema.safeParse(item);
      expect(result.success).toBe(false);
    });
  });

  describe('AiDailyPlanSchema', () => {
    const createValidPlan = () => ({
      user_id: 'test-user',
      date: '2025-12-20',
      plan_title: 'Your day ahead',
      priorities: [
        {
          rank: 1,
          title: 'Review communications',
          why: 'Several conversations need attention.',
          linked_candidate_ids: [],
        },
      ],
      schedule_suggestion: [
        {
          time_window: 'morning' as const,
          focus: 'Catch-up',
          items: ['Check messages'],
        },
      ],
      recap: 'Focus on communication this morning.',
      notes: [],
      safety: {
        no_new_facts: true as const,
        numerals_allowed: false as const,
        checked: true as const,
      },
      generated_at: new Date().toISOString(),
    });

    it('should validate complete valid plan', () => {
      const plan = createValidPlan();
      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(true);
    });

    it('should reject invalid date format', () => {
      const plan = createValidPlan();
      plan.date = '20-12-2025';

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should reject empty priorities', () => {
      const plan = createValidPlan();
      plan.priorities = [];

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should reject too many priorities', () => {
      const plan = createValidPlan();
      plan.priorities = Array(7)
        .fill(null)
        .map((_, i) => ({
          rank: i + 1,
          title: `Priority ${i}`,
          why: 'Reason',
          linked_candidate_ids: [],
        }));

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should reject invalid safety values', () => {
      const plan = createValidPlan();
      (plan.safety as Record<string, unknown>).no_new_facts = false;

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should default notes to empty array', () => {
      const plan = createValidPlan();
      delete (plan as Record<string, unknown>).notes;

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.notes).toEqual([]);
      }
    });

    it('should reject empty schedule_suggestion', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion = [];

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should reject empty plan_title', () => {
      const plan = createValidPlan();
      plan.plan_title = '';

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should reject empty recap', () => {
      const plan = createValidPlan();
      plan.recap = '';

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(false);
    });

    it('should accept generated_at without datetime validation', () => {
      const plan = createValidPlan();
      plan.generated_at = 'SET_BY_SERVICE';

      const result = AiDailyPlanSchema.safeParse(plan);
      expect(result.success).toBe(true);
    });
  });
});
