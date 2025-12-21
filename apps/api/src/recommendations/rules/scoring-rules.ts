/*
 * LICENSE PLACEHOLDER
 */

import type { Rule } from './rule.interface';
import { AwaitingReplyRule, HighVolumeInboxRule } from './communication';
import { MeetingPrepRule, BusyDayRule } from './calendar';
import { FocusTimeRule, BreakSuggestionRule, LowActivityRule } from './focus';
import { WorkloadReviewRule, EndOfDayReviewRule, WeeklyPlanningRule } from './planning';
import { StaleThreadsRule, InboxZeroRule, OrganizeFilesRule } from './cleanup';

const ALL_RULES: Rule[] = [
  new AwaitingReplyRule(),
  new HighVolumeInboxRule(),

  new MeetingPrepRule(),
  new BusyDayRule(),

  new FocusTimeRule(),
  new BreakSuggestionRule(),
  new LowActivityRule(),

  new WorkloadReviewRule(),
  new EndOfDayReviewRule(),
  new WeeklyPlanningRule(),

  new StaleThreadsRule(),
  new InboxZeroRule(),
  new OrganizeFilesRule(),
];

const getAllRules = (): Rule[] => ALL_RULES.map((rule) => rule);

const getRulesByClass = (ruleClass: string): Rule[] =>
  ALL_RULES.filter((rule) => rule.class === ruleClass);

const getRuleById = (ruleId: string): Rule | undefined =>
  ALL_RULES.find((rule) => rule.id === ruleId);

export {
  ALL_RULES,
  getAllRules,
  getRulesByClass,
  getRuleById,
  AwaitingReplyRule,
  HighVolumeInboxRule,
  MeetingPrepRule,
  BusyDayRule,
  FocusTimeRule,
  BreakSuggestionRule,
  LowActivityRule,
  WorkloadReviewRule,
  EndOfDayReviewRule,
  WeeklyPlanningRule,
  StaleThreadsRule,
  InboxZeroRule,
  OrganizeFilesRule,
};
