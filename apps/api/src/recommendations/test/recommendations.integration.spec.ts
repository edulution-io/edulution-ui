/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import {
  RecommendationCandidateSchema,
  RecommendationOutboxItemSchema,
  RECOMMENDATION_CLASSES,
} from '@edulution/events';
import type { RecommendationCandidate } from '@edulution/events';
import RecommendationsService from '../recommendations.service';

const createTestCandidate = (overrides: Partial<RecommendationCandidate> = {}): RecommendationCandidate => ({
  candidate_id: randomUUID(),
  user_id: 'user-integration',
  created_at: new Date().toISOString(),
  class: RECOMMENDATION_CLASSES.COMMUNICATION,
  title: 'Integration test recommendation',
  rationale: 'This is a test recommendation for integration testing',
  evidence: [{ kind: 'mail_thread', ref: 'thread-integration' }],
  scores: { confidence: 0.85, impact: 0.7, effort: 0.4 },
  ...overrides,
});

const createMockRedis = () => {
  const store: Record<string, string> = {};
  const zsets: Record<string, Array<{ member: string; score: number }>> = {};

  return {
    connect: jest.fn().mockResolvedValue(undefined),
    quit: jest.fn().mockResolvedValue(undefined),
    get: jest.fn().mockImplementation((key: string) => Promise.resolve(store[key] || null)),
    mget: jest.fn().mockImplementation((...keys: string[]) =>
      Promise.resolve(keys.map((k) => store[k] || null)),
    ),
    setex: jest.fn().mockImplementation((key: string, _ttl: number, value: string) => {
      store[key] = value;
      return Promise.resolve('OK');
    }),
    zadd: jest.fn().mockImplementation((key: string, score: number, member: string) => {
      if (!zsets[key]) zsets[key] = [];
      const existing = zsets[key].findIndex((z) => z.member === member);
      if (existing >= 0) {
        zsets[key][existing].score = score;
      } else {
        zsets[key].push({ member, score });
      }
      return Promise.resolve(1);
    }),
    zrevrange: jest.fn().mockImplementation((key: string, start: number, stop: number, withScores?: string) => {
      const zset = zsets[key] || [];
      const sorted = [...zset].sort((a, b) => b.score - a.score);
      const sliced = sorted.slice(start, stop + 1);
      if (withScores === 'WITHSCORES') {
        const result: string[] = [];
        sliced.forEach((z) => {
          result.push(z.member);
          result.push(z.score.toString());
        });
        return Promise.resolve(result);
      }
      return Promise.resolve(sliced.map((z) => z.member));
    }),
    zrange: jest.fn().mockImplementation((key: string) => {
      const zset = zsets[key] || [];
      return Promise.resolve(zset.map((z) => z.member));
    }),
    zrem: jest.fn().mockImplementation((key: string, ...members: string[]) => {
      if (!zsets[key]) return Promise.resolve(0);
      const before = zsets[key].length;
      zsets[key] = zsets[key].filter((z) => !members.includes(z.member));
      return Promise.resolve(before - zsets[key].length);
    }),
    del: jest.fn().mockImplementation((...keys: string[]) => {
      let count = 0;
      keys.forEach((k) => {
        if (store[k]) {
          delete store[k];
          count += 1;
        }
        if (zsets[k]) {
          delete zsets[k];
          count += 1;
        }
      });
      return Promise.resolve(count);
    }),
    expire: jest.fn().mockResolvedValue(1),
    pipeline: jest.fn().mockImplementation(() => {
      const ops: Array<() => Promise<unknown>> = [];
      const pipelineMock = {
        setex: jest.fn().mockImplementation((key: string, ttl: number, value: string) => {
          ops.push(() => {
            store[key] = value;
            return Promise.resolve('OK');
          });
          return pipelineMock;
        }),
        zadd: jest.fn().mockImplementation((key: string, score: number, member: string) => {
          ops.push(() => {
            if (!zsets[key]) zsets[key] = [];
            const existing = zsets[key].findIndex((z) => z.member === member);
            if (existing >= 0) {
              zsets[key][existing].score = score;
            } else {
              zsets[key].push({ member, score });
            }
            return Promise.resolve(1);
          });
          return pipelineMock;
        }),
        expire: jest.fn().mockImplementation(() => {
          ops.push(() => Promise.resolve(1));
          return pipelineMock;
        }),
        exec: jest.fn().mockImplementation(async () => {
          const results: Array<[null, unknown]> = [];
          await ops.reduce(async (prev, op) => {
            await prev;
            const result = await op();
            results.push([null, result]);
          }, Promise.resolve());
          return results;
        }),
      };
      return pipelineMock;
    }),
  };
};

jest.mock('ioredis', () => jest.fn().mockImplementation(() => createMockRedis()));

