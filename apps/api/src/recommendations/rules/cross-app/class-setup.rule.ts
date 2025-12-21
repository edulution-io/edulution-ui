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

export interface ClassEvent {
  event_id: string;
  action: string;
  source: string;
  class_id: string;
  class_name: string;
  occurred_at: string;
  students?: string[];
  teachers?: string[];
}

const DEDUP_TTL_DAYS = 90;

@Injectable()
class ClassSetupRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.class_setup';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(ClassSetupRule.name);

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

  async evaluate(userId: string, event: ClassEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'class.created') {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(ClassSetupRule.RULE_ID, event.class_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.class_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const className = event.class_name;
    const basePath = `/Klassen/${className}`;

    const steps = [
      createActionStep(
        'create_class_folder',
        'files.create_folder',
        `Create class folder "${className}"`,
        { name: className, path: '/Klassen' },
      ),
      createActionStep(
        'create_materials_folder',
        'files.create_folder',
        'Create materials subfolder',
        { name: 'Materialien', path: basePath },
        { dependsOn: ['create_class_folder'] },
      ),
      createActionStep(
        'create_submissions_folder',
        'files.create_folder',
        'Create submissions subfolder',
        { name: 'Abgaben', path: basePath },
        { dependsOn: ['create_class_folder'] },
      ),
      createActionStep(
        'create_class_chat',
        'chat.group_create',
        `Create class chat "${className}"`,
        {
          name: `${className} Chat`,
          members: [...(event.students || []), ...(event.teachers || [])],
        },
      ),
      createActionStep(
        'create_welcome_bulletin',
        'bulletin.create',
        'Post welcome announcement',
        {
          title: `Willkommen in ${className}`,
          content: `Die Klasse ${className} wurde eingerichtet. Alle Materialien finden Sie im Klassenordner.`,
          category_id: 'classes',
        },
        { optional: true },
      ),
    ];

    const riskConfig = getRiskPolicyConfig(ClassSetupRule.RULE_ID);
    const proposal = createActionProposal(
      `${ClassSetupRule.RULE_ID}:${event.class_id}`,
      `Setup class "${className}"`,
      'Create folder structure, group chat, and welcome bulletin',
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
      ClassSetupRule.RULE_ID,
      ClassSetupRule.RULE_VERSION,
      { ...event, object_id: event.class_id },
      proposal,
      dedupKey,
      {
        class: 'organization',
        title: `Klasse "${className}" einrichten`,
        rationale: generateWhyText('class.created', { class_name: className }),
        pushContext: { class_name: className },
      },
    );
  }
}

export default ClassSetupRule;
