/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
  CALDAV_EVENT_TYPES,
  CONFERENCE_EVENT_TYPES,
  EVENT_SENSITIVITY,
  RECOMMENDATION_CLASSES,
  BULLETIN_EVENT_TYPES,
  SURVEY_EVENT_TYPES,
  WHITEBOARD_EVENT_TYPES,
} from "@edulution/events";
import type { Event, RecommendationClass } from "@edulution/events";

/**
 * Rule trigger thresholds (must match actual rule implementations)
 */
const RULE_THRESHOLDS = {
  MEETING_PREP_WINDOW_MINUTES: 120,
  BUSY_DAY_MEETING_COUNT: 3,
  HIGH_VOLUME_AWAITING_COUNT: 5,
  WORKLOAD_OPEN_THREADS: 10,
  WORKLOAD_MEETING_COUNT: 3,
  STALE_THREAD_DAYS: 7,
  INBOX_ZERO_MAX_AWAITING: 3,
  INBOX_ZERO_MAX_OPEN: 5,
  FILE_ORGANIZE_COUNT: 20,
  BREAK_NEEDED_EVENTS_1H: 50,
  FOCUS_WINDOW_MINUTES: 120,
};

/**
 * Simulated state at a given checkpoint
 */
interface SimulatedState {
  upcomingMeetings: Array<{ id: string; scheduledAt: number }>;
  openThreads: Array<{ threadId: string; lastActivity: number }>;
  awaitingReply: string[];
  counts24h: Record<string, number>;
  counts1h: Record<string, number>;
  activityLevel: 'none' | 'low' | 'medium' | 'high';
}

/**
 * Derive state from events up to a checkpoint time
 */
function deriveStateAtCheckpoint(events: Event[], checkpointTime: number): SimulatedState {
  // Filter events that occurred before checkpoint
  const relevantEvents = events.filter((e) => new Date(e.occurred_at).getTime() <= checkpointTime);

  const meetings: Array<{ id: string; scheduledAt: number }> = [];
  const threads = new Map<string, { lastActivity: number; hasReply: boolean }>();
  const counts24h: Record<string, number> = {};
  const counts1h: Record<string, number> = {};

  const oneHourAgo = checkpointTime - 60 * 60 * 1000;
  const oneDayAgo = checkpointTime - 24 * 60 * 60 * 1000;

  for (const event of relevantEvents) {
    const eventTime = new Date(event.occurred_at).getTime();

    // Calendar events - check if meeting is in the future relative to checkpoint
    if (event.source === 'caldav' && event.type === 'calendar.event_created') {
      const scheduledAt = (event.metadata?.scheduled_at || event.metadata?.start_time) as string | undefined;
      if (scheduledAt) {
        const meetingTime = new Date(scheduledAt).getTime();
        // Only include meetings that are in the future relative to checkpoint
        if (meetingTime > checkpointTime) {
          meetings.push({ id: event.object.object_id, scheduledAt: meetingTime });
        }
      }
    }

    // Mail threads
    if (event.source === 'mail') {
      const threadId = event.context?.thread_id as string | undefined;
      if (threadId) {
        const existing = threads.get(threadId) || { lastActivity: 0, hasReply: false };
        existing.lastActivity = Math.max(existing.lastActivity, eventTime);

        if (event.type === 'mail.sent' || event.type === 'mail.replied') {
          existing.hasReply = true;
        }
        threads.set(threadId, existing);
      }
    }

    // Count events for 24h window
    if (eventTime > oneDayAgo) {
      counts24h[event.type] = (counts24h[event.type] || 0) + 1;
    }

    // Count events for 1h window
    if (eventTime > oneHourAgo) {
      counts1h[event.type] = (counts1h[event.type] || 0) + 1;
    }
  }

  // Convert threads to arrays
  const openThreads = Array.from(threads.entries()).map(([threadId, data]) => ({
    threadId,
    lastActivity: data.lastActivity,
  }));

  const awaitingReply = Array.from(threads.entries())
    .filter(([, data]) => !data.hasReply)
    .map(([threadId]) => threadId);

  // Calculate activity level based on 1h event count
  const totalEvents1h = Object.values(counts1h).reduce((sum, count) => sum + count, 0);
  let activityLevel: 'none' | 'low' | 'medium' | 'high';
  if (totalEvents1h === 0) {
    activityLevel = 'none';
  } else if (totalEvents1h < 5) {
    activityLevel = 'low';
  } else if (totalEvents1h < 20) {
    activityLevel = 'medium';
  } else {
    activityLevel = 'high';
  }

  return {
    upcomingMeetings: meetings.sort((a, b) => a.scheduledAt - b.scheduledAt),
    openThreads,
    awaitingReply,
    counts24h,
    counts1h,
    activityLevel,
  };
}

/**
 * Determine which rules would trigger given the simulated state
 */
