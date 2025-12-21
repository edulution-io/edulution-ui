/*
 * LICENSE PLACEHOLDER
 */

import type { DailySummary, RecommendationOutboxItem } from '@edulution/events';
import { buildDailyPlanPrompt, sanitizeSummary, sanitizeRecommendations } from '../prompts/daily-plan.prompt';

describe('Daily Plan Prompt', () => {
  const createMockSummary = (): DailySummary => ({
    user_id: 'test-user',
    date: '2025-12-20',
    activity_level: 'medium',
    total_events: 25,
    by_source: [
      { source: 'mail', event_count: 15, last_activity: '2025-12-20T10:00:00Z' },
      { source: 'files', event_count: 10, last_activity: '2025-12-20T09:30:00Z' },
    ],
    communications: {
      threads_active: 5,
      threads_awaiting_reply: 2,
      messages_sent: 3,
      messages_received: 12,
    },
    meetings: {
      total_scheduled: 4,
      upcoming_24h: 3,
      meetings: [
        { meeting_id: 'meet-1', scheduled_at: '2025-12-20T14:00:00Z' },
        { meeting_id: 'meet-2', scheduled_at: '2025-12-20T16:00:00Z' },
      ],
    },
    top_event_types: [
      { type: 'mail.received', count: 10 },
      { type: 'file.accessed', count: 8 },
    ],
    generated_at: '2025-12-20T10:30:00Z',
  });

  const createMockRecommendations = (): RecommendationOutboxItem[] => [
    {
      candidate_id: 'cand-1',
      score: 0.9,
      created_at: '2025-12-20T10:00:00Z',
      class: 'communication',
      title: 'Reply to pending thread',
      rationale: 'Thread is awaiting your response.',
      context_id: 'thread-123',
    },
    {
      candidate_id: 'cand-2',
      score: 0.85,
      created_at: '2025-12-20T10:00:00Z',
      class: 'meeting',
      title: 'Prepare for upcoming meeting',
      rationale: 'Meeting starts in a few hours.',
    },
  ];

  describe('sanitizeSummary', () => {
    it('should convert event counts to activity levels', () => {
      const summary = createMockSummary();
      const sanitized = sanitizeSummary(summary);

      expect(sanitized.by_source).toBeDefined();
      expect(sanitized.by_source?.[0]).toEqual({
        source: 'mail',
        activity_level: 'medium',
      });
    });

    it('should convert high event count to high activity', () => {
      const summary = createMockSummary();
      summary.by_source = [{ source: 'mail', event_count: 25, last_activity: null }];

      const sanitized = sanitizeSummary(summary);
      expect(sanitized.by_source?.[0].activity_level).toBe('high');
    });

    it('should convert low event count to low activity', () => {
      const summary = createMockSummary();
      summary.by_source = [{ source: 'mail', event_count: 3, last_activity: null }];

      const sanitized = sanitizeSummary(summary);
      expect(sanitized.by_source?.[0].activity_level).toBe('low');
    });

    it('should convert communications to boolean flags', () => {
      const summary = createMockSummary();
      const sanitized = sanitizeSummary(summary);

      expect(sanitized.communications).toEqual({
        has_active_threads: true,
        has_awaiting_reply: true,
      });
    });

    it('should convert meetings to boolean flags', () => {
      const summary = createMockSummary();
      const sanitized = sanitizeSummary(summary);

      expect(sanitized.meetings).toEqual({
        has_upcoming: true,
        is_busy_day: true,
      });
    });

    it('should not flag as busy day with few meetings', () => {
      const summary = createMockSummary();
      summary.meetings = { total_scheduled: 2, upcoming_24h: 1, meetings: [] };

      const sanitized = sanitizeSummary(summary);
      expect(sanitized.meetings?.is_busy_day).toBe(false);
    });
  });

  describe('sanitizeRecommendations', () => {
    it('should extract safe fields including sources_involved and evidence_summary', () => {
      const recommendations = createMockRecommendations();
      const sanitized = sanitizeRecommendations(recommendations);

      expect(sanitized).toHaveLength(2);
      expect(sanitized[0]).toEqual({
        candidate_id: 'cand-1',
        class: 'communication',
        title: 'Reply to pending thread',
        rationale: 'Thread is awaiting your response.',
        sources_involved: [],
        evidence_summary: 'none',
      });
    });

    it('should preserve candidate_id for LLM to reference', () => {
      const recommendations = createMockRecommendations();
      const sanitized = sanitizeRecommendations(recommendations);

      expect(sanitized[0].candidate_id).toBe('cand-1');
      expect(sanitized[1].candidate_id).toBe('cand-2');
    });

    it('should not include score or context_id', () => {
      const recommendations = createMockRecommendations();
      const sanitized = sanitizeRecommendations(recommendations);

      expect(sanitized[0]).not.toHaveProperty('score');
      expect(sanitized[0]).not.toHaveProperty('context_id');
      expect(sanitized[0]).not.toHaveProperty('created_at');
    });

    it('should include sources_involved when available', () => {
      const recommendations = createMockRecommendations();
      recommendations[0].sources_involved = ['mail', 'chat'];
      const sanitized = sanitizeRecommendations(recommendations);

      expect(sanitized[0].sources_involved).toEqual(['mail', 'chat']);
    });

    it('should summarize evidence kinds', () => {
      const recommendations = createMockRecommendations();
      recommendations[0].evidence = [
        { kind: 'thread_activity', ref: 'thread-1' },
        { kind: 'deadline', ref: 'task-1' },
      ];
      const sanitized = sanitizeRecommendations(recommendations);

      expect(sanitized[0].evidence_summary).toBe('thread_activity, deadline');
    });
  });

  describe('buildDailyPlanPrompt', () => {
    it('should include all critical rules', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('CRITICAL RULES');
      expect(prompt).toContain('Rule A: Source of Truth');
      expect(prompt).toContain('Rule B: No Numerals');
      expect(prompt).toContain('Rule C: Priority Limits');
      expect(prompt).toContain('Rule D: Candidate Linking');
      expect(prompt).toContain('Rule E: No Absolute Unsupported Claims');
      expect(prompt).toContain('Rule F: Strict JSON Output');
      expect(prompt).toContain('Rule G: Evidence-Based Wording');
      expect(prompt).toContain('Rule H: Schedule Must Reference Priorities');
      expect(prompt).toContain('Rule I: No Absolute Time Claims');
      expect(prompt).toContain('Rule J: Evidence-Based "why" Text');
    });

    it('should include traceability requirements', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('MUST only use facts present in the provided JSON inputs');
      expect(prompt).toContain('MUST NOT add any new facts');
      expect(prompt).toContain('linked_candidate_ids');
      expect(prompt).toContain('candidate_id');
    });

    it('should include forbidden phrases rule', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('FORBIDDEN phrases');
      expect(prompt).toContain('"no meetings"');
      expect(prompt).toContain('"no meeting scheduled"');
    });

    it('should include sanitized summary', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('"activity_level": "medium"');
      expect(prompt).toContain('"has_active_threads": true');
    });

    it('should include sanitized recommendations', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('Reply to pending thread');
      expect(prompt).toContain('Prepare for upcoming meeting');
    });

    it('should include user_id and date from summary in input', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('"user_id": "test-user"');
      expect(prompt).toContain('"date": "2025-12-20"');
    });

    it('should specify safety constraints in output', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('"no_new_facts": true');
      expect(prompt).toContain('"numerals_allowed": false');
      expect(prompt).toContain('"checked": true');
    });

    it('should include example with populated linked_candidate_ids', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('EXAMPLE OUTPUT');
      expect(prompt).toContain('"linked_candidate_ids": ["rec-abc-123"]');
    });

    it('should include sources_involved and evidence_summary in recommendations', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();
      recommendations[0].sources_involved = ['mail'];
      recommendations[0].evidence = [{ kind: 'thread_activity', ref: 'ref-1' }];

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('"sources_involved": [');
      expect(prompt).toContain('"evidence_summary":');
    });

    it('should include recommendation candidate_ids in context', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('cand-1');
      expect(prompt).toContain('cand-2');
    });

    it('should contain no numerals instruction with digit reference', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt.toLowerCase()).toContain('numeral');
      expect(prompt.toLowerCase()).toContain('digit');
    });

    it('should contain MUST keyword for requirements', () => {
      const summary = createMockSummary();
      const recommendations = createMockRecommendations();

      const prompt = buildDailyPlanPrompt(summary, recommendations);

      expect(prompt).toContain('MUST');
      expect(prompt).toContain('MUST NOT');
    });
  });
});
