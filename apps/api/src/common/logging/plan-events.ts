/*
 * LICENSE PLACEHOLDER
 */

import { Logger } from '@nestjs/common';

const PLAN_LOG_EVENTS = {
  CACHE_HIT_REDIS: 'plan.cache_hit_redis',
  CACHE_HIT_MONGO: 'plan.cache_hit_mongo',
  CACHE_MISS: 'plan.cache_miss',
  GENERATED_NEW: 'plan.generated_new',
  PERSISTED_MONGO: 'plan.persisted_mongo',
  SOFT_REGEN_TRIGGERED: 'plan.soft_regen_triggered',
  SOFT_REGEN_SKIPPED: 'plan.soft_regen_skipped',
  CACHE_INVALIDATED: 'plan.cache_invalidated',
  FALLBACK_USED: 'plan.fallback_used',
  VALIDATION_FAILED: 'plan.validation_failed',
  GUARDRAIL_VIOLATION: 'plan.guardrail_violation',
} as const;

type PlanLogEvent = typeof PLAN_LOG_EVENTS[keyof typeof PLAN_LOG_EVENTS];

interface PlanLogContext {
  event: PlanLogEvent;
  user_id: string;
  date: string;
  input_hash?: string;
  source?: 'redis' | 'mongo' | 'generated';
  latency_ms?: number;
  redis_ms?: number;
  mongo_ms?: number;
  generate_ms?: number;
  mongo_id?: string;
  plan_id?: string;
  trigger_type?: string;
  cached?: boolean;
  used_fallback?: boolean;
  violations?: string[];
}

interface LatencyBreakdown {
  redis_ms?: number;
  mongo_ms?: number;
  generate_ms?: number;
  total_ms: number;
}

function formatLatency(latency: LatencyBreakdown): string {
  const parts: string[] = [];
  if (latency.redis_ms !== undefined) parts.push(`redis=${latency.redis_ms}ms`);
  if (latency.mongo_ms !== undefined) parts.push(`mongo=${latency.mongo_ms}ms`);
  if (latency.generate_ms !== undefined) parts.push(`generate=${latency.generate_ms}ms`);
  parts.push(`total=${latency.total_ms}ms`);
  return parts.join(', ');
}

function logPlanEvent(logger: Logger, context: PlanLogContext): void {
  const logEntry = {
    ...context,
    timestamp: new Date().toISOString(),
  };

  const messagePrefix = `[${context.event}]`;
  const userInfo = `user=${context.user_id}, date=${context.date}`;
  const hashInfo = context.input_hash ? `, hash=${context.input_hash.slice(0, 8)}` : '';
  const sourceInfo = context.source ? `, source=${context.source}` : '';
  const latencyInfo = context.latency_ms !== undefined ? `, latency=${context.latency_ms}ms` : '';

  logger.log(`${messagePrefix} ${userInfo}${hashInfo}${sourceInfo}${latencyInfo}`);

  if (process.env.STRUCTURED_LOGGING === 'true') {
    logger.log(JSON.stringify(logEntry));
  }
}

function logCacheHit(
  logger: Logger,
  source: 'redis' | 'mongo',
  userId: string,
  date: string,
  inputHash: string,
  latency: LatencyBreakdown,
): void {
  const event = source === 'redis' ? PLAN_LOG_EVENTS.CACHE_HIT_REDIS : PLAN_LOG_EVENTS.CACHE_HIT_MONGO;

  logPlanEvent(logger, {
    event,
    user_id: userId,
    date,
    input_hash: inputHash,
    source,
    latency_ms: latency.total_ms,
    redis_ms: latency.redis_ms,
    mongo_ms: latency.mongo_ms,
    cached: true,
  });
}

function logCacheMiss(
  logger: Logger,
  userId: string,
  date: string,
  inputHash: string,
  reason: string,
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.CACHE_MISS,
    user_id: userId,
    date,
    input_hash: inputHash,
    trigger_type: reason,
    cached: false,
  });
}

function logPlanGenerated(
  logger: Logger,
  userId: string,
  date: string,
  inputHash: string,
  latency: LatencyBreakdown,
  usedFallback: boolean,
  planId?: string,
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.GENERATED_NEW,
    user_id: userId,
    date,
    input_hash: inputHash,
    source: 'generated',
    latency_ms: latency.total_ms,
    generate_ms: latency.generate_ms,
    mongo_ms: latency.mongo_ms,
    plan_id: planId,
    used_fallback: usedFallback,
    cached: false,
  });
}

function logMongoPersisted(
  logger: Logger,
  userId: string,
  date: string,
  inputHash: string,
  planId: string,
  latencyMs: number,
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.PERSISTED_MONGO,
    user_id: userId,
    date,
    input_hash: inputHash,
    plan_id: planId,
    latency_ms: latencyMs,
  });
}

function logCacheInvalidated(
  logger: Logger,
  userId: string,
  date: string,
  reason?: string,
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.CACHE_INVALIDATED,
    user_id: userId,
    date,
    trigger_type: reason,
  });
}

function logFallbackUsed(
  logger: Logger,
  userId: string,
  date: string,
  reason: string,
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.FALLBACK_USED,
    user_id: userId,
    date,
    trigger_type: reason,
    used_fallback: true,
  });
}

function logGuardrailViolation(
  logger: Logger,
  userId: string,
  date: string,
  violations: string[],
): void {
  logPlanEvent(logger, {
    event: PLAN_LOG_EVENTS.GUARDRAIL_VIOLATION,
    user_id: userId,
    date,
    violations,
  });
}

export {
  PLAN_LOG_EVENTS,
  logPlanEvent,
  logCacheHit,
  logCacheMiss,
  logPlanGenerated,
  logMongoPersisted,
  logCacheInvalidated,
  logFallbackUsed,
  logGuardrailViolation,
  formatLatency,
};

export type { PlanLogEvent, PlanLogContext, LatencyBreakdown };
