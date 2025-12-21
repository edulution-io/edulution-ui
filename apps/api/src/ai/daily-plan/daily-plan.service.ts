/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger } from '@nestjs/common';
import type { DailySummary, RecommendationOutboxItem } from '@edulution/events';
import AIService from '../ai.service';
import SummaryService from '../../summaries/summary.service';
import RecommendationsService from '../../recommendations/recommendations.service';
import DailyPlanMetricsService from './daily-plan.metrics';
import PlanCacheService from './services/plan-cache.service';
import { buildDailyPlanPrompt } from './prompts/daily-plan.prompt';
import type { AiDailyPlan } from './schemas/daily-plan.schema';
import { AiDailyPlanSchema } from './schemas/daily-plan.schema';
import type { InputsSnapshot, SafetyResult } from './schemas/input-snapshot.schema';
import { checkActivityLevelClaims, runAllGuardrails } from './validators/guardrails';
import { generateDeterministicPlan, generateScheduleFromPriorities } from './fallback/deterministic-plan';
import { repairPlanActivityClaims } from './fallback/text-repair';
import { deduplicatePriorities } from './utils/dedup-priorities';
import { computeInputHash, createCandidateSnapshots, createSummarySnapshot } from './utils/input-hash';
import UsersService from '../../users/users.service';

const DAILY_PLAN_PURPOSE = 'daily_plan';
const DEFAULT_RECOMMENDATIONS_LIMIT = 8;
const MAX_RECOMMENDATIONS_LIMIT = 20;

interface GenerateOptions {
  refresh?: boolean;
  limit?: number;
  configId?: string;
}

interface GenerateResult {
  plan: AiDailyPlan;
  cached: boolean;
  usedFallback: boolean;
  duration_ms: number;
  source: 'redis' | 'mongo' | 'generated';
  inputHash: string;
}

@Injectable()
class DailyPlanService {
  private readonly logger = new Logger(DailyPlanService.name);

  constructor(
    private readonly aiService: AIService,
    private readonly summaryService: SummaryService,
    private readonly recommendationsService: RecommendationsService,
    private readonly metrics: DailyPlanMetricsService,
    private readonly cacheService: PlanCacheService,
    private readonly usersService: UsersService,
  ) {}

