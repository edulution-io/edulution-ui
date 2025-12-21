/*
 * LICENSE PLACEHOLDER
 */

import { Injectable, Logger } from '@nestjs/common';
import type { RecommendationCandidate } from '@edulution/events';
import ConferenceSetupRule from './conference-setup.rule';
import SurveyAnnounceRule from './survey-announce.rule';
import ProjectSetupRule from './project-setup.rule';
import ClassSetupRule from './class-setup.rule';
import SessionExamRule from './session-exam.rule';
import MailAttachmentRule from './mail-attachment.rule';
import BulletinNotifyRule from './bulletin-notify.rule';

export interface CrossAppEvent {
  event_id: string;
  user_id: string;
  type: string;
  source: string;
  occurred_at: string;
  object: {
    object_type: string;
    object_id: string;
    object_ref?: string;
  };
  metadata?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

@Injectable()
class CrossAppEvaluatorService {
  private readonly logger = new Logger(CrossAppEvaluatorService.name);

  constructor(
    private readonly conferenceSetupRule: ConferenceSetupRule,
    private readonly surveyAnnounceRule: SurveyAnnounceRule,
    private readonly projectSetupRule: ProjectSetupRule,
    private readonly classSetupRule: ClassSetupRule,
    private readonly sessionExamRule: SessionExamRule,
    private readonly mailAttachmentRule: MailAttachmentRule,
    private readonly bulletinNotifyRule: BulletinNotifyRule,
  ) {}

  async evaluateEvent(event: CrossAppEvent): Promise<RecommendationCandidate | null> {
    const { user_id: userId, type } = event;

    try {
      switch (type) {
        case 'conference.created':
          return this.conferenceSetupRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            conference_id: event.object.object_id,
            subject_name: (event.metadata?.subject_name as string) || 'Unknown',
            scheduled_at: event.metadata?.scheduled_at as string,
            occurred_at: event.occurred_at,
            participants: (event.payload?.participants as string[]) || [],
          });

        case 'survey.created':
          return this.surveyAnnounceRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            survey_id: event.object.object_id,
            title: (event.metadata?.title as string) || 'Survey',
            occurred_at: event.occurred_at,
            target_groups: (event.payload?.target_groups as string[]) || [],
          });

        case 'project.created':
          return this.projectSetupRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            project_id: event.object.object_id,
            project_name: (event.metadata?.project_name as string) || 'Project',
            occurred_at: event.occurred_at,
            members: (event.payload?.members as string[]) || [],
          });

        case 'class.created':
          return this.classSetupRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            class_id: event.object.object_id,
            class_name: (event.metadata?.class_name as string) || 'Class',
            occurred_at: event.occurred_at,
            students: (event.payload?.students as string[]) || [],
            teachers: (event.payload?.teachers as string[]) || [userId],
          });

        case 'session.started':
          if (event.metadata?.is_exam !== true) {
            return null;
          }
          return this.sessionExamRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            session_id: event.object.object_id,
            class_name: (event.metadata?.class_name as string) || 'Class',
            scheduled_at: event.metadata?.scheduled_at as string,
            occurred_at: event.occurred_at,
            students: (event.payload?.students as string[]) || [],
            is_exam: true,
          });

        case 'mail.received':
          if (event.metadata?.has_attachments !== true) {
            return null;
          }
          return this.mailAttachmentRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            mail_id: event.object.object_id,
            subject: (event.metadata?.subject as string) || 'Mail',
            occurred_at: event.occurred_at,
            has_attachments: true,
            attachments:
              (event.payload?.attachments as Array<{
                filename: string;
                temp_path: string;
                size: number;
              }>) || [],
          });

        case 'bulletin.created':
          if (event.metadata?.is_important !== true) {
            return null;
          }
          return this.bulletinNotifyRule.evaluate(userId, {
            event_id: event.event_id,
            action: type,
            source: event.source,
            bulletin_id: event.object.object_id,
            title: (event.metadata?.title as string) || 'Bulletin',
            occurred_at: event.occurred_at,
            is_important: true,
            target_groups:
              (event.payload?.target_groups as Array<{
                group_id: string;
                name: string;
                chat_id: string;
              }>) || [],
          });

        default:
          return null;
      }
    } catch (error) {
      this.logger.error(`Error evaluating cross-app rule for event ${event.event_id}: ${error}`);
      return null;
    }
  }

  async evaluateEvents(events: CrossAppEvent[]): Promise<RecommendationCandidate[]> {
    const candidates: RecommendationCandidate[] = [];

    for (const event of events) {
      const candidate = await this.evaluateEvent(event);
      if (candidate) {
        candidates.push(candidate);
      }
    }

    this.logger.log(`Evaluated ${events.length} events, generated ${candidates.length} candidates`);
    return candidates;
  }
}

export default CrossAppEvaluatorService;
