/*
 * LICENSE PLACEHOLDER
 */

export type {
  Rule,
  RuleContext,
  RuleResult,
  RuleConfig,
  OpenThread,
  UpcomingMeeting,
  CommunicationsState,
} from './rule.interface';
export { DEFAULT_RULE_CONFIG } from './rule.interface';
export { default as BaseRule } from './base.rule';
export { default as RuleEngineService } from './rule-engine.service';
export type { GenerateResult, RuleInfo } from './rule-engine.service';

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
} from './scoring-rules';
