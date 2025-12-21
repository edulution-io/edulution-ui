/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { RecommendationCandidate } from '@edulution/events';
import { createActionStep, createActionProposal } from '@edulution/events';
import { buildCrossAppCandidate } from './base';
import { generateWhyText } from '../../templates';
import { getRiskPolicyConfig, getReversibleStatus } from '../../config';
import { generateDedupKey, isDuplicate, markAsProcessed } from '../../utils';
import redisConnection from '../../../common/redis.connection';

export interface SurveyEvent {
  event_id: string;
  action: string;
  source: string;
  survey_id: string;
  title: string;
  occurred_at: string;
  target_groups?: string[];
}

const DEDUP_TTL_DAYS = 30;

@Injectable()
class SurveyAnnounceRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.survey_announce';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(SurveyAnnounceRule.name);

  private redis: Redis | null = null;

  async onModuleInit(): Promise<void> {
    this.redis = new Redis({
      host: redisConnection.host,
      port: redisConnection.port,
      maxRetriesPerRequest: 3,
      lazyConnect: true,
    });
    await this.redis.connect();
  }

  async onModuleDestroy(): Promise<void> {
    if (this.redis) {
      await this.redis.quit();
      this.redis = null;
    }
  }

  private ensureRedis(): Redis {
    if (!this.redis) {
      throw new Error('Redis not initialized');
    }
    return this.redis;
  }

  async evaluate(userId: string, event: SurveyEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'survey.created') {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(SurveyAnnounceRule.RULE_ID, event.survey_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.survey_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const steps = [
      createActionStep(
        'create_bulletin',
        'bulletin.create',
        'Post survey announcement',
        {
          title: `Neue Umfrage: ${event.title}`,
          content: `Eine neue Umfrage "${event.title}" wurde erstellt. Bitte nehmen Sie teil.`,
          category_id: 'announcements',
          target_groups: event.target_groups || [],
        },
      ),
    ];

    const riskConfig = getRiskPolicyConfig(SurveyAnnounceRule.RULE_ID);
    const proposal = createActionProposal(
      `${SurveyAnnounceRule.RULE_ID}:${event.survey_id}`,
      `Announce survey "${event.title}"`,
      'Create bulletin to inform users about the new survey',
      steps,
      {
        trigger_event_id: event.event_id,
        trigger_action: event.action,
        source: event.source,
      },
      {
        impact: 'medium',
        reversible: getReversibleStatus(steps),
        risk: riskConfig.risk,
        policy: riskConfig.policy,
        auditRequired: riskConfig.audit_required,
      },
    );

    return buildCrossAppCandidate(
      userId,
      SurveyAnnounceRule.RULE_ID,
      SurveyAnnounceRule.RULE_VERSION,
      { ...event, object_id: event.survey_id },
      proposal,
      dedupKey,
      {
        class: 'communication',
        title: `Umfrage "${event.title}" ankündigen`,
        rationale: generateWhyText('survey.created', { title: event.title }),
        pushContext: { title: event.title },
      },
    );
  }
}

export default SurveyAnnounceRule;
