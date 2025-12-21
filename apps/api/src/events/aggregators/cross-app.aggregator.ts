/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, OnModuleInit, OnModuleDestroy, Inject, forwardRef } from '@nestjs/common';
import type { ProcessedEvent, RecommendationCandidate } from '@edulution/events';
import BaseAggregator from '../workers/base.aggregator';
import AggregationWorker from '../workers/aggregation.worker';
import RecommendationsService from '../../recommendations/recommendations.service';
import ConferenceSetupRule from '../../recommendations/rules/cross-app/conference-setup.rule';
import SurveyAnnounceRule from '../../recommendations/rules/cross-app/survey-announce.rule';
import ProjectSetupRule from '../../recommendations/rules/cross-app/project-setup.rule';
import ClassSetupRule from '../../recommendations/rules/cross-app/class-setup.rule';
import SessionExamRule from '../../recommendations/rules/cross-app/session-exam.rule';
import MailAttachmentRule from '../../recommendations/rules/cross-app/mail-attachment.rule';
import BulletinNotifyRule from '../../recommendations/rules/cross-app/bulletin-notify.rule';

const CROSS_APP_RECOMMENDATION_SCORE = 0.75;

const HANDLED_EVENT_TYPES = new Set([
  'conference.created',
  'survey.created',
  'project.created',
  'class.created',
  'session.started',
  'mail.received',
  'bulletin.created',
]);

@Injectable()
class CrossAppAggregator extends BaseAggregator implements OnModuleInit, OnModuleDestroy {
  readonly name = 'CrossAppAggregator';

  constructor(
    private readonly worker: AggregationWorker,
    @Inject(forwardRef(() => RecommendationsService))
    private readonly recommendationsService: RecommendationsService,
    @Inject(forwardRef(() => ConferenceSetupRule))
    private readonly conferenceSetupRule: ConferenceSetupRule,
    @Inject(forwardRef(() => SurveyAnnounceRule))
    private readonly surveyAnnounceRule: SurveyAnnounceRule,
    @Inject(forwardRef(() => ProjectSetupRule))
    private readonly projectSetupRule: ProjectSetupRule,
    @Inject(forwardRef(() => ClassSetupRule))
    private readonly classSetupRule: ClassSetupRule,
    @Inject(forwardRef(() => SessionExamRule))
    private readonly sessionExamRule: SessionExamRule,
    @Inject(forwardRef(() => MailAttachmentRule))
    private readonly mailAttachmentRule: MailAttachmentRule,
    @Inject(forwardRef(() => BulletinNotifyRule))
    private readonly bulletinNotifyRule: BulletinNotifyRule,
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
    return HANDLED_EVENT_TYPES.has(event.event.type);
  }

  async handle(event: ProcessedEvent): Promise<void> {
    const { type } = event.event;
    let candidate: RecommendationCandidate | null = null;

    switch (type) {
      case 'conference.created':
        candidate = await this.handleConferenceCreated(event);
        break;
      case 'survey.created':
        candidate = await this.handleSurveyCreated(event);
        break;
      case 'project.created':
        candidate = await this.handleProjectCreated(event);
        break;
      case 'class.created':
        candidate = await this.handleClassCreated(event);
        break;
      case 'session.started':
        candidate = await this.handleSessionStarted(event);
        break;
      case 'mail.received':
        candidate = await this.handleMailReceived(event);
        break;
      case 'bulletin.created':
        candidate = await this.handleBulletinCreated(event);
        break;
      default:
        break;
    }

    if (candidate) {
      await this.recommendationsService.putCandidate(candidate, CROSS_APP_RECOMMENDATION_SCORE);
      this.logger.log(`Generated cross-app recommendation: ${candidate.title}`);
    }
  }

  private async handleConferenceCreated(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, occurred_at } = event.event;

    return this.conferenceSetupRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      conference_id: object.object_id,
      subject_name: (metadata?.subject_name as string) || '',
      scheduled_at: metadata?.scheduled_at as string | undefined,
      occurred_at,
      participants: metadata?.participants as string[] | undefined,
    });
  }

  private async handleSurveyCreated(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, occurred_at } = event.event;

    return this.surveyAnnounceRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      survey_id: object.object_id,
      title: (metadata?.title as string) || '',
      occurred_at,
      target_groups: metadata?.target_groups as string[] | undefined,
    });
  }

  private async handleProjectCreated(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, occurred_at } = event.event;

    return this.projectSetupRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      project_id: object.object_id,
      project_name: (metadata?.project_name as string) || '',
      occurred_at,
      members: metadata?.members as string[] | undefined,
    });
  }

  private async handleClassCreated(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, occurred_at } = event.event;

    return this.classSetupRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      class_id: object.object_id,
      class_name: (metadata?.class_name as string) || '',
      occurred_at,
      students: metadata?.students as string[] | undefined,
      teachers: metadata?.teachers as string[] | undefined,
    });
  }

  private async handleSessionStarted(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, occurred_at } = event.event;

    return this.sessionExamRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      session_id: object.object_id,
      class_name: (metadata?.class_name as string) || '',
      occurred_at,
      is_exam: (metadata?.is_exam as boolean) || false,
      students: metadata?.students as string[] | undefined,
    });
  }

  private async handleMailReceived(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, payload, occurred_at } = event.event;

    return this.mailAttachmentRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      mail_id: object.object_id,
      subject: (metadata?.subject as string) || '',
      occurred_at,
      has_attachments: (metadata?.has_attachments as boolean) || false,
      attachments: (payload?.attachments as Array<{ filename: string; temp_path: string; size: number }>) || [],
    });
  }

  private async handleBulletinCreated(event: ProcessedEvent): Promise<RecommendationCandidate | null> {
    const { event_id, user_id, source, type, object, metadata, payload, occurred_at } = event.event;

    return this.bulletinNotifyRule.evaluate(user_id, {
      event_id,
      action: type,
      source,
      bulletin_id: object.object_id,
      title: (metadata?.title as string) || '',
      occurred_at,
      is_important: (metadata?.is_important as boolean) || false,
      target_groups: (payload?.target_groups as Array<{ group_id: string; name: string; chat_id?: string }>) || [],
    });
  }
}

export default CrossAppAggregator;
