/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import Redis from 'ioredis';
import redisConnection from '../../../common/redis.connection';
import { DailyPlanDocument, DailyPlanDocumentType } from '../schemas/daily-plan-document.schema';
import type { AiDailyPlan } from '../schemas/daily-plan.schema';
import type { InputsSnapshot, LlmMeta, SafetyResult, GenerationMeta } from '../schemas/input-snapshot.schema';

const DEFAULT_CACHE_TTL_HOURS = 168;

interface CacheResult {
  plan: AiDailyPlan;
  source: 'redis' | 'mongo' | 'generated';
  inputHash: string;
  cached: boolean;
  latency: {
    redis_ms?: number;
    mongo_ms?: number;
    generate_ms?: number;
    total_ms: number;
  };
}

interface PersistOptions {
  usedFallback: boolean;
  inputsSnapshot?: InputsSnapshot;
  llmMeta?: LlmMeta;
  safetyResult: SafetyResult;
}

interface RedisCacheCheckResult {
  hit: boolean;
  plan?: AiDailyPlan;
  latency_ms: number;
}

interface MongoFindResult {
  found: boolean;
  document?: DailyPlanDocumentType;
  latency_ms: number;
}

interface MongoPersistResult {
  planId: string;
  latency_ms: number;
}

@Injectable()
class PlanCacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlanCacheService.name);

  private redis: Redis | null = null;

  private readonly cacheTtlSeconds: number;

  private readonly persistInputs: boolean;

  constructor(
    @InjectModel(DailyPlanDocument.name) private readonly planModel: Model<DailyPlanDocumentType>,
  ) {
    const ttlHours = parseInt(process.env.PLAN_CACHE_TTL_HOURS || String(DEFAULT_CACHE_TTL_HOURS), 10);
    this.cacheTtlSeconds = ttlHours * 60 * 60;
    this.persistInputs = process.env.PERSIST_PLAN_INPUTS === 'true';
  }

  async onModuleInit(): Promise<void> {
    try {
      this.redis = new Redis({
        host: redisConnection.host,
        port: redisConnection.port,
        maxRetriesPerRequest: 3,
        enableReadyCheck: true,
        lazyConnect: true,
      });

      await this.redis.connect();
      this.logger.log('PlanCacheService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize PlanCacheService Redis connection', error);
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  private ensureRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis not connected');
    }
    return this.redis;
  }

  private static getRedisMetaKey(userId: string, date: string): string {
    return `plan:meta:${userId}:${date}`;
  }

  private static getRedisPayloadKey(userId: string, date: string, inputHash: string): string {
    return `plan:payload:${userId}:${date}:${inputHash}`;
  }

  async checkRedisCache(
    userId: string,
    date: string,
    currentInputHash: string,
  ): Promise<RedisCacheCheckResult> {
    const start = Date.now();

    try {
      const redis = this.ensureRedis();
      const metaKey = PlanCacheService.getRedisMetaKey(userId, date);
      const meta = await redis.hgetall(metaKey);

      if (!meta || !meta.input_hash) {
        return { hit: false, latency_ms: Date.now() - start };
      }

      if (meta.input_hash !== currentInputHash) {
        this.logger.debug(`Cache miss: hash mismatch (cached: ${meta.input_hash}, current: ${currentInputHash})`);
        return { hit: false, latency_ms: Date.now() - start };
      }

      const payloadKey = PlanCacheService.getRedisPayloadKey(userId, date, currentInputHash);
      const payloadJson = await redis.get(payloadKey);

      if (!payloadJson) {
        this.logger.warn(`Meta exists but payload missing for ${payloadKey}`);
        return { hit: false, latency_ms: Date.now() - start };
      }

      const plan = JSON.parse(payloadJson) as AiDailyPlan;

      await redis.hincrby(metaKey, 'cache_hits', 1);

      return {
        hit: true,
        plan,
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('Redis cache check failed', error);
      return { hit: false, latency_ms: Date.now() - start };
    }
  }

  async setRedisCache(
    userId: string,
    date: string,
    inputHash: string,
    plan: AiDailyPlan,
    planId?: string,
  ): Promise<void> {
    try {
      const redis = this.ensureRedis();
      const metaKey = PlanCacheService.getRedisMetaKey(userId, date);
      const payloadKey = PlanCacheService.getRedisPayloadKey(userId, date, inputHash);

      await redis.hset(metaKey, {
        input_hash: inputHash,
        plan_id: planId || '',
        cached_at: new Date().toISOString(),
        cache_hits: '0',
      });
      await redis.expire(metaKey, this.cacheTtlSeconds);

      await redis.setex(payloadKey, this.cacheTtlSeconds, JSON.stringify(plan));

      this.logger.debug(`Cached plan in Redis: ${payloadKey}`);
    } catch (error) {
      this.logger.error('Failed to set Redis cache', error);
    }
  }

  async invalidateRedisCache(userId: string, date: string): Promise<void> {
    try {
      const redis = this.ensureRedis();
      const metaKey = PlanCacheService.getRedisMetaKey(userId, date);
      const meta = await redis.hgetall(metaKey);

      if (meta?.input_hash) {
        const payloadKey = PlanCacheService.getRedisPayloadKey(userId, date, meta.input_hash);
        await redis.del(payloadKey);
      }

      await redis.del(metaKey);
      this.logger.debug(`Invalidated Redis cache for ${userId}:${date}`);
    } catch (error) {
      this.logger.error('Failed to invalidate Redis cache', error);
    }
  }

  async findInMongo(
    userId: string,
    date: string,
    inputHash: string,
  ): Promise<MongoFindResult> {
    const start = Date.now();

    try {
      const doc = await this.planModel.findOne({
        user_id: userId,
        date,
        input_hash: inputHash,
      }).exec();

      return {
        found: !!doc,
        document: doc || undefined,
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('MongoDB find failed', error);
      return { found: false, latency_ms: Date.now() - start };
    }
  }

  async findLatestInMongo(userId: string, date: string): Promise<DailyPlanDocumentType | null> {
    try {
      return await this.planModel
        .findOne({ user_id: userId, date })
        .sort({ createdAt: -1 })
        .exec();
    } catch (error) {
      this.logger.error('MongoDB findLatest failed', error);
      return null;
    }
  }

  async persistToMongo(
    userId: string,
    date: string,
    inputHash: string,
    plan: AiDailyPlan,
    options: PersistOptions,
  ): Promise<MongoPersistResult> {
    const start = Date.now();

    try {
      const now = new Date();
      const generationMeta: GenerationMeta = {
        service_version: process.env.npm_package_version || '0.0.0',
        git_sha: process.env.GIT_SHA,
        node_env: process.env.NODE_ENV || 'development',
      };

      const docData: Partial<DailyPlanDocument> = {
        user_id: userId,
        date,
        input_hash: inputHash,
        generated_at: now,
        generation_meta: generationMeta,
        safety: options.safetyResult,
        used_fallback: options.usedFallback,
        plan,
        cache_hits: 0,
      };

      if (this.persistInputs && options.inputsSnapshot) {
        docData.inputs_snapshot = options.inputsSnapshot;
      }

      if (options.llmMeta) {
        docData.llm_meta = options.llmMeta;
      }

      const result = await this.planModel.findOneAndUpdate(
        { user_id: userId, date, input_hash: inputHash },
        { $setOnInsert: docData },
        { upsert: true, new: true },
      ).exec();

      // eslint-disable-next-line no-underscore-dangle
      const planId = result.plan_id || result._id.toString();

      this.logger.debug(`Persisted plan to MongoDB: ${planId}`);

      return {
        planId,
        latency_ms: Date.now() - start,
      };
    } catch (error) {
      this.logger.error('MongoDB persist failed', error);
      return {
        planId: 'error',
        latency_ms: Date.now() - start,
      };
    }
  }

  async incrementMongoCacheHits(userId: string, date: string, inputHash: string): Promise<void> {
    try {
      await this.planModel.updateOne(
        { user_id: userId, date, input_hash: inputHash },
        { $inc: { cache_hits: 1 } },
      ).exec();
    } catch (error) {
      this.logger.error('Failed to increment MongoDB cache hits', error);
    }
  }

  logCacheResult(result: CacheResult): void {
    const { source, inputHash, cached, latency } = result;
    let event = 'plan.generated_new';
    if (cached) {
      event = source === 'redis' ? 'plan.cache_hit_redis' : 'plan.cache_hit_mongo';
    }

    const latencyParts = Object.entries(latency)
      .filter(([k, v]) => v !== undefined && k !== 'total_ms')
      .map(([k, v]) => `${k}=${v}ms`);

    this.logger.log(
      `[${event}] source=${source}, hash=${inputHash.slice(0, 8)}, ` +
      `cached=${cached}, latency=[${latencyParts.join(', ')}], total=${latency.total_ms}ms`,
    );

    if (process.env.STRUCTURED_LOGGING === 'true') {
      this.logger.log(JSON.stringify({
        event,
        source,
        input_hash: inputHash,
        cached,
        latency_ms: latency.total_ms,
        redis_ms: latency.redis_ms,
        mongo_ms: latency.mongo_ms,
        generate_ms: latency.generate_ms,
        timestamp: new Date().toISOString(),
      }));
    }
  }
}

export default PlanCacheService;
export type { CacheResult, PersistOptions, RedisCacheCheckResult, MongoFindResult, MongoPersistResult };
