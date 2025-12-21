/*
 * LICENSE PLACEHOLDER
 */

import { Module } from '@nestjs/common';
import ConferenceSetupRule from './conference-setup.rule';
import SurveyAnnounceRule from './survey-announce.rule';
import ProjectSetupRule from './project-setup.rule';
import ClassSetupRule from './class-setup.rule';
import SessionExamRule from './session-exam.rule';
import MailAttachmentRule from './mail-attachment.rule';
import BulletinNotifyRule from './bulletin-notify.rule';
import CrossAppEvaluatorService from './cross-app-evaluator.service';

export const CROSS_APP_RULES = [
  ConferenceSetupRule,
  SurveyAnnounceRule,
  ProjectSetupRule,
  ClassSetupRule,
  SessionExamRule,
  MailAttachmentRule,
  BulletinNotifyRule,
] as const;

@Module({
  providers: [...CROSS_APP_RULES, CrossAppEvaluatorService],
  exports: [...CROSS_APP_RULES, CrossAppEvaluatorService],
})
export default class CrossAppModule {}
