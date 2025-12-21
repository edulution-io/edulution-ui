/*
 * LICENSE PLACEHOLDER
 */

import type { RecommendationOutboxItem } from '@edulution/events';
import {
  generateDeterministicPlan,
  truncate,
  generateRecap,
  getStrings,
} from '../fallback/deterministic-plan';
import { AiDailyPlanSchema } from '../schemas/daily-plan.schema';
import { checkNoNumerals, checkCandidateIdIntegrity } from '../validators/guardrails';

describe('Deterministic Plan Generator', () => {
  const createMockRecommendations = (): RecommendationOutboxItem[] => [
    {
      candidate_id: 'cand-1',
      score: 0.9,
      created_at: '2025-12-20T10:00:00Z',
      class: 'communication',
      title: 'Reply to pending thread',
      rationale: 'Thread is awaiting your response.',
    },
    {
      candidate_id: 'cand-2',
      score: 0.85,
      created_at: '2025-12-20T10:00:00Z',
      class: 'meeting',
      title: 'Prepare for upcoming meeting',
      rationale: 'Meeting starts in a few hours.',
    },
    {
      candidate_id: 'cand-3',
      score: 0.8,
      created_at: '2025-12-20T10:00:00Z',
      class: 'focus',
      title: 'Complete project review',
      rationale: 'Project needs attention.',
    },
  ];

  describe('truncate', () => {
    it('should return text as-is when within limit', () => {
      expect(truncate('short text', 20)).toBe('short text');
    });

    it('should truncate and add ellipsis when exceeding limit', () => {
      expect(truncate('this is a very long text', 15)).toBe('this is a ve...');
    });

    it('should handle exact limit correctly', () => {
      expect(truncate('exactly', 7)).toBe('exactly');
    });
  });

  describe('getStrings', () => {
    it('should return German strings by default', () => {
      const strings = getStrings();
      expect(strings.planTitle).toBe('Deine Prioritäten für heute');
    });

    it('should return English strings for "en"', () => {
      const strings = getStrings('en');
      expect(strings.planTitle).toBe('Your priorities for today');
    });

    it('should return French strings for "fr"', () => {
      const strings = getStrings('fr');
      expect(strings.planTitle).toBe("Vos priorités pour aujourd'hui");
    });

    it('should normalize language codes', () => {
      const strings = getStrings('en-US');
      expect(strings.planTitle).toBe('Your priorities for today');
    });
  });

  describe('generateRecap', () => {
    it('should return default message when no priorities (German)', () => {
      expect(generateRecap([], [], 'de')).toBe('Überprüfe deinen Zeitplan und plane entsprechend.');
    });

    it('should return default message when no priorities (English)', () => {
      expect(generateRecap([], [], 'en')).toBe('Review your schedule and plan accordingly.');
    });

    it('should return single focus when one priority', () => {
      const recs = createMockRecommendations().slice(0, 1);
      const priorities = [{ rank: 1, title: 'Reply to pending thread', why: 'Test', linked_candidate_ids: ['cand-1'] }];
      expect(generateRecap(priorities, recs, 'en')).toContain('Reply to pending thread');
    });

    it('should return multiple focus areas when multiple priorities', () => {
      const recs = createMockRecommendations();
      const priorities = [
        { rank: 1, title: 'Reply to pending thread', why: 'Test', linked_candidate_ids: ['cand-1'] },
        { rank: 2, title: 'Prepare for upcoming meeting', why: 'Test', linked_candidate_ids: ['cand-2'] },
        { rank: 3, title: 'Complete project review', why: 'Test', linked_candidate_ids: ['cand-3'] },
      ];
      const recap = generateRecap(priorities, recs, 'en');
      expect(recap).toContain('Reply to pending thread');
      expect(recap).toContain('Prepare for upcoming meeting');
    });
  });

  describe('generateDeterministicPlan', () => {
    it('should generate valid plan structure (English)', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs, 'en');

      expect(plan.user_id).toBe('user-1');
      expect(plan.date).toBe('2025-12-20');
      expect(plan.plan_title).toBe('Your priorities for today');
      expect(plan.priorities).toBeDefined();
      expect(plan.schedule_suggestion).toBeDefined();
      expect(plan.recap).toBeDefined();
      expect(plan.safety).toEqual({
        no_new_facts: true,
        numerals_allowed: false,
        checked: true,
      });
    });

    it('should generate valid plan structure (German)', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs, 'de');

      expect(plan.plan_title).toBe('Deine Prioritäten für heute');
    });

    it('should generate valid plan structure (French)', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs, 'fr');

      expect(plan.plan_title).toBe("Vos priorités pour aujourd'hui");
    });

    it('should create priorities from top recommendations', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      expect(plan.priorities).toHaveLength(3);
      expect(plan.priorities[0].rank).toBe(1);
      expect(plan.priorities[0].title).toBe('Reply to pending thread');
      expect(plan.priorities[0].linked_candidate_ids).toEqual(['cand-1']);
    });

    it('should link candidate_ids correctly', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      expect(plan.priorities[0].linked_candidate_ids).toContain('cand-1');
      expect(plan.priorities[1].linked_candidate_ids).toContain('cand-2');
      expect(plan.priorities[2].linked_candidate_ids).toContain('cand-3');
    });

    it('should create default priority when no recommendations (English)', () => {
      const plan = generateDeterministicPlan('user-1', '2025-12-20', [], 'en');

      expect(plan.priorities).toHaveLength(1);
      expect(plan.priorities[0].title).toBe('Review your day');
      expect(plan.priorities[0].linked_candidate_ids).toEqual([]);
    });

    it('should create default priority when no recommendations (German)', () => {
      const plan = generateDeterministicPlan('user-1', '2025-12-20', [], 'de');

      expect(plan.priorities).toHaveLength(1);
      expect(plan.priorities[0].title).toBe('Überprüfe deinen Tag');
      expect(plan.priorities[0].linked_candidate_ids).toEqual([]);
    });

    it('should group schedule by time window based on class', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      expect(plan.schedule_suggestion.length).toBeGreaterThan(0);
      const timeWindows = plan.schedule_suggestion.map((s) => s.time_window);
      expect(timeWindows).toContain('morning');
      expect(timeWindows).toContain('midday');
    });

    it('should create schedule from default priority when no recommendations (English)', () => {
      const plan = generateDeterministicPlan('user-1', '2025-12-20', [], 'en');

      expect(plan.schedule_suggestion).toHaveLength(1);
      expect(plan.schedule_suggestion[0].time_window).toBe('morning');
      expect(plan.schedule_suggestion[0].items).toContain('Review your day');
    });

    it('should create schedule from default priority when no recommendations (German)', () => {
      const plan = generateDeterministicPlan('user-1', '2025-12-20', [], 'de');

      expect(plan.schedule_suggestion).toHaveLength(1);
      expect(plan.schedule_suggestion[0].time_window).toBe('morning');
      expect(plan.schedule_suggestion[0].items).toContain('Überprüfe deinen Tag');
    });

    it('should set generated_at timestamp', () => {
      const recs = createMockRecommendations();
      const before = new Date().toISOString();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);
      const after = new Date().toISOString();

      expect(plan.generated_at >= before).toBe(true);
      expect(plan.generated_at <= after).toBe(true);
    });

    it('should truncate long titles', () => {
      const recs: RecommendationOutboxItem[] = [
        {
          candidate_id: 'cand-long',
          score: 0.9,
          created_at: '2025-12-20T10:00:00Z',
          class: 'communication',
          title: 'A'.repeat(100),
          rationale: 'Long rationale',
        },
      ];
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      expect(plan.priorities[0].title.length).toBeLessThanOrEqual(80);
      expect(plan.priorities[0].title).toContain('...');
    });

    it('should pass Zod schema validation', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      const parseResult = AiDailyPlanSchema.safeParse(plan);
      expect(parseResult.success).toBe(true);
    });

    it('should pass Zod schema validation with empty recommendations', () => {
      const plan = generateDeterministicPlan('user-1', '2025-12-20', []);

      const parseResult = AiDailyPlanSchema.safeParse(plan);
      expect(parseResult.success).toBe(true);
    });

    it('should pass numeral guardrail check', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      const result = checkNoNumerals(plan);
      expect(result.valid).toBe(true);
    });

    it('should pass candidate ID integrity check', () => {
      const recs = createMockRecommendations();
      const plan = generateDeterministicPlan('user-1', '2025-12-20', recs);

      const allowedIds = new Set(recs.map((r) => r.candidate_id));
      const result = checkCandidateIdIntegrity(plan, allowedIds);
      expect(result.valid).toBe(true);
    });

    it('should take top three recommendations for priorities', () => {
      const manyRecs: RecommendationOutboxItem[] = Array.from({ length: 10 }, (_, i) => ({
        candidate_id: `rec-${i}`,
        score: 1 - i * 0.1,
        created_at: '2025-12-20T10:00:00Z',
        class: 'communication',
        title: `Task number ${i}`,
        rationale: 'Some rationale.',
      }));

      const plan = generateDeterministicPlan('user-1', '2025-12-20', manyRecs);

      expect(plan.priorities).toHaveLength(3);
      expect(plan.priorities[0].linked_candidate_ids).toContain('rec-0');
      expect(plan.priorities[1].linked_candidate_ids).toContain('rec-1');
      expect(plan.priorities[2].linked_candidate_ids).toContain('rec-2');
    });
  });
});
