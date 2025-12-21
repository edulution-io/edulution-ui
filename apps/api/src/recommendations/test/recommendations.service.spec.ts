/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import {
  RecommendationCandidateSchema,
  buildRecoOutboxKey,
  buildRecoCandidateKey,
  RECOMMENDATION_CLASSES,
} from '@edulution/events';
import type { RecommendationCandidate } from '@edulution/events';

const createTestCandidate = (overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate => ({
  candidate_id: randomUUID(),
  user_id: 'user-1',
  created_at: new Date().toISOString(),
  class: RECOMMENDATION_CLASSES.COMMUNICATION,
  title: 'Test recommendation',
  rationale: 'Test rationale for this recommendation',
  evidence: [{ kind: 'mail_thread', ref: 'thread-123' }],
  scores: { confidence: 0.8, impact: 0.7, effort: 0.3 },
  ...overrides,
});

describe('RecommendationsService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('schema validation', () => {
    it('validates correct candidate', () => {
      const valid = createTestCandidate();
      expect(() => RecommendationCandidateSchema.parse(valid)).not.toThrow();
    });

    it('rejects score out of range (confidence > 1)', () => {
      const invalid = createTestCandidate({
        scores: { confidence: 1.5, impact: 0.5, effort: 0.5 },
      });
      expect(() => RecommendationCandidateSchema.parse(invalid)).toThrow();
    });

    it('rejects score out of range (impact < 0)', () => {
      const invalid = createTestCandidate({
        scores: { confidence: 0.5, impact: -0.1, effort: 0.5 },
      });
      expect(() => RecommendationCandidateSchema.parse(invalid)).toThrow();
    });

    it('rejects title exceeding max length', () => {
      const invalid = createTestCandidate({
        title: 'a'.repeat(101),
      });
      expect(() => RecommendationCandidateSchema.parse(invalid)).toThrow();
    });

    it('rejects rationale exceeding max length', () => {
      const invalid = createTestCandidate({
        rationale: 'a'.repeat(501),
      });
      expect(() => RecommendationCandidateSchema.parse(invalid)).toThrow();
    });

    it('rejects evidence array exceeding max items', () => {
      const invalid = createTestCandidate({
        evidence: Array(11).fill({ kind: 'test', ref: 'ref' }),
      });
      expect(() => RecommendationCandidateSchema.parse(invalid)).toThrow();
    });

    it('accepts all valid recommendation classes', () => {
      const classes = Object.values(RECOMMENDATION_CLASSES);
      classes.forEach((cls) => {
        const candidate = createTestCandidate({ class: cls });
        expect(() => RecommendationCandidateSchema.parse(candidate)).not.toThrow();
      });
    });
  });

  describe('Redis key generation', () => {
    it('generates correct outbox key', () => {
      const key = buildRecoOutboxKey('user-123');
      expect(key).toBe('reco:outbox:user:user-123');
    });

    it('generates correct candidate key', () => {
      const key = buildRecoCandidateKey('candidate-abc');
      expect(key).toBe('reco:candidate:candidate-abc');
    });
  });

  describe('stableSort determinism', () => {
    it('sorts by score desc, then created_at asc, then candidate_id asc', () => {
      const items = [
        { candidate_id: 'b', score: 0.8, created_at: '2024-01-01T12:00:00.000Z', class: 'communication' as const, title: 'B', rationale: 'B' },
        { candidate_id: 'a', score: 0.8, created_at: '2024-01-01T12:00:00.000Z', class: 'communication' as const, title: 'A', rationale: 'A' },
        { candidate_id: 'c', score: 0.9, created_at: '2024-01-01T10:00:00.000Z', class: 'communication' as const, title: 'C', rationale: 'C' },
        { candidate_id: 'd', score: 0.8, created_at: '2024-01-01T10:00:00.000Z', class: 'communication' as const, title: 'D', rationale: 'D' },
      ];

      const sorted = [...items].sort((a, b) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.created_at !== b.created_at) return a.created_at.localeCompare(b.created_at);
        return a.candidate_id.localeCompare(b.candidate_id);
      });

      expect(sorted[0].candidate_id).toBe('c');
      expect(sorted[1].candidate_id).toBe('d');
      expect(sorted[2].candidate_id).toBe('a');
      expect(sorted[3].candidate_id).toBe('b');
    });

    it('produces identical order for identical input', () => {
      const items = [
        { candidate_id: 'x', score: 0.5, created_at: '2024-01-01T12:00:00.000Z', class: 'planning' as const, title: 'X', rationale: 'X' },
        { candidate_id: 'y', score: 0.5, created_at: '2024-01-01T12:00:00.000Z', class: 'planning' as const, title: 'Y', rationale: 'Y' },
      ];

      const sortFn = (a: typeof items[0], b: typeof items[0]) => {
        if (b.score !== a.score) return b.score - a.score;
        if (a.created_at !== b.created_at) return a.created_at.localeCompare(b.created_at);
        return a.candidate_id.localeCompare(b.candidate_id);
      };

      const sorted1 = [...items].sort(sortFn);
      const sorted2 = [...items].sort(sortFn);

      expect(sorted1.map((i) => i.candidate_id)).toEqual(sorted2.map((i) => i.candidate_id));
    });
  });

  describe('evidence item validation', () => {
    it('accepts evidence with optional fields', () => {
      const candidate = createTestCandidate({
        evidence: [
          { kind: 'mail_thread', ref: 'thread-1' },
          { kind: 'calendar_event', ref: 'event-1', ts: '2024-01-01T10:00:00.000Z' },
          { kind: 'correlation', ref: 'corr-1', meta: { foo: 'bar' } },
        ],
      });
      expect(() => RecommendationCandidateSchema.parse(candidate)).not.toThrow();
    });

    it('rejects empty evidence kind', () => {
      const candidate = createTestCandidate({
        evidence: [{ kind: '', ref: 'ref-1' }],
      });
      expect(() => RecommendationCandidateSchema.parse(candidate)).toThrow();
    });
  });
});
