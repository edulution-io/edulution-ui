/*
 * LICENSE PLACEHOLDER
 */

import * as crypto from 'crypto';
import type Redis from 'ioredis';

const DEFAULT_DEDUP_TTL_DAYS = 30;

function generateDedupKey(ruleId: string, contextId: string, userId: string): string {
  const baseRuleId = ruleId.split(':')[0];
  const input = `${baseRuleId}|${contextId}|${userId}`;
  const hash = crypto.createHash('sha256').update(input).digest('hex').slice(0, 16);

  return `dedup:${baseRuleId}:${hash}`;
}

async function isDuplicate(redis: Redis, dedupKey: string): Promise<boolean> {
  const exists = await redis.exists(dedupKey);
  return exists === 1;
}

async function markAsProcessed(
  redis: Redis,
  dedupKey: string,
  ttlDays: number = DEFAULT_DEDUP_TTL_DAYS,
): Promise<void> {
  await redis.setex(dedupKey, ttlDays * 24 * 60 * 60, '1');
}

export { generateDedupKey, isDuplicate, markAsProcessed };