function getRulesForState(
  state: SimulatedState,
  checkpointTime: number,
): Array<{ ruleId: string; class: RecommendationClass; rationale: string }> {
  const triggeredRules: Array<{ ruleId: string; class: RecommendationClass; rationale: string }> = [];

  // 1. MeetingPrepRule: Meeting within 0-120 minutes
  const meetingsInPrepWindow = state.upcomingMeetings.filter((m) => {
    const minutesUntil = (m.scheduledAt - checkpointTime) / (60 * 1000);
    return minutesUntil > 0 && minutesUntil <= RULE_THRESHOLDS.MEETING_PREP_WINDOW_MINUTES;
  });
  if (meetingsInPrepWindow.length > 0) {
    const minutesUntil = Math.floor((meetingsInPrepWindow[0].scheduledAt - checkpointTime) / (60 * 1000));
    triggeredRules.push({
      ruleId: 'calendar:meeting-prep',
      class: RECOMMENDATION_CLASSES.MEETING,
      rationale: `Meeting in ${minutesUntil} minutes triggers prep recommendation`,
    });
  }

  // 2. BusyDayRule: 3+ meetings
  if (state.upcomingMeetings.length >= RULE_THRESHOLDS.BUSY_DAY_MEETING_COUNT) {
    triggeredRules.push({
      ruleId: 'calendar:busy-day',
      class: RECOMMENDATION_CLASSES.MEETING,
      rationale: `${state.upcomingMeetings.length} meetings triggers busy day detection`,
    });
  }

  // 3. AwaitingReplyRule: Any threads awaiting reply
  if (state.awaitingReply.length > 0) {
    triggeredRules.push({
      ruleId: 'communication:awaiting-reply',
      class: RECOMMENDATION_CLASSES.COMMUNICATION,
      rationale: `${state.awaitingReply.length} thread(s) awaiting reply`,
    });
  }

  // 4. HighVolumeInboxRule: 5+ threads awaiting reply
  if (state.awaitingReply.length >= RULE_THRESHOLDS.HIGH_VOLUME_AWAITING_COUNT) {
    triggeredRules.push({
      ruleId: 'communication:high-volume',
      class: RECOMMENDATION_CLASSES.COMMUNICATION,
      rationale: `${state.awaitingReply.length} threads exceeds high volume threshold`,
    });
  }

  // 5. WorkloadReviewRule: 10+ open threads OR 3+ meetings
  if (
    state.openThreads.length >= RULE_THRESHOLDS.WORKLOAD_OPEN_THREADS ||
    state.upcomingMeetings.length >= RULE_THRESHOLDS.WORKLOAD_MEETING_COUNT
  ) {
    triggeredRules.push({
      ruleId: 'planning:workload-review',
      class: RECOMMENDATION_CLASSES.PLANNING,
      rationale: `${state.openThreads.length} threads and ${state.upcomingMeetings.length} meetings triggers workload review`,
    });
  }

  // 6. FocusTimeRule: High activity AND no meeting within 2h
  const hasMeetingWithin2h = state.upcomingMeetings.some((m) => {
    const minutesUntil = (m.scheduledAt - checkpointTime) / (60 * 1000);
    return minutesUntil > 0 && minutesUntil < RULE_THRESHOLDS.FOCUS_WINDOW_MINUTES;
  });
  if (state.activityLevel === 'high' && !hasMeetingWithin2h) {
    triggeredRules.push({
      ruleId: 'focus:deep-work',
      class: RECOMMENDATION_CLASSES.FOCUS,
      rationale: 'High activity with no meetings in 2h enables focus time',
    });
  }

  // 7. LowActivityRule: Low/none activity AND pending items
  if ((state.activityLevel === 'low' || state.activityLevel === 'none') && state.awaitingReply.length > 0) {
    triggeredRules.push({
      ruleId: 'focus:low-activity',
      class: RECOMMENDATION_CLASSES.FOCUS,
      rationale: 'Low activity with pending items - good time to catch up',
    });
  }

  // 8. BreakSuggestionRule: 50+ events in 1h
  const totalEvents1h = Object.values(state.counts1h).reduce((sum, count) => sum + count, 0);
  if (totalEvents1h >= RULE_THRESHOLDS.BREAK_NEEDED_EVENTS_1H) {
    triggeredRules.push({
      ruleId: 'focus:break-needed',
      class: RECOMMENDATION_CLASSES.FOCUS,
      rationale: `${totalEvents1h} events in 1h - consider a break`,
    });
  }

  // 9. StaleThreadsRule: Any thread 7+ days old
  const now = checkpointTime;
  const staleThreshold = 7 * 24 * 60 * 60 * 1000;
  const staleThreads = state.openThreads.filter((t) => now - t.lastActivity >= staleThreshold);
  if (staleThreads.length > 0) {
    triggeredRules.push({
      ruleId: 'cleanup:stale-threads',
      class: RECOMMENDATION_CLASSES.CLEANUP,
      rationale: `${staleThreads.length} thread(s) older than 7 days`,
    });
  }

  // 10. InboxZeroRule: Few items AND not high activity
  if (
    state.awaitingReply.length <= RULE_THRESHOLDS.INBOX_ZERO_MAX_AWAITING &&
    state.openThreads.length <= RULE_THRESHOLDS.INBOX_ZERO_MAX_OPEN &&
    !(state.awaitingReply.length === 0 && state.openThreads.length === 0) &&
    state.activityLevel !== 'high'
  ) {
    triggeredRules.push({
      ruleId: 'cleanup:inbox-zero',
      class: RECOMMENDATION_CLASSES.CLEANUP,
      rationale: `Only ${state.awaitingReply.length} pending, ${state.openThreads.length} open - near inbox zero`,
    });
  }

  // 11. OrganizeFilesRule: 20+ file events AND not high activity
  const fileEvents = Object.entries(state.counts24h)
    .filter(([type]) => type.startsWith('file.'))
    .reduce((sum, [, count]) => sum + count, 0);
  if (fileEvents >= RULE_THRESHOLDS.FILE_ORGANIZE_COUNT && state.activityLevel !== 'high') {
    triggeredRules.push({
      ruleId: 'cleanup:organize-files',
      class: RECOMMENDATION_CLASSES.CLEANUP,
      rationale: `${fileEvents} file operations - consider organizing`,
    });
  }

  return triggeredRules;
}

