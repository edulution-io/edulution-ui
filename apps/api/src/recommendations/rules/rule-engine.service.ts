/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { randomUUID } from 'crypto';
import Redis from 'ioredis';
import type { RecommendationCandidate } from '@edulution/events';
import EventsQueryService from '../../events/events-query.service';
import RecommendationsService from '../recommendations.service';
import redisConnection from '../../common/redis.connection';
import type { Rule, RuleContext, RuleResult, RuleConfig } from './rule.interface';
import { getAllRules } from './scoring-rules';
import type { RecommendationVariant, VariantConfig } from '../variants/variant.types';
import { getVariantConfig } from '../variants/variant.types';
import { generatePushText } from '../templates';
import { generateDedupKey, computeSourcesInvolved } from '../utils';

const RECO_COOLDOWN_HOURS = 4;
const RECO_HISTORY_KEY_PREFIX = 'reco:history:';
const RECO_HISTORY_TTL_SECONDS = 7 * 24 * 60 * 60;
const RECO_HISTORY_MAX_ENTRIES = 100;
const MAX_CANDIDATES_PER_CLASS = 2;

/**
 * Class priority weights for recommendation scoring.
 *
 * Priority order: meeting > communication > focus > planning > cleanup
 *
 * Rationale:
 * - Meeting: Highest priority due to fixed time constraints
 * - Communication: High priority for responsiveness expectations
 * - Focus: Important for productivity but can be deferred
 * - Planning: Valuable but flexible timing
 * - Cleanup: Low urgency housekeeping tasks
 */
const CLASS_PRIORITY: Record<string, number> = {
  meeting: 1.0,
  communication: 0.85,
  focus: 0.70,
  planning: 0.55,
  cleanup: 0.40,
};

/**
 * Scoring weights for the improved recommendation algorithm.
 *
 * Formula: score = CLASS*0.4 + URGENCY*0.3 + CONFIDENCE*0.3
 *
 * - CLASS (40%): Recommendation class priority (meeting highest)
 * - URGENCY (30%): Time-based urgency from metadata
 *   - For meetings: Increases as meeting time approaches
 *   - For communications: Increases with wait time
 * - CONFIDENCE (30%): Original rule-generated score
 *
 * This weighted approach ensures that class priority is the dominant
 * factor while still considering urgency and rule confidence.
 */
const SCORING_WEIGHTS = {
  CLASS: 0.4,
  URGENCY: 0.3,
  CONFIDENCE: 0.3,
};

interface RecoHistoryEntry {
  class: string;
  context_id?: string;
  rule_id: string;
  generated_at: string;
}

export interface GenerateResult {
  user_id: string;
  variant: RecommendationVariant;
  candidates_generated: number;
  candidates_skipped: number;
  rules_evaluated: number;
  rules_filtered: number;
  duration_ms: number;
}

export interface GenerateOptions {
  force?: boolean;
  variant?: RecommendationVariant;
}

export interface RuleInfo {
  id: string;
  name: string;
  class: string;
  priority: number;
  enabled: boolean;
}

