/*
 * LICENSE PLACEHOLDER
 */

import type { Explainability } from './explainability.types';
import type { ActionProposal } from './action-proposal.types';

export const EVENT_SOURCES = {
  FILES: 'files',
  CONFERENCES: 'conferences',
  MAIL: 'mail',
  CALDAV: 'caldav',
  CHAT: 'chat',
  HTTP: 'http',
  SYSTEM: 'system',
  BULLETIN: 'bulletin',
  SURVEYS: 'surveys',
  WHITEBOARD: 'whiteboard',
} as const;

export type EventSource = (typeof EVENT_SOURCES)[keyof typeof EVENT_SOURCES];

export const EVENT_SENSITIVITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type EventSensitivity = (typeof EVENT_SENSITIVITY)[keyof typeof EVENT_SENSITIVITY];

export const FILE_EVENT_TYPES = {
  CREATED: 'file.created',
  UPLOADED: 'file.uploaded',
  MOVED: 'file.moved',
  COPIED: 'file.copied',
  DELETED: 'file.deleted',
  ACCESSED: 'file.accessed',
  MODIFIED: 'file.modified',
  SHARED: 'file.shared',
  FOLDER_CREATED: 'folder.created',
  FOLDER_DELETED: 'folder.deleted',
} as const;

export const CONFERENCE_EVENT_TYPES = {
  CREATED: 'conference.created',
  STARTED: 'conference.started',
  ENDED: 'conference.ended',
  PARTICIPANT_JOINED: 'conference.participant_joined',
  PARTICIPANT_LEFT: 'conference.participant_left',
  RECORDING_STARTED: 'conference.recording_started',
  RECORDING_STOPPED: 'conference.recording_stopped',
} as const;

export const MAIL_EVENT_TYPES = {
  RECEIVED: 'mail.received',
  SENT: 'mail.sent',
  REPLIED: 'mail.replied',
  FORWARDED: 'mail.forwarded',
  THREAD_CREATED: 'mail.thread_created',
  THREAD_CLOSED: 'mail.thread_closed',
} as const;

export const CALDAV_EVENT_TYPES = {
  EVENT_CREATED: 'calendar.event_created',
  EVENT_UPDATED: 'calendar.event_updated',
  EVENT_DELETED: 'calendar.event_deleted',
  EVENT_STARTED: 'calendar.event_started',
  EVENT_ENDED: 'calendar.event_ended',
  REMINDER_TRIGGERED: 'calendar.reminder_triggered',
} as const;

export const CHAT_EVENT_TYPES = {
  MESSAGE_SENT: 'chat.message_sent',
  MESSAGE_RECEIVED: 'chat.message_received',
  MESSAGE_EDITED: 'chat.message_edited',
  MESSAGE_DELETED: 'chat.message_deleted',
  CHANNEL_CREATED: 'chat.channel_created',
  CHANNEL_JOINED: 'chat.channel_joined',
  CHANNEL_LEFT: 'chat.channel_left',
} as const;

export const HTTP_EVENT_TYPES = {
  REQUEST_STARTED: 'request.started',
  REQUEST_COMPLETED: 'request.completed',
  REQUEST_FAILED: 'request.failed',
} as const;

export const SYSTEM_EVENT_TYPES = {
  HEALTH_CHECK: 'system.health_check',
  CONFIG_CHANGED: 'system.config_changed',
  ERROR: 'system.error',
  STARTUP: 'system.startup',
  SHUTDOWN: 'system.shutdown',
} as const;

export const BULLETIN_EVENT_TYPES = {
  CREATED: 'bulletin.created',
  UPDATED: 'bulletin.updated',
  DELETED: 'bulletin.deleted',
} as const;

export const SURVEY_EVENT_TYPES = {
  CREATED: 'survey.created',
  UPDATED: 'survey.updated',
  DELETED: 'survey.deleted',
  ANSWER_SUBMITTED: 'survey.answer_submitted',
} as const;