  async getOrGenerateDailyPlan(userId: string, date: string, options: GenerateOptions = {}): Promise<GenerateResult> {
    const user = await this.usersService.findOne(userId);

    const language = user?.language || 'en';

    const { refresh = false, limit = DEFAULT_RECOMMENDATIONS_LIMIT, configId } = options;
    const startTime = Date.now();

    const [summary, recommendations] = await Promise.all([
      this.summaryService.getDailySummary(userId, date),
      this.recommendationsService.list(userId, Math.min(limit, MAX_RECOMMENDATIONS_LIMIT)),
    ]);

    const summarySnapshot = createSummarySnapshot(summary);
    const candidateSnapshots = createCandidateSnapshots(recommendations);
    const inputHash = computeInputHash(userId, date, summarySnapshot, candidateSnapshots);

    if (!refresh) {
      const redisResult = await this.cacheService.checkRedisCache(userId, date, inputHash);
      if (redisResult.hit && redisResult.plan) {
        const duration = Date.now() - startTime;
        this.metrics.recordGeneration(duration, true, true);
        this.cacheService.logCacheResult({
          plan: redisResult.plan,
          source: 'redis',
          inputHash,
          cached: true,
          latency: { redis_ms: redisResult.latency_ms, total_ms: duration },
        });

        void this.cacheService.incrementMongoCacheHits(userId, date, inputHash);

        return {
          plan: redisResult.plan,
          cached: true,
          usedFallback: false,
          duration_ms: duration,
          source: 'redis',
          inputHash,
        };
      }

      const mongoResult = await this.cacheService.findInMongo(userId, date, inputHash);
      if (mongoResult.found && mongoResult.document?.plan) {
        const { plan } = mongoResult.document;
        const planId = mongoResult.document.plan_id;

        await this.cacheService.setRedisCache(userId, date, inputHash, plan, planId);

        const duration = Date.now() - startTime;
        this.metrics.recordGeneration(duration, true, true);
        this.cacheService.logCacheResult({
          plan,
          source: 'mongo',
          inputHash,
          cached: true,
          latency: {
            redis_ms: redisResult.latency_ms,
            mongo_ms: mongoResult.latency_ms,
            total_ms: duration,
          },
        });

        void this.cacheService.incrementMongoCacheHits(userId, date, inputHash);

        return {
          plan,
          cached: true,
          usedFallback: false,
          duration_ms: duration,
          source: 'mongo',
          inputHash,
        };
      }
    }

    try {
      const generateStart = Date.now();
      const result = await this.generateDailyPlan(userId, date, summary, recommendations, {
        limit: Math.min(limit, MAX_RECOMMENDATIONS_LIMIT),
        configId,
        language,
      });
      const generateMs = Date.now() - generateStart;

      const safetyResult: SafetyResult = {
        passed: !result.usedFallback,
        violations: [],
        repaired: false,
      };

      const inputsSnapshot: InputsSnapshot = {
        summary: summarySnapshot,
        candidates: candidateSnapshots,
        date,
        requested_at: new Date().toISOString(),
      };

      const persistResult = await this.cacheService.persistToMongo(userId, date, inputHash, result.plan, {
        usedFallback: result.usedFallback,
        inputsSnapshot,
        safetyResult,
      });

      await this.cacheService.setRedisCache(userId, date, inputHash, result.plan, persistResult.planId);

      const duration = Date.now() - startTime;
      this.metrics.recordGeneration(duration, true, false);
      this.cacheService.logCacheResult({
        plan: result.plan,
        source: 'generated',
        inputHash,
        cached: false,
        latency: {
          generate_ms: generateMs,
          mongo_ms: persistResult.latency_ms,
          total_ms: duration,
        },
      });

      this.logger.log(`Generated daily plan for ${userId}/${date} in ${duration}ms (fallback: ${result.usedFallback})`);

      return {
        plan: result.plan,
        cached: false,
        usedFallback: result.usedFallback,
        duration_ms: duration,
        source: 'generated',
        inputHash,
      };
    } catch (error) {
      const duration = Date.now() - startTime;
      this.metrics.recordGeneration(duration, false, false);
      throw error;
    }
  }

  private async generateDailyPlan(
    userId: string,
    date: string,
    summary: DailySummary,
    recommendations: RecommendationOutboxItem[],
    options: { limit: number; configId?: string; language?: string },
  ): Promise<{ plan: AiDailyPlan; usedFallback: boolean }> {
    const allowedCandidateIds = new Set(recommendations.map((r) => r.candidate_id));

    try {
      const prompt = buildDailyPlanPrompt(summary, recommendations, { language: options.language });

      let response: string;
      if (options.configId) {
        response = await this.aiService.generateTextFromPrompt(options.configId, prompt);
      } else {
        response = await this.aiService.generateTextByPurpose(DAILY_PLAN_PURPOSE, prompt);
      }

      let plan = this.parseAndValidateSchema(response, userId, date);

      const guardrailResult = runAllGuardrails(plan, allowedCandidateIds);

      if (!guardrailResult.valid) {
        this.logger.warn(`Guardrail violations: ${guardrailResult.violations.join('; ')}`);
        this.metrics.recordSafetyViolation();

        if (guardrailResult.canRepair) {
          this.logger.log('Using deterministic fallback due to guardrail violations');
          return {
            plan: generateDeterministicPlan(userId, date, recommendations, options.language),
            usedFallback: true,
          };
        }
        throw new Error(`Guardrail failures: ${guardrailResult.violations.join('; ')}`);
      }

      const activityResult = checkActivityLevelClaims(plan, summary?.activity_level);
      if (!activityResult.valid) {
        this.logger.warn(`Activity claim violations: ${activityResult.violations.join('; ')}`);
        plan = repairPlanActivityClaims(plan);
      }

      const candidateClassMap = recommendations.reduce(
        (map, rec) => map.set(rec.candidate_id, rec.class),
        new Map<string, string>(),
      );

      const { priorities: dedupedPriorities, mergedCount } = deduplicatePriorities(plan.priorities, candidateClassMap);

      if (mergedCount > 0) {
        this.logger.log(`Merged ${mergedCount} duplicate priorities`);
        plan = {
          ...plan,
          priorities: dedupedPriorities,
          schedule_suggestion: generateScheduleFromPriorities(dedupedPriorities),
        };
      }

      plan = {
        ...plan,
        priorities: DailyPlanService.enrichPrioritiesWithActions(plan.priorities, recommendations),
      };

      return { plan, usedFallback: false };
    } catch (error) {
      this.logger.error(`LLM generation failed: ${(error as Error).message}`);
      this.logger.log('Using deterministic fallback due to error');
      return {
        plan: generateDeterministicPlan(userId, date, recommendations, options.language),
        usedFallback: true,
      };
    }
  }

