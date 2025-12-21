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
  BULLETIN_EVENT_TYPES,
  SURVEY_EVENT_TYPES,
  WHITEBOARD_EVENT_TYPES,
  EVENT_SENSITIVITY,
} from "@edulution/events/src/index.js";
import type { Event } from "@edulution/events/src/index.js";

export interface DemoDataConfig {
  userIds: string[];
  threadCount: number;
  messagesPerThread: number;
  chatChannels: number;
  messagesPerChannel: number;
  calendarEventsPerUser: number;
  fileOperationsPerUser: number;
  bulletinsPerUser: number;
  surveysPerUser: number;
  whiteboardSessionsPerUser: number;
  timeRangeHours: number;
  enableScenarios: boolean;
}

const DEFAULT_CONFIG: DemoDataConfig = {
  userIds: ['demo-user-1', 'demo-user-2', 'demo-user-3'],
  threadCount: 5,
  messagesPerThread: 4,
  chatChannels: 3,
  messagesPerChannel: 10,
  calendarEventsPerUser: 5,
  fileOperationsPerUser: 5,
  bulletinsPerUser: 3,
  surveysPerUser: 2,
  whiteboardSessionsPerUser: 2,
  timeRangeHours: 48,
  enableScenarios: true,
};

const SUBJECTS = [
  'Project Update',
  'Meeting Notes',
  'Quick Question',
  'Follow Up Required',
  'Review Request',
  'Status Report',
  'Feedback Needed',
  'Action Items',
  'Weekly Summary',
  'Important Update',
];

const CHANNEL_NAMES = [
  'general',
  'project-alpha',
  'team-standup',
  'random',
  'announcements',
];

const MEETING_TYPES = [
  'Team Standup',
  'Project Review',
  'One-on-One',
  'Planning Session',
  'Retrospective',
  'Client Call',
  'Training Session',
  'Brainstorming',
];