export const WHITEBOARD_EVENT_TYPES = {
  SESSION_STARTED: 'whiteboard.session_started',
  SESSION_ENDED: 'whiteboard.session_ended',
} as const;

export const EVENT_TYPES = {
  ...FILE_EVENT_TYPES,
  ...CONFERENCE_EVENT_TYPES,
  ...MAIL_EVENT_TYPES,
  ...CALDAV_EVENT_TYPES,
  ...CHAT_EVENT_TYPES,
  ...HTTP_EVENT_TYPES,
  ...SYSTEM_EVENT_TYPES,
  ...BULLETIN_EVENT_TYPES,
  ...SURVEY_EVENT_TYPES,
  ...WHITEBOARD_EVENT_TYPES,
} as const;

export type FileEventType = (typeof FILE_EVENT_TYPES)[keyof typeof FILE_EVENT_TYPES];
export type ConferenceEventType = (typeof CONFERENCE_EVENT_TYPES)[keyof typeof CONFERENCE_EVENT_TYPES];
export type MailEventType = (typeof MAIL_EVENT_TYPES)[keyof typeof MAIL_EVENT_TYPES];
export type CaldavEventType = (typeof CALDAV_EVENT_TYPES)[keyof typeof CALDAV_EVENT_TYPES];
export type ChatEventType = (typeof CHAT_EVENT_TYPES)[keyof typeof CHAT_EVENT_TYPES];
export type HttpEventType = (typeof HTTP_EVENT_TYPES)[keyof typeof HTTP_EVENT_TYPES];
export type SystemEventType = (typeof SYSTEM_EVENT_TYPES)[keyof typeof SYSTEM_EVENT_TYPES];
export type BulletinEventType = (typeof BULLETIN_EVENT_TYPES)[keyof typeof BULLETIN_EVENT_TYPES];
export type SurveyEventType = (typeof SURVEY_EVENT_TYPES)[keyof typeof SURVEY_EVENT_TYPES];
export type WhiteboardEventType = (typeof WHITEBOARD_EVENT_TYPES)[keyof typeof WHITEBOARD_EVENT_TYPES];

export type EventType =
  | FileEventType
  | ConferenceEventType
  | MailEventType
  | CaldavEventType
  | ChatEventType
  | HttpEventType
  | SystemEventType
  | BulletinEventType
  | SurveyEventType
  | WhiteboardEventType;

export interface EventObject {
  object_type: string;
  object_id: string;
  object_ref?: string | null;
}

export interface EventContext {
  context_id?: string | null;
  project_id?: string | null;
  thread_id?: string | null;
  meeting_id?: string | null;
  session_id?: string | null;
  request_id?: string | null;
}

export type EventMetadata = Record<string, string | number | boolean | null>;

export type EventPayload = Record<string, unknown>;

export interface Event {
  event_id: string;
  schema_version: string;
  occurred_at: string;
  received_at: string;
  tenant_id?: string | null;
  user_id: string;
  source: EventSource;
  type: string;
  actor_id?: string | null;
  object: EventObject;
  context?: EventContext;
  correlation_id: string;
  causation_id?: string | null;
  sensitivity: EventSensitivity;
  metadata?: EventMetadata;
  payload?: EventPayload;
}

export interface EventInput {
  occurred_at?: string;
  tenant_id?: string | null;
  user_id: string;
  source: EventSource;
  type: string;
  actor_id?: string | null;
  object: EventObject;
  context?: EventContext;
  correlation_id?: string;
  causation_id?: string | null;
  sensitivity?: EventSensitivity;
  metadata?: EventMetadata;
  payload?: EventPayload;
}

export interface DLQEntry extends Event {
  original_stream_id: string;
  failure_reason: string;
  retry_count: number;
  failed_at: string;
}

export interface UserLastSeen {
  files?: string;
  conferences?: string;
  mail?: string;
  caldav?: string;
  chat?: string;
  http?: string;
}

