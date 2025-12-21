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

export interface SessionEvent {
  event_id: string;
  action: string;
  source: string;
  session_id: string;
  class_name: string;
  is_exam: boolean;
  occurred_at: string;
  scheduled_at?: string;
  students?: string[];
}

const DEDUP_TTL_DAYS = 7;

@Injectable()
class SessionExamRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.session_exam';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(SessionExamRule.name);

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

  async evaluate(userId: string, event: SessionEvent): Promise<RecommendationCandidate | null> {
    if (!event.is_exam) {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(SessionExamRule.RULE_ID, event.session_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.session_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const dateStr = this.formatDate(event.scheduled_at || event.occurred_at);
    const folderName = `Klausur_${event.class_name}_${dateStr}`;

    const steps = [
      createActionStep(
        'create_exam_folder',
        'files.create_folder',
        `Create exam folder "${folderName}"`,
        { name: folderName, path: '/Prüfungen' },
      ),
      createActionStep(
        'start_exam_mode',
        'lmn.start_exam',
        `Enable exam mode for ${event.class_name}`,
        { users: event.students || [] },
        { dependsOn: ['create_exam_folder'] },
      ),
    ];

    const riskConfig = getRiskPolicyConfig(SessionExamRule.RULE_ID);
    const proposal = createActionProposal(
      `${SessionExamRule.RULE_ID}:${event.session_id}`,
      `Prepare exam for ${event.class_name}`,
      'Create exam folder and enable exam mode for students',
      steps,
      {
        trigger_event_id: event.event_id,
        trigger_action: event.action,
        source: event.source,
      },
      {
        impact: 'high',
        reversible: getReversibleStatus(steps),
        risk: riskConfig.risk,
        policy: riskConfig.policy,
        auditRequired: riskConfig.audit_required,
      },
    );

    return buildCrossAppCandidate(
      userId,
      SessionExamRule.RULE_ID,
      SessionExamRule.RULE_VERSION,
      { ...event, object_id: event.session_id },
      proposal,
      dedupKey,
      {
        class: 'organization',
        title: `Prüfung für ${event.class_name} vorbereiten`,
        rationale: generateWhyText('session.started', { class_name: event.class_name, is_exam: true }),
        pushContext: { class_name: event.class_name },
      },
    );
  }

  private formatDate(dateStr: string): string {
    try {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }
}

export default SessionExamRule;
