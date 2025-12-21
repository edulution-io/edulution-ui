/*
 * LICENSE PLACEHOLDER
 */

import type { DailySummary, RecommendationOutboxItem } from '@edulution/events';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import DailyPlanService from '../daily-plan.service';
import PlanCacheService from '../services/plan-cache.service';
import DailyPlanMetricsService from '../daily-plan.metrics';
import AIService from '../../ai.service';
import SummaryService from '../../../summaries/summary.service';
import RecommendationsService from '../../../recommendations/recommendations.service';
import UsersService from '../../../users/users.service';
import { DailyPlanDocument } from '../schemas/daily-plan-document.schema';

const createMockSummary = (overrides: Partial<DailySummary> = {}): DailySummary => ({
  user_id: 'test-user',
  date: '2025-12-21',
  activity_level: 'medium',
  total_events: 25,
  by_source: [{ source: 'files', event_count: 15, last_activity: '2025-12-21T10:00:00.000Z' }],
  communications: {
    threads_active: 3,
    threads_awaiting_reply: 1,
    messages_sent: 5,
    messages_received: 10,
  },
  meetings: {
    total_scheduled: 2,
    upcoming_24h: 2,
    meetings: [
      { meeting_id: 'meeting-1', scheduled_at: '2025-12-21T14:00:00.000Z' },
    ],
  },
  top_event_types: [
    { type: 'file.created', count: 10 },
    { type: 'file.moved', count: 5 },
  ],
  generated_at: new Date().toISOString(),
  ...overrides,
});

const createMockRecommendation = (id: string, overrides: Partial<RecommendationOutboxItem> = {}): RecommendationOutboxItem => ({
  candidate_id: id,
  dedup_key: `dedup-${id}`,
  score: 0.85,
  created_at: new Date().toISOString(),
  class: 'task',
  title: `Test Task ${id}`,
  rationale: 'Test rationale',
  context_id: 'ctx-1',
  sources_involved: ['files'],
  explainability: 'Based on your activity',
  action_proposal: { type: 'reminder', payload: {} },
  ...overrides,
});

const mockPlanResponse = JSON.stringify({
  plan_title: 'Your Daily Plan',
  priorities: [
    { rank: 1, title: 'Priority 1', why: 'Important task', linked_candidate_ids: ['rec-1'] },
  ],
  schedule_suggestion: [
    { time_window: 'morning', focus: 'Deep work', items: ['Work on priority 1'] },
  ],
  recap: 'Focus on your key tasks today',
  notes: [],
  safety: { no_new_facts: true, numerals_allowed: false, checked: true },
});

