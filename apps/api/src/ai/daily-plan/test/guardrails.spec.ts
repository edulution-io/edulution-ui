/*
 * LICENSE PLACEHOLDER
 */

import type { AiDailyPlan } from '../schemas/daily-plan.schema';
import {
  checkNoNumerals,
  checkCandidateIdIntegrity,
  checkNoForbiddenClaims,
  checkNoForbiddenTimeClaims,
  checkActivityLevelClaims,
  runAllGuardrails,
} from '../validators/guardrails';
import { repairActivityClaims, repairPlanActivityClaims } from '../fallback/text-repair';

describe('Guardrails', () => {
  const createValidPlan = (): AiDailyPlan => ({
    user_id: 'test-user',
    date: '2025-12-20',
    plan_title: 'Your day ahead',
    priorities: [
      {
        rank: 1,
        title: 'Review pending communications',
        why: 'Several conversations may need your attention.',
        linked_candidate_ids: ['cand-1'],
      },
      {
        rank: 2,
        title: 'Prepare for discussion',
        why: 'A scheduled event may require preparation.',
        linked_candidate_ids: ['cand-2'],
      },
    ],
    schedule_suggestion: [
      {
        time_window: 'morning',
        focus: 'Communications',
        items: ['Check messages', 'Review items'],
      },
    ],
    recap: 'Focus on communications first.',
    notes: [],
    safety: {
      no_new_facts: true,
      numerals_allowed: false,
      checked: true,
    },
    generated_at: '2025-12-20T10:00:00.000Z',
  });

  describe('checkNoNumerals', () => {
    it('should pass when no numerals present', () => {
      const plan = createValidPlan();
      const result = checkNoNumerals(plan);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.canRepair).toBe(true);
    });

    it('should fail when plan_title contains numerals', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Your day with 3 meetings';
      const result = checkNoNumerals(plan);

      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('plan_title');
    });

    it('should fail when priority title contains numerals', () => {
      const plan = createValidPlan();
      plan.priorities[0].title = 'Review 5 pending items';
      const result = checkNoNumerals(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('priorities[0].title');
    });

    it('should fail when schedule item contains numerals', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].items[0] = 'Check 10 messages';
      const result = checkNoNumerals(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].items[0]');
    });

    it('should fail when recap contains numerals', () => {
      const plan = createValidPlan();
      plan.recap = 'You have 2 urgent tasks.';
      const result = checkNoNumerals(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('recap');
    });
  });

  describe('checkCandidateIdIntegrity', () => {
    it('should pass when all candidate IDs are valid', () => {
      const plan = createValidPlan();
      const allowedIds = new Set(['cand-1', 'cand-2', 'cand-3']);
      const result = checkCandidateIdIntegrity(plan, allowedIds);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when candidate ID is not in allowed set', () => {
      const plan = createValidPlan();
      plan.priorities[0].linked_candidate_ids = ['invalid-id'];
      const allowedIds = new Set(['cand-1', 'cand-2']);
      const result = checkCandidateIdIntegrity(plan, allowedIds);

      expect(result.valid).toBe(false);
      expect(result.violations).toHaveLength(1);
      expect(result.violations[0]).toContain('unknown ID: invalid-id');
    });

    it('should fail when linked_candidate_ids is empty and recommendations exist', () => {
      const plan = createValidPlan();
      plan.priorities[0].linked_candidate_ids = [];
      const allowedIds = new Set(['cand-1', 'cand-2']);
      const result = checkCandidateIdIntegrity(plan, allowedIds);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('empty linked_candidate_ids');
    });

    it('should pass when no recommendations exist', () => {
      const plan = createValidPlan();
      plan.priorities[0].linked_candidate_ids = [];
      const allowedIds = new Set<string>();
      const result = checkCandidateIdIntegrity(plan, allowedIds);

      expect(result.valid).toBe(true);
    });
  });

  describe('checkNoForbiddenClaims', () => {
    it('should pass when no forbidden phrases present', () => {
      const plan = createValidPlan();
      const result = checkNoForbiddenClaims(plan);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should fail when "no meetings" appears in recap', () => {
      const plan = createValidPlan();
      plan.recap = 'You have no meetings today.';
      const result = checkNoForbiddenClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThanOrEqual(1);
      expect(result.violations.some((v) => v.includes('recap'))).toBe(true);
    });

    it('should fail when "no meeting" appears in plan_title', () => {
      const plan = createValidPlan();
      plan.plan_title = 'A day with no meeting scheduled';
      const result = checkNoForbiddenClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('plan_title');
    });

    it('should fail when forbidden phrase in priority why', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = "You don't have any meeting today.";
      const result = checkNoForbiddenClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('priorities[0].why');
    });

    it('should be case insensitive', () => {
      const plan = createValidPlan();
      plan.recap = 'NO MEETINGS on your calendar.';
      const result = checkNoForbiddenClaims(plan);

      expect(result.valid).toBe(false);
    });
  });

  describe('checkNoForbiddenTimeClaims', () => {
    it('should pass when no forbidden time words present', () => {
      const plan = createValidPlan();
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should reject "soon" in priority why', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'Meeting starts soon.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('soon');
      expect(result.violations[0]).toContain('priorities[0].why');
    });

    it('should reject "shortly" in recap', () => {
      const plan = createValidPlan();
      plan.recap = 'Your meeting will begin shortly.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('recap');
    });

    it('should reject "right now" in plan_title', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Focus right now on priorities';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('plan_title');
    });

    it('should reject "immediately" in schedule items', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].items[0] = 'Respond immediately';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].items[0]');
    });

    it('should reject "starting now" in schedule focus', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].focus = 'Starting now with communications';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].focus');
    });

    it('should allow "later today"', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'An upcoming meeting later today may need preparation.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(true);
    });

    it('should allow "upcoming"', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'Calendar shows an upcoming event.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(true);
    });

    it('should allow "when ready"', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'Review communications when ready.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(true);
    });

    it('should provide helpful alternatives in violation message', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'Meeting starts soon.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('later today');
      expect(result.violations[0]).toContain('upcoming');
    });

    it('should be case insensitive', () => {
      const plan = createValidPlan();
      plan.recap = 'Respond SOON to messages.';
      const result = checkNoForbiddenTimeClaims(plan);

      expect(result.valid).toBe(false);
    });
  });

  describe('checkActivityLevelClaims', () => {
    it('should pass when no activity claims present', () => {
      const plan = createValidPlan();
      const result = checkActivityLevelClaims(plan, undefined);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should pass when activity claim matches summary level', () => {
      const plan = createValidPlan();
      plan.recap = 'Due to high activity, focus on priorities.';
      const result = checkActivityLevelClaims(plan, 'high');

      expect(result.valid).toBe(true);
    });

    it('should reject "low activity" when summary.activity_level is missing', () => {
      const plan = createValidPlan();
      plan.recap = 'Low activity period today.';
      const result = checkActivityLevelClaims(plan, undefined);

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('low activity');
      expect(result.violations[0]).toContain('missing');
    });

    it('should reject "high activity" when summary.activity_level is "low"', () => {
      const plan = createValidPlan();
      plan.priorities[0].why = 'High activity indicates busy day.';
      const result = checkActivityLevelClaims(plan, 'low');

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('high activity');
      expect(result.violations[0]).toContain('"low"');
    });

    it('should reject "busy day" when summary.activity_level is "low"', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Managing a busy day';
      const result = checkActivityLevelClaims(plan, 'low');

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('high activity');
    });

    it('should reject "quiet period" when summary.activity_level is "high"', () => {
      const plan = createValidPlan();
      plan.recap = 'A quiet period for focused work.';
      const result = checkActivityLevelClaims(plan, 'high');

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('low activity');
    });

    it('should check schedule_suggestion fields', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].focus = 'Low activity tasks';
      const result = checkActivityLevelClaims(plan, 'high');

      expect(result.valid).toBe(false);
      expect(result.violations[0]).toContain('schedule_suggestion[0].focus');
    });
  });

  describe('repairActivityClaims', () => {
    it('should repair "low activity" to "a quieter window"', () => {
      const result = repairActivityClaims('low activity period today.');
      expect(result).toBe('a quieter window period today.');
    });

    it('should repair "high activity" to "increased activity"', () => {
      const result = repairActivityClaims('high activity indicates focus needed.');
      expect(result).toBe('increased activity indicates focus needed.');
    });

    it('should repair "busy day" to "a full schedule"', () => {
      const result = repairActivityClaims('Managing a busy day ahead.');
      expect(result).toBe('Managing a full schedule ahead.');
    });

    it('should repair "Quiet day" to "Available time"', () => {
      const result = repairActivityClaims('Quiet day for catching up.');
      expect(result).toBe('Available time for catching up.');
    });
  });

  describe('repairPlanActivityClaims', () => {
    it('should repair activity claims in all plan fields', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Managing high activity';
      plan.recap = 'low activity period.';
      plan.priorities[0].why = 'Busy day ahead.';
      plan.schedule_suggestion[0].focus = 'Quiet period tasks';

      const repaired = repairPlanActivityClaims(plan);

      expect(repaired.plan_title).toBe('Managing increased activity');
      expect(repaired.recap).toBe('a quieter window period.');
      expect(repaired.priorities[0].why).toBe('A full schedule ahead.');
      expect(repaired.schedule_suggestion[0].focus).toBe('A calmer period tasks');
    });

    it('should repair schedule items', () => {
      const plan = createValidPlan();
      plan.schedule_suggestion[0].items = ['Handle high activity period'];

      const repaired = repairPlanActivityClaims(plan);

      expect(repaired.schedule_suggestion[0].items[0]).toBe('Handle increased activity period');
    });
  });

  describe('runAllGuardrails', () => {
    it('should pass when all guardrails pass', () => {
      const plan = createValidPlan();
      const allowedIds = new Set(['cand-1', 'cand-2']);
      const result = runAllGuardrails(plan, allowedIds);

      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
      expect(result.canRepair).toBe(true);
    });

    it('should aggregate violations from multiple guardrails', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Day with 3 tasks';
      plan.recap = 'No meetings scheduled.';
      plan.priorities[0].linked_candidate_ids = ['invalid-id'];
      const allowedIds = new Set(['cand-2']);

      const result = runAllGuardrails(plan, allowedIds);

      expect(result.valid).toBe(false);
      expect(result.violations.length).toBeGreaterThan(1);
    });

    it('should set canRepair to true when all violations are repairable', () => {
      const plan = createValidPlan();
      plan.plan_title = 'Day with 5 meetings';
      const allowedIds = new Set(['cand-1', 'cand-2']);

      const result = runAllGuardrails(plan, allowedIds);

      expect(result.valid).toBe(false);
      expect(result.canRepair).toBe(true);
    });
  });
});
