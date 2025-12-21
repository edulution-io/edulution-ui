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

export interface MailAttachment {
  filename: string;
  temp_path: string;
  size: number;
}

export interface MailEvent {
  event_id: string;
  action: string;
  source: string;
  mail_id: string;
  subject: string;
  occurred_at: string;
  has_attachments: boolean;
  attachments?: MailAttachment[];
}

const DEDUP_TTL_DAYS = 7;

@Injectable()
class MailAttachmentRule implements OnModuleInit, OnModuleDestroy {
  static readonly RULE_ID = 'reco.cross.mail_attachment';

  static readonly RULE_VERSION = '1.0.0';

  private readonly logger = new Logger(MailAttachmentRule.name);

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

  async evaluate(userId: string, event: MailEvent): Promise<RecommendationCandidate | null> {
    if (event.action !== 'mail.received' || !event.has_attachments) {
      return null;
    }

    const attachments = event.attachments || [];
    if (attachments.length === 0) {
      return null;
    }

    const redis = this.ensureRedis();
    const dedupKey = generateDedupKey(MailAttachmentRule.RULE_ID, event.mail_id, userId);

    if (await isDuplicate(redis, dedupKey)) {
      this.logger.debug(`Skipping duplicate: ${event.mail_id}`);
      return null;
    }

    await markAsProcessed(redis, dedupKey, DEDUP_TTL_DAYS);

    const steps = attachments.map((att, i) =>
      createActionStep(
        `save_attachment_${i}`,
        'files.copy_file',
        `Save "${att.filename}"`,
        {
          source_path: att.temp_path,
          destination_path: `/Downloads/${att.filename}`,
        },
        { optional: attachments.length > 1 },
      ),
    );

    const riskConfig = getRiskPolicyConfig(MailAttachmentRule.RULE_ID);
    const proposal = createActionProposal(
      `${MailAttachmentRule.RULE_ID}:${event.mail_id}`,
      `Save ${attachments.length} attachment(s)`,
      `Save attachments from "${this.truncate(event.subject, 30)}" to Downloads`,
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
      MailAttachmentRule.RULE_ID,
      MailAttachmentRule.RULE_VERSION,
      { ...event, object_id: event.mail_id },
      proposal,
      dedupKey,
      {
        class: 'cleanup',
        title: 'E-Mail-Anhänge speichern',
        rationale: generateWhyText('mail.received', { has_attachments: true, attachments }),
        pushContext: { attachment_count: attachments.length, subject: event.subject },
      },
    );
  }

  private truncate(text: string, max: number): string {
    return text.length > max ? `${text.slice(0, max - 3)  }...` : text;
  }
}

export default MailAttachmentRule;
