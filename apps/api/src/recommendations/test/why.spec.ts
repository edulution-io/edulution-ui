/*
 * LICENSE PLACEHOLDER
 */

import { NotFoundException } from '@nestjs/common';
import type { RecommendationCandidate, Explainability } from '@edulution/events';
import { RECOMMENDATION_CLASSES, createStateEvidence, createRuleEvidence } from '@edulution/events';
import WhyService from '../why.service';
import type { WhyResponse } from '../why.service';

const createMockExplainability = (overrides: Partial<Explainability> = {}): Explainability => ({
  rule_id: 'reco.comm.awaiting_reply',
  rule_version: '1.0.0',
  summary: 'Several conversations need attention.',
  evidence: [
    createStateEvidence(
      'Threads awaiting reply',
      'state:comm:user1:awaiting',
      'mail',
      'today',
      { thread_count: 3 },
    ),
    createRuleEvidence('reco.comm.awaiting_reply'),
  ],
  ...overrides,
});

const createMockCandidate = (
  overrides: Partial<RecommendationCandidate> = {},
): RecommendationCandidate => ({
  candidate_id: 'candidate-123',
  user_id: 'user-1',
  created_at: new Date().toISOString(),
  class: RECOMMENDATION_CLASSES.COMMUNICATION,
  title: 'Follow up on pending conversations',
  rationale: 'Several conversations are awaiting your response.',
  evidence: [{ kind: 'mail_thread', ref: 'thread-123' }],
  scores: { confidence: 0.8, impact: 0.7, effort: 0.3 },
  explainability: createMockExplainability(),
  ...overrides,
});

describe('WhyService', () => {
  let whyService: WhyService;
  let mockRecommendationsService: {
    getCandidate: jest.Mock;
  };

  beforeEach(() => {
    mockRecommendationsService = {
      getCandidate: jest.fn(),
    };
    whyService = new WhyService(mockRecommendationsService as never);
  });

  describe('getWhy', () => {
    it('should return WhyResponse for valid candidate', async () => {
      const candidate = createMockCandidate();
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.candidate_id).toBe('candidate-123');
      expect(response.title).toBe(candidate.title);
      expect(response.class).toBe(candidate.class);
      expect(response.summary).toBe(candidate.explainability?.summary);
      expect(response.evidence).toEqual(candidate.explainability?.evidence);
      expect(response.rendered_why).toBeDefined();
    });

    it('should throw NotFoundException when candidate not found', async () => {
      mockRecommendationsService.getCandidate.mockResolvedValue(null);

      await expect(whyService.getWhy('user-1', 'candidate-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when candidate belongs to different user', async () => {
      const candidate = createMockCandidate({ user_id: 'other-user' });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      await expect(whyService.getWhy('user-1', 'candidate-123')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw NotFoundException when candidate has no explainability', async () => {
      const candidate = createMockCandidate({ explainability: undefined });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      await expect(whyService.getWhy('user-1', 'candidate-123')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('renderWhy - No Numerals Policy', () => {
    it('should not contain numerals in rendered_why', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Threads', 'key', 'mail', 'today', { thread_count: 5 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).not.toMatch(/\d/);
    });

    it('should convert 0 to "no"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 0 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('no');
      expect(response.rendered_why).not.toMatch(/\d/);
    });

    it('should convert 1 to "one"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 1 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('one');
    });

    it('should convert 5 to "five"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 5 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('five');
    });

    it('should convert 7 to "several"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 7 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('several');
    });

    it('should convert 15 to "many"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 15 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('many');
    });

    it('should convert 100 to "numerous"', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Items', 'key', 'mail', 'today', { item_count: 100 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('numerous');
    });
  });

  describe('renderWhy - Evidence Kind Rendering', () => {
    it('should render state evidence with label and meta', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Active threads', 'key', 'mail', 'today', { thread_count: 3 }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('Active threads');
    });

    it('should render correlation evidence', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            {
              kind: 'correlation',
              label: 'Meeting preparation',
              refs: [{ ref_type: 'correlation_id', ref: 'corr-123' }],
              meta: {},
              sensitivity: 'low',
            },
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('meeting preparation');
    });

    it('should render event evidence with source', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            {
              kind: 'event',
              label: 'Upcoming meeting',
              refs: [{ ref_type: 'event_id', ref: 'event-123', source: 'caldav' }],
              meta: {},
              sensitivity: 'medium',
            },
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('caldav');
    });

    it('should render heuristic evidence', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            {
              kind: 'heuristic',
              label: 'End of day window',
              refs: [{ ref_type: 'object_ref', ref: 'time-window' }],
              meta: { is_eod: true },
              sensitivity: 'low',
            },
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('End of day window');
    });
  });

  describe('renderWhy - Determinism', () => {
    it('should produce identical output for identical input', async () => {
      const candidate = createMockCandidate();
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response1 = await whyService.getWhy('user-1', 'candidate-123');
      const response2 = await whyService.getWhy('user-1', 'candidate-123');

      expect(response1.rendered_why).toBe(response2.rendered_why);
    });

    it('should handle boolean meta values correctly', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Status', 'key', 'mail', 'today', { is_active: true }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain('is active');
    });

    it('should handle false boolean meta values by not including them', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Status', 'key', 'mail', 'today', { is_active: false }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).not.toContain('is active');
    });

    it('should handle null meta values by not including them', async () => {
      const candidate = createMockCandidate({
        explainability: createMockExplainability({
          evidence: [
            createStateEvidence('Status', 'key', 'mail', 'today', { value: null }),
            createRuleEvidence('reco.comm.awaiting_reply'),
          ],
        }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toBeDefined();
    });
  });

  describe('renderWhy - Fallback Behavior', () => {
    it('should use rationale when explainability is missing', async () => {
      const candidate = createMockCandidate();
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why.length).toBeGreaterThan(0);
    });

    it('should include summary in rendered output', async () => {
      const summary = 'Custom summary for testing.';
      const candidate = createMockCandidate({
        explainability: createMockExplainability({ summary }),
      });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.rendered_why).toContain(summary);
    });
  });

  describe('WhyResponse Structure', () => {
    it('should include all required fields', async () => {
      const candidate = createMockCandidate();
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response: WhyResponse = await whyService.getWhy('user-1', 'candidate-123');

      expect(response).toHaveProperty('candidate_id');
      expect(response).toHaveProperty('title');
      expect(response).toHaveProperty('class');
      expect(response).toHaveProperty('summary');
      expect(response).toHaveProperty('evidence');
      expect(response).toHaveProperty('rendered_why');
    });

    it('evidence array should match explainability evidence', async () => {
      const explainability = createMockExplainability();
      const candidate = createMockCandidate({ explainability });
      mockRecommendationsService.getCandidate.mockResolvedValue(candidate);

      const response = await whyService.getWhy('user-1', 'candidate-123');

      expect(response.evidence.length).toBe(explainability.evidence.length);
    });
  });
});