describe('Recommendations Integration', () => {
  let service: RecommendationsService;

  beforeEach(async () => {
    jest.clearAllMocks();
    service = new RecommendationsService();
    await service.onModuleInit();
  });

  afterEach(async () => {
    await service.onModuleDestroy();
  });

  describe('candidate lifecycle', () => {
    it('stores and retrieves candidate correctly', async () => {
      const candidate = createTestCandidate({ user_id: 'user-store-test' });
      await service.putCandidate(candidate, 0.75);

      const results = await service.list('user-store-test');

      expect(results).toHaveLength(1);
      expect(results[0].candidate_id).toBe(candidate.candidate_id);
      expect(results[0].score).toBe(0.75);
      expect(results[0].title).toBe(candidate.title);
    });

    it('retrieves single candidate by ID', async () => {
      const candidate = createTestCandidate();
      await service.putCandidate(candidate, 0.8);

      const retrieved = await service.getCandidate(candidate.candidate_id);

      expect(retrieved).not.toBeNull();
      expect(retrieved?.candidate_id).toBe(candidate.candidate_id);
      expect(retrieved?.evidence).toEqual(candidate.evidence);
      expect(retrieved?.scores).toEqual(candidate.scores);
    });

    it('returns null for non-existent candidate', async () => {
      const result = await service.getCandidate('non-existent-id');
      expect(result).toBeNull();
    });
  });

  describe('expiration handling', () => {
    it('filters expired candidates from list', async () => {
      const expired = createTestCandidate({
        user_id: 'user-expiry-test',
        expires_at: new Date(Date.now() - 1000).toISOString(),
      });
      await service.putCandidate(expired, 0.9);

      const results = await service.list('user-expiry-test');

      expect(results).toHaveLength(0);
    });

    it('returns null for expired candidate by ID', async () => {
      const expired = createTestCandidate({
        expires_at: new Date(Date.now() - 1000).toISOString(),
      });
      await service.putCandidate(expired, 0.9);

      const retrieved = await service.getCandidate(expired.candidate_id);

      expect(retrieved).toBeNull();
    });

    it('includes non-expired candidates', async () => {
      const notExpired = createTestCandidate({
        user_id: 'user-not-expired',
        expires_at: new Date(Date.now() + 86400000).toISOString(),
      });
      await service.putCandidate(notExpired, 0.7);

      const results = await service.list('user-not-expired');

      expect(results).toHaveLength(1);
    });
  });

  describe('ordering', () => {
    it('returns candidates ordered by score descending', async () => {
      const userId = 'user-ordering-test';
      const low = createTestCandidate({ user_id: userId, candidate_id: randomUUID() });
      const high = createTestCandidate({ user_id: userId, candidate_id: randomUUID() });

      await service.putCandidate(low, 0.3);
      await service.putCandidate(high, 0.9);

      const results = await service.list(userId);

      expect(results[0].score).toBe(0.9);
      expect(results[1].score).toBe(0.3);
    });

    it('returns stable ordering across multiple calls', async () => {
      const userId = 'user-stable-test';
      const candidates = Array.from({ length: 5 }, (_, i) =>
        createTestCandidate({
          user_id: userId,
          candidate_id: randomUUID(),
          created_at: new Date(Date.now() + i * 1000).toISOString(),
        }),
      );

      await Promise.all(candidates.map((c, i) => service.putCandidate(c, 0.5 + i * 0.05)));

      const results1 = await service.list(userId);
      const results2 = await service.list(userId);

      expect(results1.map((r) => r.candidate_id)).toEqual(results2.map((r) => r.candidate_id));
    });
  });

  describe('schema compliance', () => {
    it('outbox item matches schema', async () => {
      const candidate = createTestCandidate({ user_id: 'user-schema-test' });
      await service.putCandidate(candidate, 0.8);

      const results = await service.list('user-schema-test');

      expect(results).toHaveLength(1);
      expect(() => RecommendationOutboxItemSchema.parse(results[0])).not.toThrow();
    });

    it('full candidate matches schema', async () => {
      const candidate = createTestCandidate();
      await service.putCandidate(candidate, 0.8);

      const retrieved = await service.getCandidate(candidate.candidate_id);

      expect(retrieved).not.toBeNull();
      expect(() => RecommendationCandidateSchema.parse(retrieved)).not.toThrow();
    });
  });

  describe('limit handling', () => {
    it('respects limit parameter', async () => {
      const userId = 'user-limit-test';

      await Promise.all(
        Array.from({ length: 10 }, (_, i) =>
          service.putCandidate(
            createTestCandidate({ user_id: userId, candidate_id: randomUUID() }),
            0.5 + i * 0.01,
          ),
        ),
      );

      const results = await service.list(userId, 3);

      expect(results.length).toBeLessThanOrEqual(3);
    });
  });
});