/**
 * Derive expected labels from events and checkpoints
 * This replaces hardcoded expected labels with dynamically computed ones
 *
 * Each checkpoint gets its own set of labels based on the state at that checkpoint.
 * This ensures precision evaluation compares recommendations against what rules
 * SHOULD trigger at each specific point in time.
 */
function deriveExpectedLabels(events: Event[], checkpoints: string[]): ExpectedLabel[] {
  const labels: ExpectedLabel[] = [];

  for (let i = 0; i < checkpoints.length; i++) {
    const checkpointTime = new Date(checkpoints[i]).getTime();
    const state = deriveStateAtCheckpoint(events, checkpointTime);
    const triggeredRules = getRulesForState(state, checkpointTime);

    // Create window that spans exactly this checkpoint (small epsilon for matching)
    // This ensures each checkpoint is evaluated against its own expected rules
    const windowStart = checkpoints[i];
    const windowEnd = new Date(checkpointTime + 1).toISOString();

    for (const rule of triggeredRules) {
      labels.push({
        class: rule.class,
        window_start: windowStart,
        window_end: windowEnd,
        rule_id: rule.ruleId,
        rationale: rule.rationale,
      });
    }
  }

  return labels;
}

export type ScenarioType =
  | 'low_activity'
  | 'busy_meeting'
  | 'communication_heavy'
  | 'mixed'
  | 'noisy'
  | 'teacher_day'
  | 'student_day'
  | 'collaboration';

export interface TimelineConfig {
  id: string;
  name: string;
  description: string;
  userId: string;
  scenario: ScenarioType;
  baseTime: Date;
  durationHours: number;
}

export interface ExpectedLabel {
  class: RecommendationClass;
  window_start: string;
  window_end: string;
  rule_id: string;
  rationale: string;
}

export interface GeneratedTimeline {
  timeline_id: string;
  name: string;
  description: string;
  user_id: string;
  scenario: ScenarioType;
  events: Event[];
  checkpoints: string[];
  expected_labels: ExpectedLabel[];
}

const addHours = (date: Date, hours: number): Date => new Date(date.getTime() + hours * 60 * 60 * 1000);

const addMinutes = (date: Date, minutes: number): Date => new Date(date.getTime() + minutes * 60 * 1000);


interface FileEventParams {
  userId: string;
  fileId?: string;
  path: string;
  filename: string;
  size?: number;
  occurredAt?: string;
}

interface MailEventParams {
  userId: string;
  threadId: string;
  messageId: string;
  subjectLength: number;
  isNewThread?: boolean;
  hasAttachments?: boolean;
  recipientCount?: number;
  occurredAt?: string;
}

interface ChatEventParams {
  userId: string;
  channelId: string;
  messageId: string;
  hasMentions?: boolean;
  hasAttachments?: boolean;
  occurredAt?: string;
}

interface CalendarEventParams {
  userId: string;
  eventId: string;
  title: string;
  scheduledStart: string;
  scheduledEnd: string;
  participantCount?: number;
  occurredAt?: string;
}

interface ConferenceEventParams {
  userId: string;
  conferenceId: string;
  platform: string;
  participantCount?: number;
  durationMinutes?: number;
  occurredAt?: string;
}

