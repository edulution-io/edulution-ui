/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import {
  buildRecoOutboxKey,
  buildRecoCandidateKey,
  RECO_CANDIDATE_TTL_SECONDS,
  RECO_OUTBOX_TTL_SECONDS,
} from '@edulution/events';
import type { RecommendationCandidate, RecommendationOutboxItem } from '@edulution/events';
import redisConnection from '../common/redis.connection';

const DEFAULT_LIST_LIMIT = 10;
const MAX_LIST_LIMIT = 50;

@Injectable()
class RecommendationsService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RecommendationsService.name);

  private redis: Redis | null = null;

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
      this.logger.log('RecommendationsService initialized');
    } catch (error) {
      this.logger.error('Failed to initialize RecommendationsService', error);
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

  async putCandidate(candidate: RecommendationCandidate, score: number): Promise<void> {
    const redis = this.ensureRedis();
    const candidateKey = buildRecoCandidateKey(candidate.candidate_id);
    const outboxKey = buildRecoOutboxKey(candidate.user_id);

    const pipeline = redis.pipeline();
    pipeline.setex(candidateKey, RECO_CANDIDATE_TTL_SECONDS, JSON.stringify(candidate));
    pipeline.zadd(outboxKey, score, candidate.candidate_id);
    pipeline.expire(outboxKey, RECO_OUTBOX_TTL_SECONDS);

    await pipeline.exec();
  }

  async list(userId: string, limit: number = DEFAULT_LIST_LIMIT): Promise<RecommendationOutboxItem[]> {
    const redis = this.ensureRedis();
    const outboxKey = buildRecoOutboxKey(userId);
    const effectiveLimit = Math.min(Math.max(1, limit), MAX_LIST_LIMIT);

    const candidateIdsWithScores = await redis.zrevrange(outboxKey, 0, effectiveLimit - 1, 'WITHSCORES');

    if (candidateIdsWithScores.length === 0) {
      return [];
    }

    const candidates: RecommendationOutboxItem[] = [];
    const expiredIds: string[] = [];
    const now = new Date();

    const pairs: Array<{ id: string; score: number }> = [];
    for (let i = 0; i < candidateIdsWithScores.length; i += 2) {
      pairs.push({
        id: candidateIdsWithScores[i],
        score: parseFloat(candidateIdsWithScores[i + 1]),
      });
    }

    const candidateKeys = pairs.map((p) => buildRecoCandidateKey(p.id));
    const dataResults = await redis.mget(...candidateKeys);

    const seenDedupKeys = new Set<string>();

    dataResults.forEach((data, index) => {
      const { id, score } = pairs[index];

      if (!data) {
        expiredIds.push(id);
        return;
      }

      const candidate = JSON.parse(data) as RecommendationCandidate;

      if (candidate.expires_at && new Date(candidate.expires_at) < now) {
        expiredIds.push(id);
        return;
      }

      const dedupKey = candidate.dedup_key || candidate.candidate_id;
      if (seenDedupKeys.has(dedupKey)) {
        expiredIds.push(id);
        return;
      }
      seenDedupKeys.add(dedupKey);

      candidates.push({
        candidate_id: candidate.candidate_id,
        dedup_key: candidate.dedup_key,
        score,
        created_at: candidate.created_at,
        class: candidate.class,
        title: candidate.title,
        rationale: candidate.rationale,
        context_id: candidate.context_id,
        sources_involved: candidate.sources_involved,
        explainability: candidate.explainability,
        action_proposal: candidate.action_proposal,
        push_title: candidate.push_title,
        push_content: candidate.push_content,
      });
    });

    if (expiredIds.length > 0) {
      await redis.zrem(outboxKey, ...expiredIds);
    }

    return RecommendationsService.stableSort(candidates);
  }

  private static stableSort(items: RecommendationOutboxItem[]): RecommendationOutboxItem[] {
    return items.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      if (a.created_at !== b.created_at) return a.created_at.localeCompare(b.created_at);
      return a.candidate_id.localeCompare(b.candidate_id);
    });
  }

  async getCandidate(candidateId: string): Promise<RecommendationCandidate | null> {
    const redis = this.ensureRedis();
    const key = buildRecoCandidateKey(candidateId);
    const data = await redis.get(key);

    if (!data) {
      return null;
    }

    const candidate = JSON.parse(data) as RecommendationCandidate;

    if (candidate.expires_at && new Date(candidate.expires_at) < new Date()) {
      return null;
    }

    return candidate;
  }

  async clear(userId: string): Promise<void> {
    const redis = this.ensureRedis();
    const outboxKey = buildRecoOutboxKey(userId);
    const candidateIds = await redis.zrange(outboxKey, 0, -1);

    if (candidateIds.length > 0) {
      const candidateKeys = candidateIds.map((id) => buildRecoCandidateKey(id));
      await redis.del(...candidateKeys);
    }

    await redis.del(outboxKey);
  }

  async listInterleaved(
    userId: string,
    limit: number = DEFAULT_LIST_LIMIT,
  ): Promise<RecommendationOutboxItem[]> {
    const candidates = await this.list(userId, limit * 3);

    if (candidates.length === 0) return [];

    const byClass = new Map<string, RecommendationOutboxItem[]>();
    for (const rec of candidates) {
      const classRecs = byClass.get(rec.class) || [];
      classRecs.push(rec);
      byClass.set(rec.class, classRecs);
    }

    const result: RecommendationOutboxItem[] = [];
    const classQueues = [...byClass.values()];
    let classIndex = 0;

    while (result.length < limit && classQueues.some((q) => q.length > 0)) {
      const queue = classQueues[classIndex % classQueues.length];
      if (queue.length > 0) {
        const item = queue.shift();
        if (item) {
          result.push(item);
        }
      }
      classIndex++;
    }

    return result;
  }
}

export default RecommendationsService;