const FILE_NAMES = [
  { name: 'report-q4.pdf', mime: 'application/pdf', size: 1048576 },
  { name: 'presentation.pptx', mime: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', size: 5242880 },
  { name: 'data-export.csv', mime: 'text/csv', size: 102400 },
  { name: 'meeting-notes.md', mime: 'text/markdown', size: 8192 },
  { name: 'config.json', mime: 'application/json', size: 2048 },
  { name: 'screenshot.png', mime: 'image/png', size: 524288 },
  { name: 'budget-2024.xlsx', mime: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', size: 204800 },
  { name: 'design-spec.docx', mime: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', size: 153600 },
];

const PROJECTS = ['project-alpha', 'project-beta', 'project-gamma'];

const BULLETIN_CATEGORIES = [
  'announcements',
  'events',
  'important-notices',
  'general-info',
  'staff-updates',
];

const SURVEY_TITLES = [
  'Course Feedback',
  'Student Satisfaction Survey',
  'Event Planning Poll',
  'Schedule Preferences',
  'Learning Experience Survey',
];

const WHITEBOARD_ROOM_PREFIXES = [
  'lesson-',
  'workshop-',
  'brainstorm-',
  'collaboration-',
];

export interface ScenarioResult {
  scenarioId: string;
  scenarioType: string;
  events: Event[];
  expectedRecommendation?: string;
}

class DemoDataGenerator {
  private config: DemoDataConfig;

  private baseTime: number;

  constructor(config: Partial<DemoDataConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
    this.baseTime = Date.now();
  }

  private randomElement<T>(arr: T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
  }

  private randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  private getRandomTimestamp(hoursAgo: number = 0, hoursRange: number = 1): string {
    const msAgo = hoursAgo * 60 * 60 * 1000;
    const msRange = hoursRange * 60 * 60 * 1000;
    const offset = this.randomInt(0, msRange);
    return new Date(this.baseTime - msAgo + offset).toISOString();
  }

  private getFutureTimestamp(hoursAhead: number, hoursRange: number = 1): string {
    const msAhead = hoursAhead * 60 * 60 * 1000;
    const msRange = hoursRange * 60 * 60 * 1000;
    const offset = this.randomInt(0, msRange);
    return new Date(this.baseTime + msAhead + offset).toISOString();
  }

  private addProvenanceMetadata(builder: ReturnType<typeof EventBuilder.create>, scenarioId?: string): ReturnType<typeof EventBuilder.create> {
    builder.addMetadata('_data_source', 'demo');
    if (scenarioId) {
      builder.addMetadata('_scenario_id', scenarioId);
    }
    return builder;
  }

  generateFileEvents(): Event[] {
    const events: Event[] = [];

    for (const userId of this.config.userIds) {
      const userPath = `/users/${userId}`;

      for (let i = 0; i < this.config.fileOperationsPerUser; i++) {
        const fileId = randomUUID();
        const fileInfo = this.randomElement(FILE_NAMES);
        const projectId = Math.random() > 0.3 ? this.randomElement(PROJECTS) : undefined;
        const folderPath = projectId
          ? `${userPath}/projects/${projectId}/documents`
          : `${userPath}/documents`;
        const filePath = `${folderPath}/${fileInfo.name}`;
        const correlationId = `file-corr-${randomUUID()}`;

        const createEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.FILES)
          .withType(FILE_EVENT_TYPES.CREATED)
          .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 4))
          .withObject({
            object_type: 'file',
            object_id: fileId,
            object_ref: filePath,
          })
          .withProjectId(projectId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('file_name', fileInfo.name)
          .addMetadata('file_size', fileInfo.size)
          .addMetadata('mime_type', fileInfo.mime)
          .addMetadata('created_by', userId);

        this.addProvenanceMetadata(createEvent);
        events.push(createEvent.build());

        if (Math.random() > 0.6) {
          const accessEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.FILES)
            .withType(FILE_EVENT_TYPES.ACCESSED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 2, 2))
            .withObject({
              object_type: 'file',
              object_id: fileId,
              object_ref: filePath,
            })
            .withProjectId(projectId)
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('file_name', fileInfo.name)
            .addMetadata('access_type', 'read');

          this.addProvenanceMetadata(accessEvent);
          events.push(accessEvent.build());
        }

        if (Math.random() > 0.8) {
          const newPath = `${userPath}/archive/${fileInfo.name}`;
          const moveEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.FILES)
            .withType(FILE_EVENT_TYPES.MOVED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 4, 1))
            .withObject({
              object_type: 'file',
              object_id: fileId,
              object_ref: newPath,
            })
            .withProjectId(projectId)
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('old_path', filePath)
            .addMetadata('new_path', newPath)
            .addMetadata('file_name', fileInfo.name);

          this.addProvenanceMetadata(moveEvent);
          events.push(moveEvent.build());
        }
      }
    }

    return events;
  }

  generateMailEvents(): Event[] {
    const events: Event[] = [];

    for (let t = 0; t < this.config.threadCount; t++) {
      const threadId = randomUUID();
      const subject = this.randomElement(SUBJECTS);
      const participants = this.config.userIds.slice(0, this.randomInt(2, this.config.userIds.length));
      const correlationId = `mail-corr-${randomUUID()}`;

      const threadCreatedEvent = EventBuilder.create()
        .withUserId(participants[0])
        .withSource(EVENT_SOURCES.MAIL)
        .withType(MAIL_EVENT_TYPES.THREAD_CREATED)
        .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 2))
        .withObject({
          object_type: 'thread',
          object_id: threadId,
          object_ref: `[Thread] ${subject}`,
        })
        .withThreadId(threadId)
        .withCorrelationId(correlationId)
        .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
        .addMetadata('subject_hash', randomUUID().slice(0, 16))
        .addMetadata('participant_count', participants.length)
        .addMetadata('participants', participants.join(','));

      this.addProvenanceMetadata(threadCreatedEvent);
      events.push(threadCreatedEvent.build());

      let lastSenderId = participants[0];
      for (let m = 0; m < this.config.messagesPerThread; m++) {
        const hoursAgo = this.config.timeRangeHours - (m * (this.config.timeRangeHours / this.config.messagesPerThread));
        const sender = this.randomElement(participants);
        const isReply = m > 0;

        const eventType = sender === lastSenderId
          ? MAIL_EVENT_TYPES.SENT
          : isReply ? MAIL_EVENT_TYPES.REPLIED : MAIL_EVENT_TYPES.RECEIVED;

        const emailId = randomUUID();
        const mailEvent = EventBuilder.create()
          .withUserId(sender)
          .withSource(EVENT_SOURCES.MAIL)
          .withType(eventType)
          .withOccurredAt(this.getRandomTimestamp(hoursAgo, 1))
          .withObject({
            object_type: 'email',
            object_id: emailId,
            object_ref: `mail://${threadId}/${emailId}`,
          })
          .withThreadId(threadId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
          .addMetadata('has_attachments', Math.random() > 0.7)
          .addMetadata('attachment_count', Math.random() > 0.7 ? this.randomInt(1, 3) : 0)
          .addMetadata('is_reply', isReply)
          .addMetadata('sender', sender)
          .addMetadata('recipient_count', participants.length - 1);

        this.addProvenanceMetadata(mailEvent);
        events.push(mailEvent.build());
        lastSenderId = sender;
      }

      if (Math.random() > 0.5) {
        const closeEvent = EventBuilder.create()
          .withUserId(this.randomElement(participants))
          .withSource(EVENT_SOURCES.MAIL)
          .withType(MAIL_EVENT_TYPES.THREAD_CLOSED)
          .withOccurredAt(this.getRandomTimestamp(1, 1))
          .withObject({
            object_type: 'thread',
            object_id: threadId,
            object_ref: `[Thread] ${subject}`,
          })
          .withThreadId(threadId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('message_count', this.config.messagesPerThread);

        this.addProvenanceMetadata(closeEvent);
        events.push(closeEvent.build());
      }
    }

    return events;
  }

  generateChatEvents(): Event[] {
    const events: Event[] = [];

    for (let c = 0; c < this.config.chatChannels; c++) {
      const channelId = randomUUID();
      const channelName = CHANNEL_NAMES[c % CHANNEL_NAMES.length];
      const correlationId = `chat-corr-${randomUUID()}`;

      for (let m = 0; m < this.config.messagesPerChannel; m++) {
        const hoursAgo = this.config.timeRangeHours - (m * (this.config.timeRangeHours / this.config.messagesPerChannel));
        const sender = this.randomElement(this.config.userIds);
        const messageId = randomUUID();

        const isSent = Math.random() > 0.5;
        const eventType = isSent ? CHAT_EVENT_TYPES.MESSAGE_SENT : CHAT_EVENT_TYPES.MESSAGE_RECEIVED;

        const chatEvent = EventBuilder.create()
          .withUserId(sender)
          .withSource(EVENT_SOURCES.CHAT)
          .withType(eventType)
          .withOccurredAt(this.getRandomTimestamp(hoursAgo, 0.5))
          .withObject({
            object_type: 'message',
            object_id: messageId,
            object_ref: `chat://${channelId}/${messageId}`,
          })
          .withThreadId(channelId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('channel_id', channelId)
          .addMetadata('channel_name', channelName)
          .addMetadata('has_mentions', Math.random() > 0.8)
          .addMetadata('has_attachments', Math.random() > 0.9)
          .addMetadata('sender', sender);

        this.addProvenanceMetadata(chatEvent);
        events.push(chatEvent.build());
      }
    }

    return events;
  }

  generateCalendarEvents(): Event[] {
    const events: Event[] = [];

    for (const userId of this.config.userIds) {
      for (let e = 0; e < this.config.calendarEventsPerUser; e++) {
        const eventId = randomUUID();
        const meetingType = this.randomElement(MEETING_TYPES);
        const correlationId = `cal-corr-${randomUUID()}`;

        const hoursAhead = this.randomInt(1, 72);
        const durationMinutes = this.randomElement([15, 30, 45, 60, 90, 120]);
        const scheduledStart = this.getFutureTimestamp(hoursAhead, 2);
        const scheduledEnd = new Date(new Date(scheduledStart).getTime() + durationMinutes * 60 * 1000).toISOString();
        const participantCount = this.randomInt(2, 8);

        const createEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.CALDAV)
          .withType(CALDAV_EVENT_TYPES.EVENT_CREATED)
          .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 4))
          .withObject({
            object_type: 'meeting',
            object_id: eventId,
            object_ref: meetingType,
          })
          .withMeetingId(eventId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('scheduled_at', scheduledStart)
          .addMetadata('scheduled_start', scheduledStart)
          .addMetadata('scheduled_end', scheduledEnd)
          .addMetadata('duration_minutes', durationMinutes)
          .addMetadata('participant_count', participantCount)
          .addMetadata('is_recurring', Math.random() > 0.7)
          .addMetadata('organizer', userId);

        this.addProvenanceMetadata(createEvent);
        events.push(createEvent.build());

        if (Math.random() > 0.7) {
          const updateEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.CALDAV)
            .withType(CALDAV_EVENT_TYPES.EVENT_UPDATED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 2, 2))
            .withObject({
              object_type: 'meeting',
              object_id: eventId,
              object_ref: meetingType,
            })
            .withMeetingId(eventId)
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('scheduled_at', scheduledStart)
            .addMetadata('scheduled_start', scheduledStart)
            .addMetadata('scheduled_end', scheduledEnd)
            .addMetadata('duration_minutes', durationMinutes)
            .addMetadata('update_type', 'time_changed');

          this.addProvenanceMetadata(updateEvent);
          events.push(updateEvent.build());
        }

        if (Math.random() > 0.8) {
          const reminderEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.CALDAV)
            .withType(CALDAV_EVENT_TYPES.REMINDER_TRIGGERED)
            .withOccurredAt(this.getRandomTimestamp(1, 1))
            .withObject({
              object_type: 'meeting',
              object_id: eventId,
              object_ref: meetingType,
            })
            .withMeetingId(eventId)
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('scheduled_at', scheduledStart)
            .addMetadata('reminder_minutes_before', this.randomElement([5, 10, 15, 30]));

          this.addProvenanceMetadata(reminderEvent);
          events.push(reminderEvent.build());
        }
      }
    }

    return events;
  }

  generateBulletinEvents(): Event[] {
    const events: Event[] = [];

    for (const userId of this.config.userIds) {
      for (let i = 0; i < this.config.bulletinsPerUser; i++) {
        const bulletinId = randomUUID();
        const categoryId = this.randomElement(BULLETIN_CATEGORIES);
        const correlationId = `bulletin-corr-${randomUUID()}`;
        const hasAttachments = Math.random() > 0.7;

        const createEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.BULLETIN)
          .withType(BULLETIN_EVENT_TYPES.CREATED)
          .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 4))
          .withObject({
            object_type: 'bulletin',
            object_id: bulletinId,
          })
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('category_id', categoryId)
          .addMetadata('has_attachments', hasAttachments);

        this.addProvenanceMetadata(createEvent);
        events.push(createEvent.build());

        if (Math.random() > 0.6) {
          const updateEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.BULLETIN)
            .withType(BULLETIN_EVENT_TYPES.UPDATED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 2, 2))
            .withObject({
              object_type: 'bulletin',
              object_id: bulletinId,
            })
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('category_id', categoryId);

          this.addProvenanceMetadata(updateEvent);
          events.push(updateEvent.build());
        }

        if (Math.random() > 0.85) {
          const deleteEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.BULLETIN)
            .withType(BULLETIN_EVENT_TYPES.DELETED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 4, 1))
            .withObject({
              object_type: 'bulletin',
              object_id: bulletinId,
            })
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('count', 1);

          this.addProvenanceMetadata(deleteEvent);
          events.push(deleteEvent.build());
        }
      }
    }

    return events;
  }

  generateSurveyEvents(): Event[] {
    const events: Event[] = [];

    for (const userId of this.config.userIds) {
      for (let i = 0; i < this.config.surveysPerUser; i++) {
        const surveyId = randomUUID();
        const surveyTitle = this.randomElement(SURVEY_TITLES);
        const correlationId = `survey-corr-${randomUUID()}`;
        const isPublic = Math.random() > 0.5;

        const createEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.SURVEYS)
          .withType(SURVEY_EVENT_TYPES.CREATED)
          .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 4))
          .withObject({
            object_type: 'survey',
            object_id: surveyId,
            object_ref: surveyTitle,
          })
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('is_public', isPublic);

        this.addProvenanceMetadata(createEvent);
        events.push(createEvent.build());

        if (Math.random() > 0.7) {
          const updateEvent = EventBuilder.create()
            .withUserId(userId)
            .withSource(EVENT_SOURCES.SURVEYS)
            .withType(SURVEY_EVENT_TYPES.UPDATED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 2, 2))
            .withObject({
              object_type: 'survey',
              object_id: surveyId,
              object_ref: surveyTitle,
            })
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW);

          this.addProvenanceMetadata(updateEvent);
          events.push(updateEvent.build());
        }

        const answerCount = this.randomInt(2, 8);
        for (let a = 0; a < answerCount; a++) {
          const respondent = this.randomElement(this.config.userIds);
          const answerEvent = EventBuilder.create()
            .withUserId(respondent)
            .withSource(EVENT_SOURCES.SURVEYS)
            .withType(SURVEY_EVENT_TYPES.ANSWER_SUBMITTED)
            .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours / 3, 2))
            .withObject({
              object_type: 'survey_answer',
              object_id: randomUUID(),
              object_ref: `survey://${surveyId}`,
            })
            .withCorrelationId(correlationId)
            .withSensitivity(EVENT_SENSITIVITY.LOW)
            .addMetadata('survey_id', surveyId)
            .addMetadata('is_anonymous', Math.random() > 0.7);

          this.addProvenanceMetadata(answerEvent);
          events.push(answerEvent.build());
        }
      }
    }

    return events;
  }

  generateWhiteboardEvents(): Event[] {
    const events: Event[] = [];

    for (const userId of this.config.userIds) {
      for (let i = 0; i < this.config.whiteboardSessionsPerUser; i++) {
        const roomPrefix = this.randomElement(WHITEBOARD_ROOM_PREFIXES);
        const roomId = `${roomPrefix}${randomUUID().slice(0, 8)}`;
        const correlationId = `whiteboard-corr-${randomUUID()}`;
        const isMultiUser = Math.random() > 0.4;
        const sessionDurationMinutes = this.randomInt(5, 60);

        const startEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.WHITEBOARD)
          .withType(WHITEBOARD_EVENT_TYPES.SESSION_STARTED)
          .withOccurredAt(this.getRandomTimestamp(this.config.timeRangeHours, 4))
          .withObject({
            object_type: 'whiteboard_session',
            object_id: randomUUID(),
            object_ref: `whiteboard://${roomId}`,
          })
          .withSessionId(roomId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('room_id', roomId)
          .addMetadata('is_multi_user', isMultiUser);

        this.addProvenanceMetadata(startEvent);
        const builtStartEvent = startEvent.build();
        events.push(builtStartEvent);

        const startTime = new Date(builtStartEvent.occurred_at);
        const endTime = new Date(startTime.getTime() + sessionDurationMinutes * 60 * 1000);

        const endEvent = EventBuilder.create()
          .withUserId(userId)
          .withSource(EVENT_SOURCES.WHITEBOARD)
          .withType(WHITEBOARD_EVENT_TYPES.SESSION_ENDED)
          .withOccurredAt(endTime.toISOString())
          .withObject({
            object_type: 'whiteboard_session',
            object_id: randomUUID(),
            object_ref: `whiteboard://${roomId}`,
          })
          .withSessionId(roomId)
          .withCorrelationId(correlationId)
          .withSensitivity(EVENT_SENSITIVITY.LOW)
          .addMetadata('room_id', roomId);

        this.addProvenanceMetadata(endEvent);
        events.push(endEvent.build());
      }
    }

    return events;
  }

  generateScenarioEmailThreadAwaitingReply(userId: string): ScenarioResult {
    const scenarioId = `SC-EMAIL-AWAIT-${randomUUID().slice(0, 8)}`;
    const events: Event[] = [];
    const threadId = randomUUID();
    const correlationId = `mail-corr-${randomUUID()}`;
    const colleague = this.config.userIds.find((u) => u !== userId) || 'colleague-1';

    const threadCreated = EventBuilder.create()
      .withUserId(colleague)
      .withSource(EVENT_SOURCES.MAIL)
      .withType(MAIL_EVENT_TYPES.THREAD_CREATED)
      .withOccurredAt(this.getRandomTimestamp(72, 2))
      .withObject({
        object_type: 'thread',
        object_id: threadId,
        object_ref: '[Thread] Urgent: Need your input on proposal',
      })
      .withThreadId(threadId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
      .addMetadata('subject_hash', randomUUID().slice(0, 16))
      .addMetadata('participant_count', 2)
      .addMetadata('participants', `${userId},${colleague}`);

    this.addProvenanceMetadata(threadCreated, scenarioId);
    events.push(threadCreated.build());

    const received1 = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.MAIL)
      .withType(MAIL_EVENT_TYPES.RECEIVED)
      .withOccurredAt(this.getRandomTimestamp(72, 1))
      .withObject({
        object_type: 'email',
        object_id: randomUUID(),
        object_ref: `mail://${threadId}/${randomUUID()}`,
      })
      .withThreadId(threadId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
      .addMetadata('sender', colleague)
      .addMetadata('is_reply', false);

    this.addProvenanceMetadata(received1, scenarioId);
    events.push(received1.build());

    const sent1 = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.MAIL)
      .withType(MAIL_EVENT_TYPES.SENT)
      .withOccurredAt(this.getRandomTimestamp(48, 1))
      .withObject({
        object_type: 'email',
        object_id: randomUUID(),
        object_ref: `mail://${threadId}/${randomUUID()}`,
      })
      .withThreadId(threadId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
      .addMetadata('sender', userId)
      .addMetadata('is_reply', true);

    this.addProvenanceMetadata(sent1, scenarioId);
    events.push(sent1.build());

    const received2 = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.MAIL)
      .withType(MAIL_EVENT_TYPES.RECEIVED)
      .withOccurredAt(this.getRandomTimestamp(24, 1))
      .withObject({
        object_type: 'email',
        object_id: randomUUID(),
        object_ref: `mail://${threadId}/${randomUUID()}`,
      })
      .withThreadId(threadId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
      .addMetadata('sender', colleague)
      .addMetadata('is_reply', true);

    this.addProvenanceMetadata(received2, scenarioId);
    events.push(received2.build());

    return {
      scenarioId,
      scenarioType: 'email-thread-awaiting-reply',
      events,
      expectedRecommendation: 'communication',
    };
  }

  generateScenarioMeetingPrep(userId: string): ScenarioResult {
    const scenarioId = `SC-MTG-PREP-${randomUUID().slice(0, 8)}`;
    const events: Event[] = [];
    const meetingId = randomUUID();
    const correlationId = `cal-corr-${randomUUID()}`;

    const meetingStart = this.getFutureTimestamp(1.5, 0.5);
    const meetingEnd = new Date(new Date(meetingStart).getTime() + 60 * 60 * 1000).toISOString();

    const calendarEvent = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.CALDAV)
      .withType(CALDAV_EVENT_TYPES.EVENT_CREATED)
      .withOccurredAt(this.getRandomTimestamp(24, 2))
      .withObject({
        object_type: 'meeting',
        object_id: meetingId,
        object_ref: 'Project Review Meeting',
      })
      .withMeetingId(meetingId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.LOW)
      .addMetadata('scheduled_at', meetingStart)
      .addMetadata('scheduled_start', meetingStart)
      .addMetadata('scheduled_end', meetingEnd)
      .addMetadata('duration_minutes', 60)
      .addMetadata('participant_count', 5)
      .addMetadata('organizer', userId);

    this.addProvenanceMetadata(calendarEvent, scenarioId);
    events.push(calendarEvent.build());

    const agendaThreadId = randomUUID();
    const colleague = this.config.userIds.find((u) => u !== userId) || 'organizer-1';

    const agendaReceived = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.MAIL)
      .withType(MAIL_EVENT_TYPES.RECEIVED)
      .withOccurredAt(this.getRandomTimestamp(2, 1))
      .withObject({
        object_type: 'email',
        object_id: randomUUID(),
        object_ref: `mail://${agendaThreadId}/${randomUUID()}`,
      })
      .withThreadId(agendaThreadId)
      .withMeetingId(meetingId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
      .addMetadata('sender', colleague)
      .addMetadata('subject_hash', 'agenda-for-meeting')
      .addMetadata('has_attachments', true)
      .addMetadata('attachment_count', 1);

    this.addProvenanceMetadata(agendaReceived, scenarioId);
    events.push(agendaReceived.build());

    const prepDocId = randomUUID();
    const prepDocEvent = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.FILES)
      .withType(FILE_EVENT_TYPES.CREATED)
      .withOccurredAt(this.getRandomTimestamp(1, 0.5))
      .withObject({
        object_type: 'file',
        object_id: prepDocId,
        object_ref: `/users/${userId}/documents/meeting-prep-notes.md`,
      })
      .withMeetingId(meetingId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.LOW)
      .addMetadata('file_name', 'meeting-prep-notes.md')
      .addMetadata('file_size', 4096)
      .addMetadata('mime_type', 'text/markdown')
      .addMetadata('created_by', userId);

    this.addProvenanceMetadata(prepDocEvent, scenarioId);
    events.push(prepDocEvent.build());

    return {
      scenarioId,
      scenarioType: 'meeting-preparation',
      events,
      expectedRecommendation: 'meeting',
    };
  }

  generateScenarioChatDiscussion(userId: string): ScenarioResult {
    const scenarioId = `SC-CHAT-DISC-${randomUUID().slice(0, 8)}`;
    const events: Event[] = [];
    const channelId = randomUUID();
    const correlationId = `chat-corr-${randomUUID()}`;
    const colleague = this.config.userIds.find((u) => u !== userId) || 'colleague-1';

    const question = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.CHAT)
      .withType(CHAT_EVENT_TYPES.MESSAGE_RECEIVED)
      .withOccurredAt(this.getRandomTimestamp(2, 0.5))
      .withObject({
        object_type: 'message',
        object_id: randomUUID(),
        object_ref: `chat://${channelId}/${randomUUID()}`,
      })
      .withThreadId(channelId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.LOW)
      .addMetadata('channel_id', channelId)
      .addMetadata('channel_name', 'project-alpha')
      .addMetadata('sender', colleague)
      .addMetadata('has_mentions', true);

    this.addProvenanceMetadata(question, scenarioId);
    events.push(question.build());

    const response = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.CHAT)
      .withType(CHAT_EVENT_TYPES.MESSAGE_SENT)
      .withOccurredAt(this.getRandomTimestamp(1.5, 0.25))
      .withObject({
        object_type: 'message',
        object_id: randomUUID(),
        object_ref: `chat://${channelId}/${randomUUID()}`,
      })
      .withThreadId(channelId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.LOW)
      .addMetadata('channel_id', channelId)
      .addMetadata('channel_name', 'project-alpha')
      .addMetadata('sender', userId);

    this.addProvenanceMetadata(response, scenarioId);
    events.push(response.build());

    const sharedFileId = randomUUID();
    const fileShared = EventBuilder.create()
      .withUserId(userId)
      .withSource(EVENT_SOURCES.FILES)
      .withType(FILE_EVENT_TYPES.SHARED)
      .withOccurredAt(this.getRandomTimestamp(1.25, 0.1))
      .withObject({
        object_type: 'file',
        object_id: sharedFileId,
        object_ref: `/users/${userId}/documents/relevant-doc.pdf`,
      })
      .withThreadId(channelId)
      .withCorrelationId(correlationId)
      .withSensitivity(EVENT_SENSITIVITY.LOW)
      .addMetadata('file_name', 'relevant-doc.pdf')
      .addMetadata('file_size', 524288)
      .addMetadata('mime_type', 'application/pdf')
      .addMetadata('shared_with', colleague)
      .addMetadata('shared_via', 'chat');

    this.addProvenanceMetadata(fileShared, scenarioId);
    events.push(fileShared.build());

    return {
      scenarioId,
      scenarioType: 'chat-discussion-action',
      events,
      expectedRecommendation: 'focus',
    };
  }

  generateScenarios(): ScenarioResult[] {
    const scenarios: ScenarioResult[] = [];
    const primaryUser = this.config.userIds[0];

    scenarios.push(this.generateScenarioEmailThreadAwaitingReply(primaryUser));
    scenarios.push(this.generateScenarioMeetingPrep(primaryUser));
    scenarios.push(this.generateScenarioChatDiscussion(primaryUser));

    return scenarios;
  }

  generateAll(): Event[] {
    const allEvents: Event[] = [
      ...this.generateFileEvents(),
      ...this.generateMailEvents(),
      ...this.generateChatEvents(),
      ...this.generateCalendarEvents(),
      ...this.generateBulletinEvents(),
      ...this.generateSurveyEvents(),
      ...this.generateWhiteboardEvents(),
    ];

    if (this.config.enableScenarios) {
      const scenarios = this.generateScenarios();
      for (const scenario of scenarios) {
        allEvents.push(...scenario.events);
      }
    }

    allEvents.sort((a, b) =>
      new Date(a.occurred_at).getTime() - new Date(b.occurred_at).getTime()
    );

    return allEvents;
  }

  static generateSummary(events: Event[]): {
    total: number;
    bySource: Record<string, number>;
    byType: Record<string, number>;
    timeRange: { earliest: string; latest: string };
    scenarios: string[];
  } {
    const bySource: Record<string, number> = {};
    const byType: Record<string, number> = {};
    const scenarioIds = new Set<string>();
    let earliest = events[0]?.occurred_at;
    let latest = events[0]?.occurred_at;

    for (const event of events) {
      bySource[event.source] = (bySource[event.source] || 0) + 1;
      byType[event.type] = (byType[event.type] || 0) + 1;

      if (event.occurred_at < earliest) earliest = event.occurred_at;
      if (event.occurred_at > latest) latest = event.occurred_at;

      const scenarioId = event.metadata?._scenario_id;
      if (typeof scenarioId === 'string') {
        scenarioIds.add(scenarioId);
      }
    }

    return {
      total: events.length,
      bySource,
      byType,
      timeRange: { earliest, latest },
      scenarios: Array.from(scenarioIds),
    };
  }
}

export default DemoDataGenerator;
