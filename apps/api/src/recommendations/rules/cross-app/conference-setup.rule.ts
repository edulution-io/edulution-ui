/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { RecommendationCandidate } from '@edulution/events';
import { createActionStep, createActionProposal } from '@edulution/events';
import { buildCrossAppCandidate, normalizeText, getYear } from './base';
import { generateWhyText } from '../../templates';
import { getRiskPolicyConfig, getReversibleStatus } from '../../config';
import { generateDedupKey, isDuplicate, markAsProcessed } from '../../utils';
import redisConnection from '../../../common/redis.connection';

export interface ConferenceEvent {
  event_id: string;
  action: string;
  source: string;
  conference_id: string;
  subject_name: string;
  scheduled_at?: string;
  occurred_at: string;
  participants?: string[];
}

const DEDUP_TTL_DAYS = 30;

@Injectable()
class ConferenceSetupRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.conference_setup';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(ConferenceSetupRule.name);

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

  async evaluate(userId: string, event: ConferenceEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'conference.created') {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(ConferenceSetupRule.RULE_ID, event.conference_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.conference_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const folderName = `${normalizeText(event.subject_name)}_${getYear(event.scheduled_at)}`;
    const chatName = `${event.subject_name} - Diskussion`;

    const steps = [
      createActionStep(
        'create_folder',
        'files.create_folder',
        `Create folder "${folderName}"`,
        { name: folderName, path: '/Kurse' },
      ),
      createActionStep(
        'create_chat',
        'chat.group_create',
        `Create group chat "${chatName}"`,
        { name: chatName, members: event.participants || [] },
      ),
    ];

    const riskConfig = getRiskPolicyConfig(ConferenceSetupRule.RULE_ID);
    const proposal = createActionProposal(
      `${ConferenceSetupRule.RULE_ID}:${event.conference_id}`,
      `Setup workspace for ${event.subject_name}`,
      'Create folder for materials and group chat for discussion',
      steps,
      {
        trigger_event_id: event.event_id,
        trigger_action: event.action,
        source: event.source,
      },
      {
        impact: 'low',
        reversible: getReversibleStatus(steps),
        risk: riskConfig.risk,
        policy: riskConfig.policy,
        auditRequired: riskConfig.audit_required,
      },
    );

    return buildCrossAppCandidate(
      userId,
      ConferenceSetupRule.RULE_ID,
      ConferenceSetupRule.RULE_VERSION,
      { ...event, object_id: event.conference_id },
      proposal,
      dedupKey,
      {
        class: 'organization',
        title: `Workspace für ${event.subject_name} einrichten`,
        rationale: generateWhyText('conference.created', { subject_name: event.subject_name }),
        pushContext: { subject_name: event.subject_name },
      },
    );
  }
}

export default ConferenceSetupRule;
