/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import {
  EVENT_SOURCES,
  CONFERENCE_EVENT_TYPES,
  RECOMMENDATION_CLASSES,
  createEventEvidence,
  createHeuristicEvidence,
  createActionStep,
  createActionProposal,
} from '@edulution/events';
import type { ProcessedEvent, Explainability, RecommendationCandidate, ActionProposal } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';
import RecommendationsService from '../../recommendations/recommendations.service';
import { generateDedupKey , computeSourcesInvolved } from '../../recommendations/utils';
import { getReversibleStatus } from '../../recommendations/config';

const CONFERENCE_STATE_TTL_SECONDS = 90 * 24 * 60 * 60;
const FOLDER_SUGGESTED_TTL_SECONDS = 30 * 24 * 60 * 60;
const RECENT_CONFERENCES_MAX = 50;

interface ConferenceState {
  conference_id: string;
  user_id: string;
  subject_name: string;
  scheduled_at?: string;
  created_at: string;
  event_id: string;
}

const RULE_ID = 'reco.resources.conference_folder';
const RULE_VERSION = '1.0.0';
const FOLDER_RECOMMENDATION_SCORE = 0.7;

@Injectable()
class ConferencesAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'ConferencesAggregator';

  constructor(
    private readonly worker: AggregationWorker,
    @Inject(forwardRef(() => RecommendationsService))
    private readonly recommendationsService: RecommendationsService,
  ) {
    super();
  }

  async onModuleInit(): Promise<void> {
    await this.initialize();
    this.worker.registerHandler(this);
  }

  async onModuleDestroy(): Promise<void> {
    await this.shutdown();
  }

  canHandle(event: ProcessedEvent): boolean {
    const { source, type } = event.event;
    return (
      source === EVENT_SOURCES.CONFERENCES && type === CONFERENCE_EVENT_TYPES.CREATED
    );
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const { event_id, user_id, object, metadata, occurred_at } = event.event;
    const conferenceId = object.object_id;
    const subjectName = (metadata?.subject_name as string) || '';

    if (!subjectName) {
      this.logger.debug(`Conference ${conferenceId} has no subject_name, skipping`);
      return;
    }

    await this.storeConference(user_id, {
      conference_id: conferenceId,
      subject_name: subjectName,
      scheduled_at: metadata?.scheduled_at as string | undefined,
      created_at: occurred_at,
      event_id,
    });

    await this.generateFolderRecommendation(user_id, {
      event_id,
      conference_id: conferenceId,
      subject_name: subjectName,
      scheduled_at: metadata?.scheduled_at as string | undefined,
      occurred_at,
    });
  }

  private async generateFolderRecommendation(
    userId: string,
    conf: {
      event_id: string;
      conference_id: string;
      subject_name: string;
      scheduled_at?: string;
      occurred_at: string;
    },
  ): Promise<void> {
    const dateStr = conf.scheduled_at || conf.occurred_at;
    const year = this.extractYear(dateStr);
    const normalizedSubject = this.normalizeSubject(conf.subject_name);

    const alreadySuggested = await this.isFolderSuggested(userId, normalizedSubject, year);
    if (alreadySuggested) {
      this.logger.debug(
        `Folder already suggested for ${normalizedSubject}_${year}, skipping`,
      );
      return;
    }

    await this.markFolderSuggested(userId, normalizedSubject, year);

    const folderName = this.deriveFolderName(conf.subject_name, dateStr);

    const explainability: Explainability = {
      rule_id: RULE_ID,
      rule_version: RULE_VERSION,
      summary:
        'A new conference was created. Organizing resources in a dedicated folder reduces friction.',
      evidence: [
        createEventEvidence(
          'Conference created',
          conf.event_id,
          'conferences',
          conf.occurred_at,
          { subject_name: conf.subject_name },
        ),
        createHeuristicEvidence(
          'Folder name derived deterministically',
          [{ ref_type: 'rule_id', ref: RULE_ID }],
          { folder_name: folderName },
        ),
      ],
    };

    const steps = [
      createActionStep(
        'create-folder',
        'files.create_folder',
        `Create folder ${folderName} in /Ressourcen`,
        { folder_name: folderName, path: '/Ressourcen' },
      ),
    ];

    const actionProposal: ActionProposal = createActionProposal(
      `${RULE_ID}:${conf.conference_id}`,
      `Create folder for ${conf.subject_name}`,
      'Create a dedicated resources folder for the conference materials',
      steps,
      {
        trigger_event_id: conf.event_id,
        trigger_action: 'conference.created',
        source: 'conferences',
      },
      { impact: 'low', reversible: getReversibleStatus(steps) },
    );

    const dedupKey = generateDedupKey(RULE_ID, conf.conference_id, userId);

    const candidate: RecommendationCandidate = {
      candidate_id: `${RULE_ID}:${conf.conference_id}`,
      dedup_key: dedupKey,
      user_id: userId,
      created_at: new Date().toISOString(),
      class: RECOMMENDATION_CLASSES.ORGANIZATION,
      title: `Create resources folder for ${conf.subject_name}`,
      rationale: `A conference for ${conf.subject_name} was created. A dedicated folder helps organize materials.`,
      scores: {
        confidence: 0.7,
        impact: 0.6,
        effort: 0.3,
      },
      sources_involved: computeSourcesInvolved(explainability),
      context_id: conf.conference_id,
      explainability,
      evidence: [
        {
          kind: 'event',
          ref: conf.event_id,
          meta: { subject_name: conf.subject_name },
        },
      ],
      action_proposal: actionProposal,
      push_title: `Ordner für ${conf.subject_name} erstellen`,
      push_content: `Ressourcen-Ordner für Konferenz "${conf.subject_name}" anlegen?`,
    };

    await this.recommendationsService.putCandidate(candidate, FOLDER_RECOMMENDATION_SCORE);
    this.logger.log(
      `Generated folder recommendation for ${conf.subject_name} (${folderName})`,
    );
  }

  private deriveFolderName(subject: string, dateStr: string): string {
    const normalized = this.normalizeSubjectForFolder(subject);
    const year = this.extractYear(dateStr);
    return `${normalized}_${year}`;
  }

  private normalizeSubjectForFolder(subject: string): string {
    return subject
      .trim()
      .replace(/[^a-zA-Z0-9\s_äöüÄÖÜß]/g, '')
      .replace(/\s+/g, '_')
      .replace(/_+/g, '_');
  }

  private extractYear(dateStr: string): string {
    try {
      return new Date(dateStr).getFullYear().toString();
    } catch {
      return new Date().getFullYear().toString();
    }
  }

  async storeConference(
    userId: string,
    conf: Omit<ConferenceState, 'user_id'>,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const stateKey = `state:conference:${conf.conference_id}`;

    await redis.hset(stateKey, {
      user_id: userId,
      subject_name: conf.subject_name,
      scheduled_at: conf.scheduled_at || '',
      created_at: conf.created_at,
      event_id: conf.event_id,
    });
    await redis.expire(stateKey, CONFERENCE_STATE_TTL_SECONDS);

    const recentKey = `state:conferences:${userId}:recent`;
    const score = new Date(conf.scheduled_at || conf.created_at).getTime();
    await redis.zadd(recentKey, score, conf.conference_id);
    await redis.zremrangebyrank(recentKey, 0, -(RECENT_CONFERENCES_MAX + 1));
    await redis.expire(recentKey, CONFERENCE_STATE_TTL_SECONDS);

    this.logger.debug(
      `Stored conference ${conf.conference_id} (${conf.subject_name}) for user ${userId}`,
    );
  }

  async getConference(conferenceId: string): Promise<ConferenceState | null> {
    const redis = this.ensureRedis();
    const stateKey = `state:conference:${conferenceId}`;
    const data = await redis.hgetall(stateKey);

    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      conference_id: conferenceId,
      user_id: data.user_id,
      subject_name: data.subject_name,
      scheduled_at: data.scheduled_at || undefined,
      created_at: data.created_at,
      event_id: data.event_id,
    };
  }

  async getRecentConferences(userId: string, limit = 10): Promise<string[]> {
    const redis = this.ensureRedis();
    const recentKey = `state:conferences:${userId}:recent`;
    return redis.zrevrange(recentKey, 0, limit - 1);
  }

  async isFolderSuggested(
    userId: string,
    subject: string,
    year: string,
  ): Promise<boolean> {
    const redis = this.ensureRedis();
    const normalizedSubject = this.normalizeSubject(subject);
    const key = `state:resources-folder:suggested:${userId}:${normalizedSubject}:${year}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  async markFolderSuggested(
    userId: string,
    subject: string,
    year: string,
  ): Promise<void> {
    const redis = this.ensureRedis();
    const normalizedSubject = this.normalizeSubject(subject);
    const key = `state:resources-folder:suggested:${userId}:${normalizedSubject}:${year}`;
    await redis.setex(key, FOLDER_SUGGESTED_TTL_SECONDS, '1');
    this.logger.debug(`Marked folder suggested: ${normalizedSubject}_${year} for user ${userId}`);
  }

  private normalizeSubject(subject: string): string {
    return subject
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '_')
      .replace(/[^a-z0-9_äöüß]/g, '');
  }
}

export default ConferencesAggregator;
export type { ConferenceState };