const createFileCreatedEvent = (params: FileEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.CREATED)
    .withObjectType('file')
    .withObjectId(params.fileId || randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      path: params.path,
      filename: params.filename,
      size_bytes: params.size || 1024,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createMailReceivedEvent = (params: MailEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.MAIL)
    .withType(MAIL_EVENT_TYPES.RECEIVED)
    .withObjectType('email')
    .withObjectId(params.messageId)
    .withContext({ thread_id: params.threadId })
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .withMetadata({
      subject_length: params.subjectLength,
      is_new_thread: params.isNewThread ?? false,
      has_attachments: params.hasAttachments ?? false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createMailSentEvent = (params: MailEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.MAIL)
    .withType(MAIL_EVENT_TYPES.SENT)
    .withObjectType('email')
    .withObjectId(params.messageId)
    .withContext({ thread_id: params.threadId })
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .withMetadata({
      subject_length: params.subjectLength,
      recipient_count: params.recipientCount || 1,
      has_attachments: params.hasAttachments ?? false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createChatMessageReceivedEvent = (params: ChatEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CHAT)
    .withType(CHAT_EVENT_TYPES.MESSAGE_RECEIVED)
    .withObjectType('message')
    .withObjectId(params.messageId)
    .withContext({ context_id: params.channelId })
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .withMetadata({
      channel_id: params.channelId,
      has_mentions: params.hasMentions ?? false,
      has_attachments: params.hasAttachments ?? false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createChatMessageSentEvent = (params: ChatEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CHAT)
    .withType(CHAT_EVENT_TYPES.MESSAGE_SENT)
    .withObjectType('message')
    .withObjectId(params.messageId)
    .withContext({ context_id: params.channelId })
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .withMetadata({
      channel_id: params.channelId,
      has_mentions: params.hasMentions ?? false,
      has_attachments: params.hasAttachments ?? false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createCalendarEventCreatedEvent = (params: CalendarEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CALDAV)
    .withType(CALDAV_EVENT_TYPES.EVENT_CREATED)
    .withObjectType('calendar_event')
    .withObjectId(params.eventId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      title: params.title,
      scheduled_at: params.scheduledStart,
      scheduled_end: params.scheduledEnd,
      participant_count: params.participantCount || 1,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createConferenceStartedEvent = (params: ConferenceEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.STARTED)
    .withObjectType('conference')
    .withObjectId(params.conferenceId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      platform: params.platform,
      participant_count: params.participantCount || 1,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createConferenceEndedEvent = (params: ConferenceEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.ENDED)
    .withObjectType('conference')
    .withObjectId(params.conferenceId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      platform: params.platform,
      participant_count: params.participantCount || 1,
      duration_minutes: params.durationMinutes || 60,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface BulletinEventParams {
  userId: string;
  bulletinId: string;
  categoryId?: string;
  hasAttachments?: boolean;
  occurredAt?: string;
}

const createBulletinCreatedEvent = (params: BulletinEventParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.BULLETIN)
    .withType(BULLETIN_EVENT_TYPES.CREATED)
    .withObjectType('bulletin')
    .withObjectId(params.bulletinId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      category_id: params.categoryId || '',
      has_attachments: params.hasAttachments || false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface SurveyCreatedParams {
  userId: string;
  surveyId: string;
  isPublic?: boolean;
  occurredAt?: string;
}

const createSurveyCreatedEvent = (params: SurveyCreatedParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.CREATED)
    .withObjectType('survey')
    .withObjectId(params.surveyId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      is_public: params.isPublic || false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface SurveyAnswerParams {
  userId: string;
  surveyId: string;
  isAnonymous?: boolean;
  occurredAt?: string;
}

const createSurveyAnswerSubmittedEvent = (params: SurveyAnswerParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.ANSWER_SUBMITTED)
    .withObjectType('survey_answer')
    .withObjectId(randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      survey_id: params.surveyId,
      is_anonymous: params.isAnonymous || false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface WhiteboardSessionParams {
  userId: string;
  roomId: string;
  isMultiUserRoom?: boolean;
  occurredAt?: string;
}

const createWhiteboardSessionStartedEvent = (params: WhiteboardSessionParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.WHITEBOARD)
    .withType(WHITEBOARD_EVENT_TYPES.SESSION_STARTED)
    .withObjectType('whiteboard_session')
    .withObjectId(randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      room_id: params.roomId,
      is_multi_user: params.isMultiUserRoom || false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createWhiteboardSessionEndedEvent = (params: WhiteboardSessionParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.WHITEBOARD)
    .withType(WHITEBOARD_EVENT_TYPES.SESSION_ENDED)
    .withObjectType('whiteboard_session')
    .withObjectId(randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      room_id: params.roomId,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface ConferenceCreatedParams {
  userId: string;
  meetingId: string;
  name: string;
  isPublic?: boolean;
  participantCount?: number;
  occurredAt?: string;
}

const createConferenceCreatedEvent = (params: ConferenceCreatedParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.CREATED)
    .withObjectType('meeting')
    .withObjectId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      name: params.name,
      is_public: params.isPublic || false,
      participant_count: params.participantCount || 1,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface ConferenceMeetingParams {
  userId: string;
  meetingId: string;
  name: string;
  participantCount?: number;
  occurredAt?: string;
}

const createConferenceMeetingStartedEvent = (params: ConferenceMeetingParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.STARTED)
    .withObjectType('meeting')
    .withObjectId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      name: params.name,
      participant_count: params.participantCount || 1,
    })
    .withOccurredAt(params.occurredAt)
    .build();

const createConferenceMeetingEndedEvent = (params: ConferenceMeetingParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.ENDED)
    .withObjectType('meeting')
    .withObjectId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      name: params.name,
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface FileUploadedParams {
  userId: string;
  path: string;
  filename: string;
  size?: number;
  mimeType?: string;
  occurredAt?: string;
}

const createFileUploadedEvent = (params: FileUploadedParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.UPLOADED)
    .withObjectType('file')
    .withObjectId(randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .withMetadata({
      path: params.path,
      filename: params.filename,
      size_bytes: params.size || 0,
      mime_type: params.mimeType || 'application/octet-stream',
    })
    .withOccurredAt(params.occurredAt)
    .build();

interface FileSharedParams {
  userId: string;
  path: string;
  filename: string;
  shareId: string;
  isPublic?: boolean;
  occurredAt?: string;
}

const createFileSharedEvent = (params: FileSharedParams): Event =>
  new EventBuilder()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.SHARED)
    .withObjectType('file')
    .withObjectId(randomUUID())
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .withMetadata({
      path: params.path,
      filename: params.filename,
      share_id: params.shareId,
      is_public: params.isPublic || false,
    })
    .withOccurredAt(params.occurredAt)
    .build();

class TimelineGenerator {
  generate(config: TimelineConfig): GeneratedTimeline {
    switch (config.scenario) {
      case 'low_activity':
        return this.generateLowActivityDay(config);
      case 'busy_meeting':
        return this.generateBusyMeetingDay(config);
      case 'communication_heavy':
        return this.generateCommunicationHeavyDay(config);
      case 'mixed':
        return this.generateMixedDay(config);
      case 'noisy':
        return this.generateNoisyDay(config);
      case 'teacher_day':
        return this.generateTeacherDay(config);
      case 'student_day':
        return this.generateStudentDay(config);
      case 'collaboration':
        return this.generateCollaborationDay(config);
      default:
        throw new Error(`Unknown scenario: ${config.scenario}`);
    }
  }

  private generateLowActivityDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];
    const threadId = randomUUID();

    events.push(
      createMailReceivedEvent({
        userId,
        threadId,
        messageId: randomUUID(),
        subjectLength: 20,
        isNewThread: true,
        hasAttachments: false,
        occurredAt: addHours(baseTime, 9).toISOString(),
      }),
      createFileCreatedEvent({
        userId,
        path: '/documents/notes.md',
        filename: 'notes.md',
        size: 1024,
        occurredAt: addHours(baseTime, 11).toISOString(),
      }),
      createMailSentEvent({
        userId,
        threadId,
        messageId: randomUUID(),
        subjectLength: 20,
        recipientCount: 1,
        hasAttachments: false,
        occurredAt: addHours(baseTime, 14).toISOString(),
      }),
    );

    const checkpoints = [
      addHours(baseTime, 10).toISOString(),
      addHours(baseTime, 13).toISOString(),
      addHours(baseTime, 16).toISOString(),
    ];

    // Derive expected labels from actual rule trigger conditions
    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: config.description,
      user_id: userId,
      scenario: 'low_activity',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  private generateBusyMeetingDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    const meetingTimes = [9, 11, 13, 15, 16.5];
    meetingTimes.forEach((hour, i) => {
      const meetingId = randomUUID();
      events.push(
        createCalendarEventCreatedEvent({
          userId,
          eventId: meetingId,
          title: `Meeting ${i + 1}`,
          scheduledStart: addHours(baseTime, hour).toISOString(),
          scheduledEnd: addHours(baseTime, hour + 1).toISOString(),
          participantCount: 5,
          occurredAt: addHours(baseTime, hour - 24).toISOString(),
        }),
      );
    });

    for (let i = 0; i < 8; i++) {
      const threadId = randomUUID();
      events.push(
        createMailReceivedEvent({
          userId,
          threadId,
          messageId: randomUUID(),
          subjectLength: 30,
          isNewThread: i < 3,
          hasAttachments: false,
          occurredAt: addHours(baseTime, 8 + i * 0.5).toISOString(),
        }),
      );
    }

    const checkpoints = [
      addHours(baseTime, 8.5).toISOString(),
      addHours(baseTime, 10.5).toISOString(),
      addHours(baseTime, 14).toISOString(),
      addHours(baseTime, 17).toISOString(),
    ];

    // Derive expected labels from actual rule trigger conditions
    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: config.description,
      user_id: userId,
      scenario: 'busy_meeting',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  private generateCommunicationHeavyDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    for (let i = 0; i < 8; i++) {
      const threadId = randomUUID();
      events.push(
        createMailReceivedEvent({
          userId,
          threadId,
          messageId: randomUUID(),
          subjectLength: 40,
          isNewThread: true,
          hasAttachments: i % 3 === 0,
          occurredAt: addHours(baseTime, 8 + i * 0.5).toISOString(),
        }),
      );

      for (let j = 0; j < 3; j++) {
        events.push(
          createMailReceivedEvent({
            userId,
            threadId,
            messageId: randomUUID(),
            subjectLength: 40,
            isNewThread: false,
            hasAttachments: false,
            occurredAt: addHours(baseTime, 9 + i * 0.5 + j * 0.2).toISOString(),
          }),
        );
      }
    }

    for (let i = 0; i < 10; i++) {
      events.push(
        createChatMessageReceivedEvent({
          userId,
          channelId: 'team-channel',
          messageId: randomUUID(),
          hasMentions: i % 4 === 0,
          hasAttachments: false,
          occurredAt: addHours(baseTime, 8.5 + i * 0.3).toISOString(),
        }),
      );
    }

    const checkpoints = [
      addHours(baseTime, 9).toISOString(),
      addHours(baseTime, 12).toISOString(),
      addHours(baseTime, 15).toISOString(),
      addHours(baseTime, 17).toISOString(),
    ];

    // Derive expected labels from actual rule trigger conditions
    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: config.description,
      user_id: userId,
      scenario: 'communication_heavy',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  private generateMixedDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];
    const meetingId = randomUUID();
    const meetingThreadId = randomUUID();

    events.push(
      createCalendarEventCreatedEvent({
        userId,
        eventId: meetingId,
        title: 'Project Review',
        scheduledStart: addHours(baseTime, 10).toISOString(),
        scheduledEnd: addHours(baseTime, 11).toISOString(),
        participantCount: 4,
        occurredAt: addHours(baseTime, -20).toISOString(),
      }),
    );

    events.push(
      createMailReceivedEvent({
        userId,
        threadId: meetingThreadId,
        messageId: randomUUID(),
        subjectLength: 35,
        isNewThread: true,
        hasAttachments: true,
        occurredAt: addHours(baseTime, 8).toISOString(),
      }),
    );

    for (let i = 0; i < 4; i++) {
      events.push(
        createChatMessageReceivedEvent({
          userId,
          channelId: 'project-channel',
          messageId: randomUUID(),
          hasMentions: true,
          hasAttachments: false,
          occurredAt: addHours(baseTime, 8.5 + i * 0.25).toISOString(),
        }),
        createChatMessageSentEvent({
          userId,
          channelId: 'project-channel',
          messageId: randomUUID(),
          hasMentions: false,
          hasAttachments: false,
          occurredAt: addHours(baseTime, 8.6 + i * 0.25).toISOString(),
        }),
      );
    }

    events.push(
      createConferenceStartedEvent({
        userId,
        conferenceId: meetingId,
        platform: 'bbb',
        participantCount: 4,
        occurredAt: addHours(baseTime, 10).toISOString(),
      }),
      createConferenceEndedEvent({
        userId,
        conferenceId: meetingId,
        platform: 'bbb',
        participantCount: 4,
        durationMinutes: 55,
        occurredAt: addHours(baseTime, 10.92).toISOString(),
      }),
    );

    events.push(
      createMailSentEvent({
        userId,
        threadId: meetingThreadId,
        messageId: randomUUID(),
        subjectLength: 35,
        recipientCount: 4,
        hasAttachments: true,
        occurredAt: addHours(baseTime, 11.5).toISOString(),
      }),
    );

    for (let i = 0; i < 5; i++) {
      events.push(
        createFileCreatedEvent({
          userId,
          path: `/documents/project/file-${i}.md`,
          filename: `file-${i}.md`,
          size: 2048 + i * 512,
          occurredAt: addHours(baseTime, 12 + i * 0.5).toISOString(),
        }),
      );
    }

    const checkpoints = [
      addHours(baseTime, 8.5).toISOString(),
      addHours(baseTime, 9.5).toISOString(),
      addHours(baseTime, 11.5).toISOString(),
      addHours(baseTime, 14).toISOString(),
      addHours(baseTime, 16).toISOString(),
    ];

    // Derive expected labels from actual rule trigger conditions
    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: config.description,
      user_id: userId,
      scenario: 'mixed',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  private generateNoisyDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    for (let i = 0; i < 25; i++) {
      events.push(
        createFileCreatedEvent({
          userId,
          path: `/documents/file-${i}.txt`,
          filename: `file-${i}.txt`,
          size: 1000 + i * 100,
          occurredAt: addMinutes(baseTime, 480 + i * 15).toISOString(),
        }),
      );
    }

    for (let i = 0; i < 15; i++) {
      events.push(
        createChatMessageReceivedEvent({
          userId,
          channelId: `channel-${i % 5}`,
          messageId: randomUUID(),
          hasMentions: false,
          hasAttachments: false,
          occurredAt: addMinutes(baseTime, 490 + i * 20).toISOString(),
        }),
      );
    }

    for (let i = 0; i < 5; i++) {
      events.push(
        createMailReceivedEvent({
          userId,
          threadId: randomUUID(),
          messageId: randomUUID(),
          subjectLength: 25,
          isNewThread: true,
          hasAttachments: false,
          occurredAt: addMinutes(baseTime, 500 + i * 30).toISOString(),
        }),
      );
    }

    events.push(
      createCalendarEventCreatedEvent({
        userId,
        eventId: randomUUID(),
        title: 'Optional Sync',
        scheduledStart: addHours(baseTime, 14).toISOString(),
        scheduledEnd: addHours(baseTime, 14.5).toISOString(),
        participantCount: 2,
        occurredAt: addHours(baseTime, 8).toISOString(),
      }),
    );

    const checkpoints = [
      addHours(baseTime, 9).toISOString(),
      addHours(baseTime, 11).toISOString(),
      addHours(baseTime, 13).toISOString(),
      addHours(baseTime, 15).toISOString(),
      addHours(baseTime, 17).toISOString(),
    ];

    // Derive expected labels from actual rule trigger conditions
    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: config.description,
      user_id: userId,
      scenario: 'noisy',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  /**
   * Teacher's Typical Day
   * Uses: bulletin, survey, whiteboard, conference, files
   * Expected: meeting, planning, communication
   */
  private generateTeacherDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    // Morning: Post bulletin announcement
    events.push(
      createBulletinCreatedEvent({
        userId,
        bulletinId: randomUUID(),
        categoryId: 'announcements',
        hasAttachments: false,
        occurredAt: addHours(baseTime, 8).toISOString(),
      }),
    );

    // Morning: Create survey/quiz
    const surveyId = randomUUID();
    events.push(
      createSurveyCreatedEvent({
        userId,
        surveyId,
        isPublic: false,
        occurredAt: addHours(baseTime, 8.5).toISOString(),
      }),
    );

    // Student survey submissions (from different users, but we track events for the teacher)
    for (let i = 0; i < 5; i++) {
      events.push(
        createSurveyAnswerSubmittedEvent({
          userId: `student-${i + 1}`,
          surveyId,
          isAnonymous: false,
          occurredAt: addHours(baseTime, 9 + i * 0.5).toISOString(),
        }),
      );
    }

    // Schedule a meeting (calendar event)
    const meetingId = randomUUID();
    events.push(
      createCalendarEventCreatedEvent({
        userId,
        eventId: meetingId,
        title: 'Parent Meeting',
        scheduledStart: addHours(baseTime, 10).toISOString(),
        scheduledEnd: addHours(baseTime, 11).toISOString(),
        participantCount: 3,
        occurredAt: addHours(baseTime, 7).toISOString(),
      }),
    );

    // Video conference
    events.push(
      createConferenceCreatedEvent({
        userId,
        meetingId,
        name: 'Parent Meeting',
        isPublic: false,
        participantCount: 3,
        occurredAt: addHours(baseTime, 9.5).toISOString(),
      }),
      createConferenceMeetingStartedEvent({
        userId,
        meetingId,
        name: 'Parent Meeting',
        participantCount: 3,
        occurredAt: addHours(baseTime, 10).toISOString(),
      }),
      createConferenceMeetingEndedEvent({
        userId,
        meetingId,
        name: 'Parent Meeting',
        occurredAt: addHours(baseTime, 11).toISOString(),
      }),
    );

    // Afternoon: Whiteboard session for class
    const whiteboardRoom = randomUUID();
    events.push(
      createWhiteboardSessionStartedEvent({
        userId,
        roomId: whiteboardRoom,
        isMultiUserRoom: true,
        occurredAt: addHours(baseTime, 14).toISOString(),
      }),
      createWhiteboardSessionEndedEvent({
        userId,
        roomId: whiteboardRoom,
        occurredAt: addHours(baseTime, 15).toISOString(),
      }),
    );

    // Upload materials
    events.push(
      createFileUploadedEvent({
        userId,
        path: '/class-10a/materials/chapter5.pdf',
        filename: 'chapter5.pdf',
        size: 2500000,
        mimeType: 'application/pdf',
        occurredAt: addHours(baseTime, 15.5).toISOString(),
      }),
      createFileSharedEvent({
        userId,
        path: '/class-10a/materials/chapter5.pdf',
        filename: 'chapter5.pdf',
        shareId: randomUUID(),
        isPublic: false,
        occurredAt: addHours(baseTime, 15.6).toISOString(),
      }),
    );

    // Some mail threads for context
    const threadId = randomUUID();
    events.push(
      createMailReceivedEvent({
        userId,
        threadId,
        messageId: randomUUID(),
        subjectLength: 30,
        isNewThread: true,
        hasAttachments: false,
        occurredAt: addHours(baseTime, 8).toISOString(),
      }),
    );

    const checkpoints = [
      addHours(baseTime, 9).toISOString(),
      addHours(baseTime, 12).toISOString(),
      addHours(baseTime, 15).toISOString(),
      addHours(baseTime, 17).toISOString(),
    ];

    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: 'Teacher day with bulletin, surveys, conferences, whiteboard',
      user_id: userId,
      scenario: 'teacher_day',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  /**
   * Student's Day
   * Uses: survey submission, chat, bulletin read, whiteboard
   */
  private generateStudentDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    // Submit survey answer
    events.push(
      createSurveyAnswerSubmittedEvent({
        userId,
        surveyId: 'survey-chapter5-quiz',
        isAnonymous: false,
        occurredAt: addHours(baseTime, 9).toISOString(),
      }),
    );

    // Chat with classmates (group chat)
    const channelId = 'class-10a-general';
    for (let i = 0; i < 10; i++) {
      events.push(
        createChatMessageReceivedEvent({
          userId,
          channelId,
          messageId: randomUUID(),
          hasAttachments: false,
          occurredAt: addHours(baseTime, 10 + i * 0.2).toISOString(),
        }),
      );
    }

    // Student sends a message
    events.push(
      createChatMessageSentEvent({
        userId,
        channelId,
        messageId: randomUUID(),
        hasAttachments: false,
        occurredAt: addHours(baseTime, 12).toISOString(),
      }),
    );

    // Join whiteboard session (teacher's whiteboard)
    events.push(
      createWhiteboardSessionStartedEvent({
        userId,
        roomId: 'whiteboard-math-lesson',
        isMultiUserRoom: true,
        occurredAt: addHours(baseTime, 14).toISOString(),
      }),
      createWhiteboardSessionEndedEvent({
        userId,
        roomId: 'whiteboard-math-lesson',
        occurredAt: addHours(baseTime, 15).toISOString(),
      }),
    );

    // Receive mail from teacher
    const threadId = randomUUID();
    events.push(
      createMailReceivedEvent({
        userId,
        threadId,
        messageId: randomUUID(),
        subjectLength: 25,
        isNewThread: true,
        hasAttachments: true,
        occurredAt: addHours(baseTime, 8).toISOString(),
      }),
    );

    const checkpoints = [
      addHours(baseTime, 9).toISOString(),
      addHours(baseTime, 12).toISOString(),
      addHours(baseTime, 15).toISOString(),
    ];

    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: 'Student day with surveys, chat, whiteboard',
      user_id: userId,
      scenario: 'student_day',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }

  /**
   * Heavy Collaboration Day
   * Uses: chat, whiteboard, file sharing, conference
   */
  private generateCollaborationDay(config: TimelineConfig): GeneratedTimeline {
    const { userId, baseTime } = config;
    const events: Event[] = [];

    // Lots of chat messages in project channel
    const channelId = 'project-team';
    for (let i = 0; i < 20; i++) {
      const isSent = i % 3 === 0;
      if (isSent) {
        events.push(
          createChatMessageSentEvent({
            userId,
            channelId,
            messageId: randomUUID(),
            hasAttachments: i === 9,
            occurredAt: addHours(baseTime, 9 + i * 0.25).toISOString(),
          }),
        );
      } else {
        events.push(
          createChatMessageReceivedEvent({
            userId,
            channelId,
            messageId: randomUUID(),
            hasAttachments: false,
            occurredAt: addHours(baseTime, 9 + i * 0.25).toISOString(),
          }),
        );
      }
    }

    // Multiple whiteboard brainstorming sessions
    for (let i = 0; i < 3; i++) {
      const wbRoom = randomUUID();
      events.push(
        createWhiteboardSessionStartedEvent({
          userId,
          roomId: wbRoom,
          isMultiUserRoom: true,
          occurredAt: addHours(baseTime, 10 + i * 2).toISOString(),
        }),
        createWhiteboardSessionEndedEvent({
          userId,
          roomId: wbRoom,
          occurredAt: addHours(baseTime, 10.5 + i * 2).toISOString(),
        }),
      );
    }

    // Video call
    const meetingId = randomUUID();
    events.push(
      createConferenceMeetingStartedEvent({
        userId,
        meetingId,
        name: 'Team Sync',
        participantCount: 5,
        occurredAt: addHours(baseTime, 15).toISOString(),
      }),
      createConferenceMeetingEndedEvent({
        userId,
        meetingId,
        name: 'Team Sync',
        occurredAt: addHours(baseTime, 16).toISOString(),
      }),
    );

    // File sharing - design iterations
    for (let i = 0; i < 5; i++) {
      events.push(
        createFileSharedEvent({
          userId,
          path: `/projects/design-v${i + 1}.png`,
          filename: `design-v${i + 1}.png`,
          shareId: randomUUID(),
          isPublic: false,
          occurredAt: addHours(baseTime, 11 + i * 0.5).toISOString(),
        }),
      );
    }

    // Some mail threads to trigger communication rules
    for (let i = 0; i < 4; i++) {
      events.push(
        createMailReceivedEvent({
          userId,
          threadId: randomUUID(),
          messageId: randomUUID(),
          subjectLength: 30,
          isNewThread: true,
          hasAttachments: false,
          occurredAt: addHours(baseTime, 9 + i).toISOString(),
        }),
      );
    }

    const checkpoints = [
      addHours(baseTime, 10).toISOString(),
      addHours(baseTime, 13).toISOString(),
      addHours(baseTime, 16).toISOString(),
    ];

    const expectedLabels = deriveExpectedLabels(events, checkpoints);

    return {
      timeline_id: config.id,
      name: config.name,
      description: 'Heavy collaboration with chat, whiteboard, files, conference',
      user_id: userId,
      scenario: 'collaboration',
      events,
      checkpoints,
      expected_labels: expectedLabels,
    };
  }
}

export default TimelineGenerator;