  private parseAndValidateSchema(response: string, userId: string, date: string): AiDailyPlan {
    let jsonStr = response.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.slice(7);
    }
    if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.slice(3);
    }
    if (jsonStr.endsWith('```')) {
      jsonStr = jsonStr.slice(0, -3);
    }
    jsonStr = jsonStr.trim();

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonStr);
    } catch (e) {
      throw new Error(`Invalid JSON response from LLM: ${(e as Error).message}`);
    }

    if (typeof parsed === 'object' && parsed !== null) {
      const obj = parsed as Record<string, unknown>;
      obj.user_id = userId;
      obj.date = date;
      obj.generated_at = new Date().toISOString();

      if (Array.isArray(obj.priorities) && obj.priorities.length > 6) {
        this.logger.warn(`LLM returned ${obj.priorities.length} priorities, truncating to 6`);
        const truncatedPriorities = (obj.priorities as Array<Record<string, unknown>>)
          .slice(0, 6)
          .map((priority, i) => ({ ...priority, rank: i + 1 }));
        obj.priorities = truncatedPriorities;
      }
    }

    const result = AiDailyPlanSchema.safeParse(parsed);
    if (!result.success) {
      this.logger.error(`Schema validation failed: ${result.error.message}`);
      this.metrics.recordValidationFailure();
      throw new Error(`Schema validation failed: ${result.error.message}`);
    }

    return result.data;
  }

  private static enrichPrioritiesWithActions(
    priorities: AiDailyPlan['priorities'],
    recommendations: RecommendationOutboxItem[],
  ): AiDailyPlan['priorities'] {
    const recoMap = new Map(recommendations.map((r) => [r.candidate_id, r]));

    return priorities.map((priority) => {
      const candidateId = priority.linked_candidate_ids?.[0];
      if (!candidateId) return priority;

      const reco = recoMap.get(candidateId);
      if (!reco?.action_proposal) return priority;

      return {
        ...priority,
        action_proposal: {
          proposal_id: reco.action_proposal.proposal_id,
          title: reco.action_proposal.title,
          description: reco.action_proposal.description,
          steps: reco.action_proposal.steps.map((step) => ({
            step_id: step.step_id,
            capability: step.capability,
            description: step.description,
            params: step.params,
            depends_on: step.depends_on,
            optional: step.optional,
          })),
          requires_approval: reco.action_proposal.requires_approval,
          estimated_impact: reco.action_proposal.estimated_impact,
          reversible: reco.action_proposal.reversible,
          risk: reco.action_proposal.risk,
        },
      };
    });
  }

  async invalidateCache(userId: string, date: string): Promise<void> {
    await this.cacheService.invalidateRedisCache(userId, date);
    this.logger.debug(`Invalidated cache for ${userId}:${date}`);
  }
}

export default DailyPlanService;
export type { GenerateOptions, GenerateResult };