@Injectable()
class RuleEngineService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RuleEngineService.name);

  private readonly rules: Map<string, Rule> = new Map();

  private readonly ruleConfigs: Map<string, RuleConfig> = new Map();

  private redis: Redis | null = null;

  constructor(
    private readonly eventsQueryService: EventsQueryService,
    private readonly recommendationsService: RecommendationsService,
  ) {}

  async onModuleInit(): Promise<void> {
    try {
      this.redis = new Redis({
        host: redisConnection.host,
        port: redisConnection.port,
        maxRetriesPerRequest: 3,
        lazyConnect: true,
      });
      await this.redis.connect();
    } catch (error) {
      this.logger.error('Failed to connect to Redis for cooldown tracking', error);
    }

    const defaultRules = getAllRules();
    defaultRules.forEach((rule) => this.registerRule(rule));
    this.logger.log(`Initialized with ${this.rules.size} rules`);
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  registerRule(rule: Rule, config?: Partial<RuleConfig>): void {
    this.rules.set(rule.id, rule);
    if (config) {
      this.ruleConfigs.set(rule.id, { enabled: true, ...config });
    }
    this.logger.log(`Registered rule: ${rule.id} (${rule.name})`);
  }

  unregisterRule(ruleId: string): boolean {
    const deleted = this.rules.delete(ruleId);
    this.ruleConfigs.delete(ruleId);
    return deleted;
  }

  getRules(): RuleInfo[] {
    return Array.from(this.rules.values())
      .map((rule) => ({
        id: rule.id,
        name: rule.name,
        class: rule.class,
        priority: rule.priority,
        enabled: this.isRuleEnabled(rule.id),
      }))
      .sort((a, b) => b.priority - a.priority);
  }

  setRuleConfig(ruleId: string, config: Partial<RuleConfig>): boolean {
    const rule = this.rules.get(ruleId);
    if (!rule) return false;

    const existing = this.ruleConfigs.get(ruleId) || { enabled: true };
    this.ruleConfigs.set(ruleId, { ...existing, ...config });
    return true;
  }

  private isRuleEnabled(ruleId: string): boolean {
    const config = this.ruleConfigs.get(ruleId);
    return config?.enabled ?? true;
  }

  async generate(userId: string, options?: GenerateOptions): Promise<GenerateResult> {
    const startTime = Date.now();
    const variantConfig = getVariantConfig(options?.variant || 'full');

    const context = await this.buildContext(userId);

    const applicableRules = this.filterRulesForVariant(variantConfig);
    const rulesFiltered = this.rules.size - applicableRules.length;

    const results = this.evaluateRulesWithFilter(context, applicableRules);
    let allCandidates = this.convertToCandidates(userId, results);

    if (!variantConfig.enableScoreRanking) {
      allCandidates = this.sortByPriorityAndTime(allCandidates);
    } else {
      allCandidates = this.sortByScore(allCandidates);
    }

    let filteredCandidates = allCandidates;

    if (!options?.force) {
      const history = await this.getRecentHistory(userId);

      filteredCandidates = allCandidates.filter(
        (item) => !this.isOnCooldown(item.candidate, history),
      );
    }

    const seenContexts = new Set<string>();
    const uniqueCandidates = filteredCandidates.filter((item) => {
      const key = item.candidate.context_id || `__class__:${item.candidate.class}`;
      if (seenContexts.has(key)) return false;
      seenContexts.add(key);
      return true;
    });

    const { stored, skippedByDiversity } =
      await this.storeCandidatesWithDiversity(uniqueCandidates);

    const storedCandidates = uniqueCandidates.slice(0, stored);
    for (const item of storedCandidates) {
      await this.recordInHistory(userId, item.candidate, item.ruleId);
    }

    const candidatesSkipped = allCandidates.length - stored;
    const duration = Date.now() - startTime;

    this.logger.log(
      `[${variantConfig.variant}] Generated ${stored} candidates (${candidatesSkipped} skipped, ${skippedByDiversity} by diversity, ${rulesFiltered} rules filtered) for user ${userId} in ${duration}ms`,
    );

    return {
      user_id: userId,
      variant: variantConfig.variant,
      candidates_generated: stored,
      candidates_skipped: candidatesSkipped,
      rules_evaluated: applicableRules.length,
      rules_filtered: rulesFiltered,
      duration_ms: duration,
    };
  }

  private filterRulesForVariant(config: VariantConfig): Rule[] {
    const allRules = Array.from(this.rules.values());

    return allRules.filter((rule) => {
      if (!this.isRuleEnabled(rule.id)) {
        return false;
      }

      if (!config.enableCorrelation && rule.usesCorrelation) {
        return false;
      }

      if (!config.enableCrossSource && rule.sources.length > 1) {
        return false;
      }

      return true;
    });
  }

  private sortByPriorityAndTime(
    candidates: Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }>,
  ): typeof candidates {
    const classPriority: Record<string, number> = {
      meeting: 1,
      communication: 2,
      focus: 3,
      planning: 4,
      cleanup: 5,
    };

    return [...candidates].sort((a, b) => {
      const priorityA = classPriority[a.candidate.class] || 99;
      const priorityB = classPriority[b.candidate.class] || 99;
      if (priorityA !== priorityB) {
        return priorityA - priorityB;
      }

      return a.candidate.created_at.localeCompare(b.candidate.created_at);
    });
  }

  private sortByScore(
    candidates: Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }>,
  ): typeof candidates {
    return [...candidates].sort((a, b) => b.score - a.score);
  }

  private async getRecentHistory(userId: string): Promise<RecoHistoryEntry[]> {
    if (!this.redis) return [];

    const key = `${RECO_HISTORY_KEY_PREFIX}${userId}`;
    const entries = await this.redis.lrange(key, 0, RECO_HISTORY_MAX_ENTRIES - 1);

    return entries.map((e) => JSON.parse(e) as RecoHistoryEntry);
  }

  private isOnCooldown(
    candidate: RecommendationCandidate,
    history: RecoHistoryEntry[],
  ): boolean {
    const now = Date.now();
    const cooldownMs = RECO_COOLDOWN_HOURS * 60 * 60 * 1000;

    return history.some((entry) => {
      const entryTime = new Date(entry.generated_at).getTime();
      const isWithinCooldown = now - entryTime < cooldownMs;

      if (!isWithinCooldown) return false;
      if (entry.class !== candidate.class) return false;

      if (candidate.context_id && entry.context_id) {
        return candidate.context_id === entry.context_id;
      }

      return true;
    });
  }

  private async recordInHistory(
    userId: string,
    candidate: RecommendationCandidate,
    ruleId: string,
  ): Promise<void> {
    if (!this.redis) return;

    const key = `${RECO_HISTORY_KEY_PREFIX}${userId}`;
    const entry: RecoHistoryEntry = {
      class: candidate.class,
      context_id: candidate.context_id,
      rule_id: ruleId,
      generated_at: new Date().toISOString(),
    };

    await this.redis.lpush(key, JSON.stringify(entry));
    await this.redis.ltrim(key, 0, RECO_HISTORY_MAX_ENTRIES - 1);
    await this.redis.expire(key, RECO_HISTORY_TTL_SECONDS);
  }

  private calculateImprovedScore(
    candidate: RecommendationCandidate,
    ruleScore: number,
    metadata?: { meeting_time?: string; waiting_since?: string; [key: string]: unknown },
  ): number {
    const classPriority = CLASS_PRIORITY[candidate.class] || 0.5;
    const urgency = this.calculateUrgency(candidate, metadata);
    const confidence = ruleScore;

    const score =
      SCORING_WEIGHTS.CLASS * classPriority +
      SCORING_WEIGHTS.URGENCY * urgency +
      SCORING_WEIGHTS.CONFIDENCE * confidence;

    return Math.round(score * 1000) / 1000;
  }

  private calculateUrgency(
    candidate: RecommendationCandidate,
    metadata?: { meeting_time?: string; waiting_since?: string; [key: string]: unknown },
  ): number {
    const now = Date.now();

    if (candidate.class === 'meeting' && metadata?.meeting_time) {
      const meetingTime = new Date(metadata.meeting_time).getTime();
      const hoursUntil = (meetingTime - now) / (1000 * 60 * 60);

      if (hoursUntil <= 0.5) return 1.0;
      if (hoursUntil <= 1) return 0.9;
      if (hoursUntil <= 2) return 0.8;
      if (hoursUntil <= 4) return 0.6;
      return 0.4;
    }

    if (candidate.class === 'communication' && metadata?.waiting_since) {
      const waitingSince = new Date(metadata.waiting_since).getTime();
      const hoursWaiting = (now - waitingSince) / (1000 * 60 * 60);

      if (hoursWaiting >= 48) return 1.0;
      if (hoursWaiting >= 24) return 0.8;
      if (hoursWaiting >= 8) return 0.6;
      if (hoursWaiting >= 4) return 0.5;
      return 0.3;
    }

    return candidate.scores?.confidence || 0.5;
  }

  private async buildContext(userId: string): Promise<RuleContext> {
    const [signalsResponse, communications, upcomingMeetings] = await Promise.all([
      this.eventsQueryService.getUserSignals(userId),
      this.eventsQueryService.getUserCommunications(userId),
      this.eventsQueryService.getUserUpcomingMeetings(userId),
    ]);

    return {
      user_id: userId,
      timestamp: Date.now(),
      signals: signalsResponse.signals || {
        activity_level: 'none',
        primary_source: null,
        pending_communications: 0,
        upcoming_meetings: 0,
        last_computed: new Date().toISOString(),
      },
      last_seen: signalsResponse.last_seen,
      counts_1h: signalsResponse.counts_1h,
      counts_24h: signalsResponse.counts_24h,
      communications: {
        open_threads: communications.open_threads,
        awaiting_reply: communications.awaiting_reply,
      },
      upcoming_meetings: upcomingMeetings,
    };
  }

  private evaluateRulesWithFilter(context: RuleContext, rules: Rule[]): RuleResult[] {
    const results: RuleResult[] = [];
    const sortedRules = [...rules].sort((a, b) => b.priority - a.priority);

    sortedRules.forEach((rule) => {
      try {
        const ruleResults = rule.evaluate(context);
        results.push(...ruleResults);
      } catch (error) {
        this.logger.error(`Rule ${rule.id} failed: ${error}`);
      }
    });

    return results;
  }

  private validateCandidates(
    candidates: Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }>,
  ): Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }> {
    return candidates.filter((item) => {
      const { candidate, ruleId } = item;

      if (!candidate.explainability) {
        this.logger.warn(`Candidate from rule ${ruleId} missing explainability - filtering out`);
        return false;
      }

      if (!candidate.explainability.evidence || candidate.explainability.evidence.length === 0) {
        this.logger.warn(
          `Candidate from rule ${ruleId} has empty evidence chain - filtering out`,
        );
        return false;
      }

      if (!candidate.explainability.rule_id) {
        this.logger.warn(`Candidate from rule ${ruleId} missing rule_id in explainability`);
        return false;
      }

      return true;
    });
  }

  private convertToCandidates(
    userId: string,
    results: RuleResult[],
  ): Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }> {
    const candidates = results.map((result) => {
      const pushText = generatePushText(result.rule_id, result.metadata || {});
      const candidateId = randomUUID();
      const dedupKey = generateDedupKey(result.rule_id, result.context_id || candidateId, userId);
      const sourcesInvolved = result.explainability
        ? computeSourcesInvolved(result.explainability)
        : [];

      const candidate: RecommendationCandidate = {
        candidate_id: candidateId,
        dedup_key: dedupKey,
        user_id: userId,
        created_at: new Date().toISOString(),
        class: result.class,
        title: result.title,
        rationale: result.rationale,
        evidence: result.evidence,
        explainability: result.explainability,
        scores: {
          confidence: result.score,
          impact: result.score,
          effort: 1 - result.score,
        },
        sources_involved: sourcesInvolved,
        context_id: result.context_id,
        tags: result.tags,
        push_title: pushText.title,
        push_content: pushText.content,
      };

      const improvedScore = this.calculateImprovedScore(candidate, result.score, result.metadata);

      return {
        candidate,
        score: improvedScore,
        ruleId: result.rule_id,
      };
    });

    return this.validateCandidates(candidates);
  }

  private async storeCandidatesWithDiversity(
    candidates: Array<{ candidate: RecommendationCandidate; score: number; ruleId: string }>,
  ): Promise<{ stored: number; skippedByDiversity: number }> {
    const byClass = new Map<string, typeof candidates>();

    for (const item of candidates) {
      const classItems = byClass.get(item.candidate.class) || [];
      classItems.push(item);
      byClass.set(item.candidate.class, classItems);
    }

    const diverseCandidates: typeof candidates = [];

    for (const [className, classItems] of byClass) {
      classItems.sort((a, b) => b.score - a.score);

      const topItems = classItems.slice(0, MAX_CANDIDATES_PER_CLASS);
      diverseCandidates.push(...topItems);

      if (classItems.length > MAX_CANDIDATES_PER_CLASS) {
        this.logger.debug(
          `Diversity filter: Kept ${MAX_CANDIDATES_PER_CLASS}/${classItems.length} for class ${className}`,
        );
      }
    }

    await Promise.all(
      diverseCandidates.map(({ candidate, score }) =>
        this.recommendationsService.putCandidate(candidate, score),
      ),
    );

    return {
      stored: diverseCandidates.length,
      skippedByDiversity: candidates.length - diverseCandidates.length,
    };
  }
}

export default RuleEngineService;
