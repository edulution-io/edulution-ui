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

export interface TargetGroup {
  group_id: string;
  name: string;
  chat_id?: string;
}

export interface BulletinEvent {
  event_id: string;
  action: string;
  source: string;
  bulletin_id: string;
  title: string;
  is_important: boolean;
  occurred_at: string;
  target_groups?: TargetGroup[];
}

const DEDUP_TTL_DAYS = 7;

@Injectable()
class BulletinNotifyRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.bulletin_notify';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(BulletinNotifyRule.name);

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

  async evaluate(userId: string, event: BulletinEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'bulletin.created' || !event.is_important) {
      return null;
    }

    const groupsWithChat = (event.target_groups || []).filter((g) => g.chat_id);
    if (groupsWithChat.length === 0) {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(BulletinNotifyRule.RULE_ID, event.bulletin_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.bulletin_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const steps = groupsWithChat.map((group, i) =>
      createActionStep(
        `notify_${i}`,
        'chat.send_message',
        `Notify ${group.name}`,
        {
          chat_id: group.chat_id,
          message: `Wichtige Ankündigung: ${event.title}\n\nBitte lesen Sie die Details im Bulletin Board.`,
        },
      ),
    );

    const riskConfig = getRiskPolicyConfig(BulletinNotifyRule.RULE_ID);
    const proposal = createActionProposal(
      `${BulletinNotifyRule.RULE_ID}:${event.bulletin_id}`,
      `Notify about "${this.truncate(event.title, 30)}"`,
      `Send chat notifications to ${groupsWithChat.length} group(s)`,
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
      BulletinNotifyRule.RULE_ID,
      BulletinNotifyRule.RULE_VERSION,
      { ...event, object_id: event.bulletin_id },
      proposal,
      dedupKey,
      {
        class: 'communication',
        title: 'Gruppen über Mitteilung benachrichtigen',
        rationale: generateWhyText('bulletin.created', { title: event.title, is_important: true }),
        pushContext: { title: event.title, group_count: groupsWithChat.length },
      },
    );
  }

  private truncate(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max - 3)  }...` : text;
  }
}

export default BulletinNotifyRule;