describe('Daily Plan Cache Integration', () => {
  let service: DailyPlanService;
  let cacheService: PlanCacheService;
  let mockAiService: { generateTextByPurpose: jest.Mock };
  let mockSummaryService: { getDailySummary: jest.Mock };
  let mockRecommendationsService: { list: jest.Mock };
  let mockMetrics: {
    recordGeneration: jest.Mock;
    recordSafetyViolation: jest.Mock;
    recordValidationFailure: jest.Mock;
  };
  let mockRedis: {
    hgetall: jest.Mock;
    hset: jest.Mock;
    hincrby: jest.Mock;
    get: jest.Mock;
    setex: jest.Mock;
    expire: jest.Mock;
    del: jest.Mock;
    connect: jest.Mock;
    quit: jest.Mock;
  };
  let mockModel: {
    findOne: jest.Mock;
    findOneAndUpdate: jest.Mock;
    updateOne: jest.Mock;
  };

  const testUserId = 'test-cache-user';
  const testDate = '2025-12-21';

  beforeEach(async () => {
    mockRedis = {
      hgetall: jest.fn().mockResolvedValue({}),
      hset: jest.fn().mockResolvedValue('OK'),
      hincrby: jest.fn().mockResolvedValue(1),
      get: jest.fn().mockResolvedValue(null),
      setex: jest.fn().mockResolvedValue('OK'),
      expire: jest.fn().mockResolvedValue(1),
      del: jest.fn().mockResolvedValue(1),
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
    };

    mockModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };

    mockAiService = {
      generateTextByPurpose: jest.fn().mockResolvedValue(mockPlanResponse),
    };

    mockSummaryService = {
      getDailySummary: jest.fn().mockResolvedValue(createMockSummary()),
    };

    mockRecommendationsService = {
      list: jest.fn().mockResolvedValue([
        createMockRecommendation('rec-1'),
        createMockRecommendation('rec-2'),
      ]),
    };

    mockMetrics = {
      recordGeneration: jest.fn(),
      recordSafetyViolation: jest.fn(),
      recordValidationFailure: jest.fn(),
    };

    const mockUsersService = {
      findOne: jest.fn().mockResolvedValue({ language: 'en' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DailyPlanService,
        PlanCacheService,
        {
          provide: getModelToken(DailyPlanDocument.name),
          useValue: mockModel,
        },
        {
          provide: AIService,
          useValue: mockAiService,
        },
        {
          provide: SummaryService,
          useValue: mockSummaryService,
        },
        {
          provide: RecommendationsService,
          useValue: mockRecommendationsService,
        },
        {
          provide: DailyPlanMetricsService,
          useValue: mockMetrics,
        },
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    service = module.get<DailyPlanService>(DailyPlanService);
    cacheService = module.get<PlanCacheService>(PlanCacheService);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (cacheService as unknown as { redis: typeof mockRedis }).redis = mockRedis;

    mockModel.findOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(null),
      sort: jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      }),
    });

    mockModel.findOneAndUpdate.mockReturnValue({
      exec: jest.fn().mockResolvedValue({
        plan_id: 'mongo-plan-id',
        _id: { toString: () => 'mongo-doc-id' },
      }),
    });

    mockModel.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
    });
  });

  describe('Cache Flow', () => {
    it('should generate and persist on first call', async () => {
      const result = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(result.cached).toBe(false);
      expect(result.source).toBe('generated');
      expect(result.inputHash).toBeDefined();
      expect(result.plan).toBeDefined();
      expect(result.plan.plan_title).toBeDefined();
      expect(result.plan.priorities.length).toBeGreaterThan(0);

      expect(mockAiService.generateTextByPurpose).toHaveBeenCalled();
      expect(mockModel.findOneAndUpdate).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalled();
      expect(mockMetrics.recordGeneration).toHaveBeenCalledWith(
        expect.any(Number),
        true,
        false,
      );
    });

    it('should hit Redis cache on second call with same inputs', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({
        input_hash: firstResult.inputHash,
        plan_id: 'mongo-plan-id',
        cache_hits: '0',
      });
      mockRedis.get.mockResolvedValue(JSON.stringify(firstResult.plan));

      const secondResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(secondResult.cached).toBe(true);
      expect(secondResult.source).toBe('redis');
      expect(secondResult.inputHash).toBe(firstResult.inputHash);
      expect(mockRedis.hincrby).toHaveBeenCalledWith(
        `plan:meta:${testUserId}:${testDate}`,
        'cache_hits',
        1,
      );
    });

    it('should hit MongoDB when Redis misses but hash matches', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({});
      mockRedis.get.mockResolvedValue(null);

      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          user_id: testUserId,
          date: testDate,
          input_hash: firstResult.inputHash,
          plan_id: 'mongo-plan-id',
          plan: firstResult.plan,
        }),
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const secondResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(secondResult.cached).toBe(true);
      expect(secondResult.source).toBe('mongo');
      expect(secondResult.inputHash).toBe(firstResult.inputHash);

      expect(mockRedis.setex).toHaveBeenCalled();
    });

    it('should regenerate when input hash changes', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockSummaryService.getDailySummary.mockResolvedValue(
        createMockSummary({ total_events: 100, activity_level: 'high' }),
      );

      mockRedis.hgetall.mockResolvedValue({
        input_hash: firstResult.inputHash,
        plan_id: 'mongo-plan-id',
      });

      const secondResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(secondResult.cached).toBe(false);
      expect(secondResult.source).toBe('generated');
      expect(secondResult.inputHash).not.toBe(firstResult.inputHash);
    });

    it('should bypass cache with refresh=true', async () => {
      await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({
        input_hash: 'some-hash',
        plan_id: 'mongo-plan-id',
        cache_hits: '5',
      });
      mockRedis.get.mockResolvedValue(JSON.stringify({ plan_title: 'Cached Plan' }));

      const refreshResult = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      expect(refreshResult.cached).toBe(false);
      expect(refreshResult.source).toBe('generated');
      expect(mockAiService.generateTextByPurpose).toHaveBeenCalledTimes(2);
    });
  });

  describe('Input Hash Determinism', () => {
    it('should produce same hash for identical inputs', async () => {
      const result1 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      mockRedis.hgetall.mockResolvedValue({});
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result2 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      expect(result2.inputHash).toBe(result1.inputHash);
    });

    it('should produce different hash when summary changes', async () => {
      const result1 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      mockSummaryService.getDailySummary.mockResolvedValue(
        createMockSummary({ activity_level: 'high', total_events: 100 }),
      );

      const result2 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      expect(result2.inputHash).not.toBe(result1.inputHash);
    });

    it('should produce different hash when recommendations change', async () => {
      const result1 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      mockRecommendationsService.list.mockResolvedValue([
        createMockRecommendation('rec-3', { title: 'New Task', score: 0.95 }),
      ]);

      const result2 = await service.getOrGenerateDailyPlan(testUserId, testDate, { refresh: true });

      expect(result2.inputHash).not.toBe(result1.inputHash);
    });
  });

  describe('MongoDB Persistence', () => {
    it('should persist plan with correct metadata', async () => {
      await service.getOrGenerateDailyPlan(testUserId, testDate);

      /* eslint-disable @typescript-eslint/no-unsafe-assignment */
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user_id: testUserId, date: testDate, input_hash: expect.any(String) },
        { $setOnInsert: expect.objectContaining({
          user_id: testUserId,
          date: testDate,
          plan: expect.any(Object),
          safety: expect.objectContaining({ passed: expect.any(Boolean) }),
        }) },
        { upsert: true, new: true },
      );
      /* eslint-enable @typescript-eslint/no-unsafe-assignment */
    });

    it('should increment cache hits when serving from cache', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({
        input_hash: firstResult.inputHash,
        cache_hits: '0',
      });
      mockRedis.get.mockResolvedValue(JSON.stringify(firstResult.plan));

      await service.getOrGenerateDailyPlan(testUserId, testDate);

      await new Promise((resolve) => { setTimeout(resolve, 10); });

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { user_id: testUserId, date: testDate, input_hash: firstResult.inputHash },
        { $inc: { cache_hits: 1 } },
      );
    });
  });

  describe('Redis Caching', () => {
    it('should set correct Redis keys on generation', async () => {
      const result = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(mockRedis.hset).toHaveBeenCalledWith(
        `plan:meta:${testUserId}:${testDate}`,
        expect.objectContaining({
          input_hash: result.inputHash,
          plan_id: 'mongo-plan-id',
        }),
      );

      expect(mockRedis.setex).toHaveBeenCalledWith(
        `plan:payload:${testUserId}:${testDate}:${result.inputHash}`,
        expect.any(Number),
        expect.any(String),
      );
    });

    it('should backfill Redis when serving from MongoDB', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);
      const firstHash = firstResult.inputHash;

      jest.clearAllMocks();

      mockRedis.hgetall.mockResolvedValue({});
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          user_id: testUserId,
          date: testDate,
          input_hash: firstHash,
          plan_id: 'mongo-plan-id',
          plan: firstResult.plan,
        }),
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(mockRedis.hset).toHaveBeenCalledWith(
        `plan:meta:${testUserId}:${testDate}`,
        expect.objectContaining({
          input_hash: firstHash,
          plan_id: 'mongo-plan-id',
        }),
      );
    });
  });

  describe('Cache Invalidation', () => {
    it('should delete Redis keys on invalidation', async () => {
      mockRedis.hgetall.mockResolvedValue({
        input_hash: 'test-hash',
      });

      await service.invalidateCache(testUserId, testDate);

      expect(mockRedis.del).toHaveBeenCalledWith(`plan:payload:${testUserId}:${testDate}:test-hash`);
      expect(mockRedis.del).toHaveBeenCalledWith(`plan:meta:${testUserId}:${testDate}`);
    });
  });

  describe('Error Handling', () => {
    it('should fall back to deterministic plan on LLM error', async () => {
      mockAiService.generateTextByPurpose.mockRejectedValue(new Error('LLM timeout'));

      const result = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(result.usedFallback).toBe(true);
      expect(result.plan).toBeDefined();
      expect(result.plan.plan_title).toBeDefined();
      expect(result.plan.priorities.length).toBeGreaterThan(0);
    });

    it('should continue serving from cache on MongoDB errors', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({
        input_hash: firstResult.inputHash,
        cache_hits: '0',
      });
      mockRedis.get.mockResolvedValue(JSON.stringify(firstResult.plan));
      mockModel.updateOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('MongoDB error')),
      });

      const secondResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(secondResult.cached).toBe(true);
      expect(secondResult.plan).toBeDefined();
    });
  });

  describe('Latency Tracking', () => {
    it('should include duration_ms in result', async () => {
      const result = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(result.duration_ms).toBeDefined();
      expect(typeof result.duration_ms).toBe('number');
      expect(result.duration_ms).toBeGreaterThanOrEqual(0);
    });

    it('should have reasonable latency for cache hits', async () => {
      const firstResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      mockRedis.hgetall.mockResolvedValue({
        input_hash: firstResult.inputHash,
        cache_hits: '0',
      });
      mockRedis.get.mockResolvedValue(JSON.stringify(firstResult.plan));

      const secondResult = await service.getOrGenerateDailyPlan(testUserId, testDate);

      expect(secondResult.duration_ms).toBeDefined();
      expect(secondResult.cached).toBe(true);
    });
  });
});