export interface UserCounts {
  [eventType: string]: number;
}

export interface UserSignals {
  activity_level: 'none' | 'low' | 'medium' | 'high';
  primary_source: EventSource | null;
  pending_communications: number;
  upcoming_meetings: number;
  last_computed: string;
}

export interface ContextState {
  context_type: string;
  created_at: string;
  last_activity: string;
  event_count: number;
  participant_count: number;
  status: 'active' | 'inactive' | 'closed';
}

export interface CorrelationSignal {
  correlation_id: string;
  created_at: string;
  sources: EventSource[];
  event_count: number;
  user_ids: string[];
  context_ids: string[];
  signal_type: string;
  confidence: number;
}

export interface PipelineHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  streams: {
    [source: string]: {
      length: number;
      pending: number;
      consumers: number;
      last_entry_id: string | null;
    };
  };
  dlq: {
    [source: string]: {
      length: number;
    };
  };
  last_checked: string;
}

export interface DLQStats {
  total_entries: number;
  by_source: {
    [source: string]: number;
  };
  by_failure_reason: {
    [reason: string]: number;
  };
  oldest_entry: string | null;
  newest_entry: string | null;
}

export interface SourceActivity {
  source: EventSource;
  event_count: number;
  last_activity: string | null;
}

export interface CommunicationsSummary {
  threads_active: number;
  threads_awaiting_reply: number;
  messages_sent: number;
  messages_received: number;
}

export interface MeetingsSummary {
  total_scheduled: number;
  upcoming_24h: number;
  meetings: Array<{
    meeting_id: string;
    scheduled_at: string;
  }>;
}

export interface DailySummary {
  user_id: string;
  date: string;
  activity_level: UserSignals['activity_level'];
  total_events: number;
  by_source: SourceActivity[];
  communications: CommunicationsSummary;
  meetings: MeetingsSummary;
  top_event_types: Array<{
    type: string;
    count: number;
  }>;
  generated_at: string;
}

export const RECOMMENDATION_CLASSES = {
  COMMUNICATION: 'communication',
  PLANNING: 'planning',
  CLEANUP: 'cleanup',
  FOCUS: 'focus',
  MEETING: 'meeting',
  ORGANIZATION: 'organization',
} as const;

export type RecommendationClass = (typeof RECOMMENDATION_CLASSES)[keyof typeof RECOMMENDATION_CLASSES];

export interface EvidenceItem {
  kind: string;
  ref: string;
  ts?: string;
  meta?: Record<string, unknown>;
}

export interface RecommendationScores {
  confidence: number;
  impact: number;
  effort: number;
}

export interface RecommendationCandidate {
  candidate_id: string;
  dedup_key: string;
  user_id: string;
  created_at: string;
  expires_at?: string;
  context_id?: string;
  class: RecommendationClass;
  title: string;
  rationale: string;
  scores: RecommendationScores;
  tags?: string[];
  sources_involved: string[];
  explainability?: Explainability;
  /** @deprecated Use explainability.evidence instead */
  evidence: EvidenceItem[];
  action_proposal?: ActionProposal;
  push_title: string;
  push_content: string;
}

export interface RecommendationOutboxItem {
  candidate_id: string;
  dedup_key: string;
  score: number;
  created_at: string;
  class: RecommendationClass;
  title: string;
  rationale: string;
  context_id?: string;
  sources_involved: string[];
  explainability?: Explainability;
  /** @deprecated Use explainability.evidence instead */
  evidence?: EvidenceItem[];
  action_proposal?: ActionProposal;
  push_title: string;
  push_content: string;
}

export interface ConferencePayload {
  conference_id: string;
  subject_name?: string;
  scheduled_at?: string;
  course_id?: string;
  class_id?: string;
  school_year?: string;
}

/** @deprecated Use RecommendationCandidate with action_proposal instead */
export interface RecommendationCandidateWithAction extends RecommendationCandidate {}