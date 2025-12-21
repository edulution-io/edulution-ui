/*
 * LICENSE PLACEHOLDER
 */

import type { RecommendationClass } from '@edulution/events';

interface RuleDefinition {
  id: string;
  version: string;
  name: string;
  description: string;
  sources: string[];
  class: RecommendationClass;
}

const RULE_REGISTRY: Record<string, RuleDefinition> = {
  'reco.comm.awaiting_reply': {
    id: 'reco.comm.awaiting_reply',
    version: '1.0.0',
    name: 'Awaiting Reply',
    description: 'Threads where user is expected to respond',
    sources: ['mail', 'chat'],
    class: 'communication',
  },
  'reco.comm.high_volume': {
    id: 'reco.comm.high_volume',
    version: '1.0.0',
    name: 'High Volume Inbox',
    description: 'Communication backlog detected',
    sources: ['mail'],
    class: 'communication',
  },

  'reco.meeting.upcoming': {
    id: 'reco.meeting.upcoming',
    version: '1.0.0',
    name: 'Upcoming Meeting',
    description: 'Meeting starting soon needs preparation',
    sources: ['caldav'],
    class: 'meeting',
  },
  'reco.meeting.busy_schedule': {
    id: 'reco.meeting.busy_schedule',
    version: '1.0.0',
    name: 'Busy Schedule',
    description: 'Multiple meetings indicate busy day',
    sources: ['caldav'],
    class: 'meeting',
  },

  'reco.focus.deep_work': {
    id: 'reco.focus.deep_work',
    version: '1.0.0',
    name: 'Deep Work Opportunity',
    description: 'High activity with meeting-free window for focus',
    sources: ['signals', 'caldav'],
    class: 'focus',
  },
  'reco.focus.break_needed': {
    id: 'reco.focus.break_needed',
    version: '1.0.0',
    name: 'Break Suggestion',
    description: 'Sustained high activity suggests break needed',
    sources: ['signals'],
    class: 'focus',
  },
  'reco.focus.low_activity': {
    id: 'reco.focus.low_activity',
    version: '1.0.0',
    name: 'Low Activity Detection',
    description: 'Low activity period for catching up',
    sources: ['signals', 'mail'],
    class: 'focus',
  },

  'reco.planning.workload_review': {
    id: 'reco.planning.workload_review',
    version: '1.0.0',
    name: 'Workload Review',
    description: 'High workload suggests prioritization',
    sources: ['mail', 'caldav', 'signals'],
    class: 'planning',
  },
  'reco.planning.end_of_day': {
    id: 'reco.planning.end_of_day',
    version: '1.0.0',
    name: 'End of Day Review',
    description: 'Time to review and plan for tomorrow',
    sources: ['signals', 'mail'],
    class: 'planning',
  },
  'reco.planning.weekly': {
    id: 'reco.planning.weekly',
    version: '1.0.0',
    name: 'Weekly Planning',
    description: 'Weekly planning or review opportunity',
    sources: ['time'],
    class: 'planning',
  },

  'reco.cleanup.stale_threads': {
    id: 'reco.cleanup.stale_threads',
    version: '1.0.0',
    name: 'Stale Thread Detection',
    description: 'Inactive threads that may need cleanup',
    sources: ['mail'],
    class: 'cleanup',
  },
  'reco.cleanup.inbox_zero': {
    id: 'reco.cleanup.inbox_zero',
    version: '1.0.0',
    name: 'Inbox Zero Opportunity',
    description: 'Close to inbox zero - quick wins available',
    sources: ['mail', 'signals'],
    class: 'cleanup',
  },
  'reco.cleanup.organize_files': {
    id: 'reco.cleanup.organize_files',
    version: '1.0.0',
    name: 'File Organization',
    description: 'High file activity suggests organization',
    sources: ['files', 'signals'],
    class: 'cleanup',
  },

  'reco.correlation.meeting_prep': {
    id: 'reco.correlation.meeting_prep',
    version: '1.0.0',
    name: 'Meeting Preparation',
    description: 'Correlates meeting with related communications',
    sources: ['caldav', 'mail'],
    class: 'meeting',
  },
  'reco.correlation.thread_meeting': {
    id: 'reco.correlation.thread_meeting',
    version: '1.0.0',
    name: 'Thread-Meeting Correlation',
    description: 'Communication thread related to upcoming meeting',
    sources: ['mail', 'caldav'],
    class: 'communication',
  },

  'reco.resources.conference_folder': {
    id: 'reco.resources.conference_folder',
    version: '1.0.0',
    name: 'Conference Folder',
    description: 'Suggests creating a resources folder when a conference is created',
    sources: ['conference'],
    class: 'organization',
  },

  // Cross-App Rules
  'reco.cross.conference_setup': {
    id: 'reco.cross.conference_setup',
    version: '1.0.0',
    name: 'Conference Setup',
    description: 'Creates folder and chat when conference is created',
    sources: ['conference'],
    class: 'organization',
  },
  'reco.cross.survey_announce': {
    id: 'reco.cross.survey_announce',
    version: '1.0.0',
    name: 'Survey Announcement',
    description: 'Creates bulletin when survey is created',
    sources: ['survey'],
    class: 'communication',
  },
  'reco.cross.project_setup': {
    id: 'reco.cross.project_setup',
    version: '1.0.0',
    name: 'Project Setup',
    description: 'Creates folder, chat, and share for new project',
    sources: ['lmn'],
    class: 'organization',
  },
  'reco.cross.class_setup': {
    id: 'reco.cross.class_setup',
    version: '1.0.0',
    name: 'Class Setup',
    description: 'Full class workspace with folders, chat, bulletin',
    sources: ['lmn'],
    class: 'organization',
  },
  'reco.cross.session_exam': {
    id: 'reco.cross.session_exam',
    version: '1.0.0',
    name: 'Exam Preparation',
    description: 'Prepares exam folder and enables exam mode',
    sources: ['lmn'],
    class: 'organization',
  },
  'reco.cross.mail_attachment': {
    id: 'reco.cross.mail_attachment',
    version: '1.0.0',
    name: 'Save Attachments',
    description: 'Saves email attachments to file storage',
    sources: ['mail'],
    class: 'cleanup',
  },
  'reco.cross.bulletin_notify': {
    id: 'reco.cross.bulletin_notify',
    version: '1.0.0',
    name: 'Bulletin Notification',
    description: 'Notifies groups via chat about important bulletins',
    sources: ['bulletin'],
    class: 'communication',
  },
};

function getRule(ruleId: string): RuleDefinition | undefined {
  return RULE_REGISTRY[ruleId];
}

function getRuleIds(): string[] {
  return Object.keys(RULE_REGISTRY);
}

function getRuleVersion(ruleId: string): string {
  const rule = RULE_REGISTRY[ruleId];
  return rule?.version || '1.0.0';
}

export { RULE_REGISTRY, getRule, getRuleIds, getRuleVersion };
export type { RuleDefinition };
