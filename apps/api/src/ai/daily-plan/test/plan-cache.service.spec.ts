/*
 * LICENSE PLACEHOLDER
 */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import PlanCacheService from '../services/plan-cache.service';
import { DailyPlanDocument } from '../schemas/daily-plan-document.schema';
import type { AiDailyPlan } from '../schemas/daily-plan.schema';

const mockPlan: AiDailyPlan = {
  user_id: 'user-1',
  date: '2025-12-21',
  plan_title: 'Test Plan',
  priorities: [
    { rank: 1, title: 'Priority 1', why: 'Because', linked_candidate_ids: [] },
  ],
  schedule_suggestion: [
    { time_window: 'morning', focus: 'Focus', items: ['Item 1'] },
  ],
  recap: 'Test recap',
  notes: [],
  safety: { no_new_facts: true, numerals_allowed: false, checked: true },
  generated_at: new Date().toISOString(),
};

describe('PlanCacheService', () => {
  let service: PlanCacheService;
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

  beforeEach(async () => {
    mockRedis = {
      hgetall: jest.fn(),
      hset: jest.fn(),
      hincrby: jest.fn(),
      get: jest.fn(),
      setex: jest.fn(),
      expire: jest.fn(),
      del: jest.fn(),
      connect: jest.fn().mockResolvedValue(undefined),
      quit: jest.fn().mockResolvedValue(undefined),
    };

    mockModel = {
      findOne: jest.fn(),
      findOneAndUpdate: jest.fn(),
      updateOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PlanCacheService,
        {
          provide: getModelToken(DailyPlanDocument.name),
          useValue: mockModel,
        },
      ],
    }).compile();

    service = module.get<PlanCacheService>(PlanCacheService);

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    (service as unknown as { redis: typeof mockRedis }).redis = mockRedis;
  });

  describe('checkRedisCache', () => {
    it('should return hit when hash matches', async () => {
      mockRedis.hgetall.mockResolvedValue({ input_hash: 'abc123', cache_hits: '0' });
      mockRedis.get.mockResolvedValue(JSON.stringify(mockPlan));
      mockRedis.hincrby.mockResolvedValue(1);

      const result = await service.checkRedisCache('user-1', '2025-12-21', 'abc123');

      expect(result.hit).toBe(true);
      expect(result.plan).toEqual(mockPlan);
      expect(result.latency_ms).toBeGreaterThanOrEqual(0);
      expect(mockRedis.hincrby).toHaveBeenCalledWith(
        'plan:meta:user-1:2025-12-21',
        'cache_hits',
        1,
      );
    });

    it('should return miss when hash differs', async () => {
      mockRedis.hgetall.mockResolvedValue({ input_hash: 'old-hash' });

      const result = await service.checkRedisCache('user-1', '2025-12-21', 'new-hash');

      expect(result.hit).toBe(false);
      expect(result.plan).toBeUndefined();
    });

    it('should return miss when no cache exists', async () => {
      mockRedis.hgetall.mockResolvedValue({});

      const result = await service.checkRedisCache('user-1', '2025-12-21', 'abc123');

      expect(result.hit).toBe(false);
    });

    it('should return miss when meta exists but payload missing', async () => {
      mockRedis.hgetall.mockResolvedValue({ input_hash: 'abc123' });
      mockRedis.get.mockResolvedValue(null);

      const result = await service.checkRedisCache('user-1', '2025-12-21', 'abc123');

      expect(result.hit).toBe(false);
    });

    it('should handle Redis errors gracefully', async () => {
      mockRedis.hgetall.mockRejectedValue(new Error('Redis connection error'));

      const result = await service.checkRedisCache('user-1', '2025-12-21', 'abc123');

      expect(result.hit).toBe(false);
    });
  });

  describe('setRedisCache', () => {
    it('should set meta and payload with TTL', async () => {
      await service.setRedisCache('user-1', '2025-12-21', 'abc123', mockPlan, 'plan-id-1');

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'plan:meta:user-1:2025-12-21',
        expect.objectContaining({
          input_hash: 'abc123',
          plan_id: 'plan-id-1',
          cache_hits: '0',
        }),
      );
      expect(mockRedis.expire).toHaveBeenCalled();
      expect(mockRedis.setex).toHaveBeenCalledWith(
        'plan:payload:user-1:2025-12-21:abc123',
        expect.any(Number),
        JSON.stringify(mockPlan),
      );
    });

    it('should handle missing planId', async () => {
      await service.setRedisCache('user-1', '2025-12-21', 'abc123', mockPlan);

      expect(mockRedis.hset).toHaveBeenCalledWith(
        'plan:meta:user-1:2025-12-21',
        expect.objectContaining({
          plan_id: '',
        }),
      );
    });
  });

  describe('invalidateRedisCache', () => {
    it('should delete meta and payload keys', async () => {
      mockRedis.hgetall.mockResolvedValue({ input_hash: 'abc123' });

      await service.invalidateRedisCache('user-1', '2025-12-21');

      expect(mockRedis.del).toHaveBeenCalledWith('plan:payload:user-1:2025-12-21:abc123');
      expect(mockRedis.del).toHaveBeenCalledWith('plan:meta:user-1:2025-12-21');
    });

    it('should only delete meta key when no hash exists', async () => {
      mockRedis.hgetall.mockResolvedValue({});

      await service.invalidateRedisCache('user-1', '2025-12-21');

      expect(mockRedis.del).toHaveBeenCalledTimes(1);
      expect(mockRedis.del).toHaveBeenCalledWith('plan:meta:user-1:2025-12-21');
    });
  });

  describe('findInMongo', () => {
    it('should return found when document exists', async () => {
      const mockDoc = {
        user_id: 'user-1',
        date: '2025-12-21',
        input_hash: 'abc123',
        plan: mockPlan,
      };
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockDoc),
      });

      const result = await service.findInMongo('user-1', '2025-12-21', 'abc123');

      expect(result.found).toBe(true);
      expect(result.document).toEqual(mockDoc);
      expect(result.latency_ms).toBeGreaterThanOrEqual(0);
    });

    it('should return not found when no document exists', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findInMongo('user-1', '2025-12-21', 'abc123');

      expect(result.found).toBe(false);
      expect(result.document).toBeUndefined();
    });

    it('should handle MongoDB errors gracefully', async () => {
      mockModel.findOne.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('MongoDB error')),
      });

      const result = await service.findInMongo('user-1', '2025-12-21', 'abc123');

      expect(result.found).toBe(false);
    });
  });

  describe('findLatestInMongo', () => {
    it('should return latest document sorted by createdAt', async () => {
      const mockDoc = { user_id: 'user-1', plan: mockPlan };
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(mockDoc),
        }),
      });

      const result = await service.findLatestInMongo('user-1', '2025-12-21');

      expect(result).toEqual(mockDoc);
      expect(mockModel.findOne).toHaveBeenCalledWith({ user_id: 'user-1', date: '2025-12-21' });
    });

    it('should return null when no documents exist', async () => {
      mockModel.findOne.mockReturnValue({
        sort: jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(null),
        }),
      });

      const result = await service.findLatestInMongo('user-1', '2025-12-21');

      expect(result).toBeNull();
    });
  });

  describe('persistToMongo', () => {
    it('should upsert document and return planId', async () => {
      const mockResult = {
        plan_id: 'plan-123',
        _id: { toString: () => 'mongo-id-123' },
      };
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockResult),
      });

      const result = await service.persistToMongo(
        'user-1',
        '2025-12-21',
        'abc123',
        mockPlan,
        {
          usedFallback: false,
          safetyResult: { passed: true, violations: [], repaired: false },
        },
      );

      expect(result.planId).toBe('plan-123');
      expect(result.latency_ms).toBeGreaterThanOrEqual(0);
      expect(mockModel.findOneAndUpdate).toHaveBeenCalledWith(
        { user_id: 'user-1', date: '2025-12-21', input_hash: 'abc123' },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        { $setOnInsert: expect.objectContaining({ user_id: 'user-1', plan: mockPlan }) },
        { upsert: true, new: true },
      );
    });

    it('should handle MongoDB errors gracefully', async () => {
      mockModel.findOneAndUpdate.mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('MongoDB error')),
      });

      const result = await service.persistToMongo(
        'user-1',
        '2025-12-21',
        'abc123',
        mockPlan,
        {
          usedFallback: false,
          safetyResult: { passed: true, violations: [], repaired: false },
        },
      );

      expect(result.planId).toBe('error');
    });
  });

  describe('incrementMongoCacheHits', () => {
    it('should increment cache_hits field', async () => {
      mockModel.updateOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue({ modifiedCount: 1 }),
      });

      await service.incrementMongoCacheHits('user-1', '2025-12-21', 'abc123');

      expect(mockModel.updateOne).toHaveBeenCalledWith(
        { user_id: 'user-1', date: '2025-12-21', input_hash: 'abc123' },
        { $inc: { cache_hits: 1 } },
      );
    });
  });

  describe('logCacheResult', () => {
    it('should log cache result with latency breakdown', () => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      const logSpy = jest.spyOn((service as unknown as { logger: { log: jest.Mock } }).logger, 'log');

      service.logCacheResult({
        plan: mockPlan,
        source: 'redis',
        inputHash: 'abc123',
        cached: true,
        latency: {
          redis_ms: 5,
          total_ms: 5,
        },
      });

      expect(logSpy).toHaveBeenCalledWith(
        expect.stringContaining('[plan.cache_hit_redis]'),
      );
    });
  });
});
