/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';
import type { RecommendationCandidate } from '@edulution/events';
import { createActionStep, createActionProposal } from '@edulution/events';
import { buildCrossAppCandidate, normalizeText } from './base';
import { generateWhyText } from '../../templates';
import { getRiskPolicyConfig, getReversibleStatus } from '../../config';
import { generateDedupKey, isDuplicate, markAsProcessed } from '../../utils';
import redisConnection from '../../../common/redis.connection';

export interface ProjectEvent {
  event_id: string;
  action: string;
  source: string;
  project_id: string;
  project_name: string;
  occurred_at: string;
  members?: string[];
}

const DEDUP_TTL_DAYS = 30;

@Injectable()
class ProjectSetupRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.project_setup';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(ProjectSetupRule.name);

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

  async evaluate(userId: string, event: ProjectEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'project.created') {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(ProjectSetupRule.RULE_ID, event.project_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.project_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const folderName = `Projekt_${normalizeText(event.project_name)}`;
    const folderPath = `/Projekte/${folderName}`;

    const steps = [
      createActionStep(
        'create_folder',
        'files.create_folder',
        `Create project folder "${folderName}"`,
        { name: folderName, path: '/Projekte' },
      ),
      createActionStep(
        'create_chat',
        'chat.group_create',
        'Create project group chat',
        { name: `${event.project_name} Team`, members: event.members || [] },
      ),
      createActionStep(
        'create_share',
        'files.public_share_create',
        'Create shared link for collaborators',
        { path: folderPath },
        { dependsOn: ['create_folder'], optional: true },
      ),
    ];

    const riskConfig = getRiskPolicyConfig(ProjectSetupRule.RULE_ID);
    const proposal = createActionProposal(
      `${ProjectSetupRule.RULE_ID}:${event.project_id}`,
      `Setup project "${event.project_name}"`,
      'Create folder, group chat, and optional shared link',
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
      ProjectSetupRule.RULE_ID,
      ProjectSetupRule.RULE_VERSION,
      { ...event, object_id: event.project_id },
      proposal,
      dedupKey,
      {
        class: 'organization',
        title: `Projekt "${event.project_name}" einrichten`,
        rationale: generateWhyText('project.created', { project_name: event.project_name }),
        pushContext: { project_name: event.project_name },
      },
    );
  }
}

export default ProjectSetupRule;
