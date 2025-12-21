/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  CONFERENCE_EVENT_TYPES,
  MAIL_EVENT_TYPES,
  CHAT_EVENT_TYPES,
  CALDAV_EVENT_TYPES,
  BULLETIN_EVENT_TYPES,
  SURVEY_EVENT_TYPES,
  WHITEBOARD_EVENT_TYPES,
  EVENT_SENSITIVITY,
} from '@edulution/events';
import type { Event, EventMetadata } from '@edulution/events';

export interface FileUploadedParams {
  userId: string;
  fileId?: string;
  path: string;
  filename: string;
  size?: number;
  mimeType?: string;
  occurredAt?: string;
}

export function createFileUploadedEvent(params: FileUploadedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.UPLOADED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.path,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('filename', params.filename)
    .addMetadata('size', params.size || 0)
    .addMetadata('mime_type', params.mimeType || 'application/octet-stream')
    .build();
}

export interface FileCreatedParams {
  userId: string;
  fileId?: string;
  path: string;
  filename: string;
  size?: number;
  mimeType?: string;
  occurredAt?: string;
}

export function createFileCreatedEvent(params: FileCreatedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.path,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('filename', params.filename)
    .addMetadata('size', params.size || 0)
    .addMetadata('mime_type', params.mimeType || 'application/octet-stream')
    .build();
}

export interface FileCopiedParams {
  userId: string;
  fileId?: string;
  sourcePath: string;
  targetPath: string;
  filename: string;
  occurredAt?: string;
}

export function createFileCopiedEvent(params: FileCopiedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.COPIED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.targetPath,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('filename', params.filename)
    .addMetadata('source_path', params.sourcePath)
    .addMetadata('target_path', params.targetPath)
    .build();
}

export interface FileMovedParams {
  userId: string;
  fileId?: string;
  sourcePath: string;
  targetPath: string;
  filename: string;
  occurredAt?: string;
}

export function createFileMovedEvent(params: FileMovedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.MOVED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.targetPath,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('filename', params.filename)
    .addMetadata('source_path', params.sourcePath)
    .addMetadata('target_path', params.targetPath)
    .build();
}

export interface FileDeletedParams {
  userId: string;
  fileId?: string;
  path: string;
  filename: string;
  occurredAt?: string;
}

export function createFileDeletedEvent(params: FileDeletedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.DELETED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.path,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('filename', params.filename)
    .build();
}

export interface FileSharedParams {
  userId: string;
  fileId?: string;
  path: string;
  filename: string;
  shareId: string;
  isPublic: boolean;
  occurredAt?: string;
}

export function createFileSharedEvent(params: FileSharedParams): Event {
  const fileId = params.fileId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.SHARED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: fileId,
      object_ref: params.path,
    })
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('filename', params.filename)
    .addMetadata('share_id', params.shareId)
    .addMetadata('is_public', params.isPublic)
    .build();
}

export interface FolderCreatedParams {
  userId: string;
  folderId?: string;
  path: string;
  folderName: string;
  occurredAt?: string;
}

export function createFolderCreatedEvent(params: FolderCreatedParams): Event {
  const folderId = params.folderId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.FOLDER_CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'folder',
      object_id: folderId,
      object_ref: params.path,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('folder_name', params.folderName)
    .build();
}

export interface ConferenceCreatedParams {
  userId: string;
  meetingId: string;
  name: string;
  isPublic: boolean;
  participantCount: number;
  occurredAt?: string;
}

export function createConferenceCreatedEvent(params: ConferenceCreatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: params.meetingId,
      object_ref: params.name,
    })
    .withMeetingId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('name', params.name)
    .addMetadata('is_public', params.isPublic)
    .addMetadata('participant_count', params.participantCount)
    .build();
}

export interface ConferenceStartedParams {
  userId: string;
  meetingId: string;
  name: string;
  participantCount: number;
  occurredAt?: string;
}

export function createConferenceStartedEvent(params: ConferenceStartedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.STARTED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: params.meetingId,
      object_ref: params.name,
    })
    .withMeetingId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('name', params.name)
    .addMetadata('participant_count', params.participantCount)
    .build();
}

export interface ConferenceEndedParams {
  userId: string;
  meetingId: string;
  name: string;
  occurredAt?: string;
}

export function createConferenceEndedEvent(params: ConferenceEndedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.ENDED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: params.meetingId,
      object_ref: params.name,
    })
    .withMeetingId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('name', params.name)
    .build();
}

export interface ConferenceParticipantJoinedParams {
  userId: string;
  meetingId: string;
  name: string;
  participantUsername: string;
  occurredAt?: string;
}

export function createConferenceParticipantJoinedEvent(params: ConferenceParticipantJoinedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CONFERENCES)
    .withType(CONFERENCE_EVENT_TYPES.PARTICIPANT_JOINED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'meeting',
      object_id: params.meetingId,
      object_ref: params.name,
    })
    .withMeetingId(params.meetingId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('participant_username', params.participantUsername)
    .build();
}

export interface ChatMessageSentParams {
  userId: string;
  messageId?: string;
  chatId: string;
  chatType: 'user' | 'group' | 'ai';
  messageLength: number;
  isAI?: boolean;
  occurredAt?: string;
}

export function createChatMessageSentEvent(params: ChatMessageSentParams): Event {
  const messageId = params.messageId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CHAT)
    .withType(CHAT_EVENT_TYPES.MESSAGE_SENT)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'message',
      object_id: messageId,
      object_ref: `chat://${params.chatId}/${messageId}`,
    })
    .withThreadId(params.chatId)
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('chat_type', params.chatType)
    .addMetadata('message_length', params.messageLength)
    .addMetadata('is_ai_response', params.isAI || false)
    .build();
}

export interface ChatMessageReceivedParams {
  userId: string;
  messageId?: string;
  chatId: string;
  chatType: 'user' | 'group' | 'ai';
  senderUsername: string;
  messageLength: number;
  occurredAt?: string;
}

export function createChatMessageReceivedEvent(params: ChatMessageReceivedParams): Event {
  const messageId = params.messageId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CHAT)
    .withType(CHAT_EVENT_TYPES.MESSAGE_RECEIVED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'message',
      object_id: messageId,
      object_ref: `chat://${params.chatId}/${messageId}`,
    })
    .withThreadId(params.chatId)
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('chat_type', params.chatType)
    .addMetadata('sender_username', params.senderUsername)
    .addMetadata('message_length', params.messageLength)
    .build();
}

export interface ChatChannelCreatedParams {
  userId: string;
  chatId: string;
  chatType: 'user' | 'group' | 'ai';
  participantCount: number;
  occurredAt?: string;
}

export function createChatChannelCreatedEvent(params: ChatChannelCreatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CHAT)
    .withType(CHAT_EVENT_TYPES.CHANNEL_CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'channel',
      object_id: params.chatId,
      object_ref: `chat://${params.chatId}`,
    })
    .withThreadId(params.chatId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('chat_type', params.chatType)
    .addMetadata('participant_count', params.participantCount)
    .build();
}

export interface MailSentParams {
  userId: string;
  messageId?: string;
  threadId: string;
  subjectLength: number;
  recipientCount: number;
  hasAttachments: boolean;
  occurredAt?: string;
}

export function createMailSentEvent(params: MailSentParams): Event {
  const messageId = params.messageId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.MAIL)
    .withType(MAIL_EVENT_TYPES.SENT)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'email',
      object_id: messageId,
      object_ref: `mail://${params.threadId}/${messageId}`,
    })
    .withThreadId(params.threadId)
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('subject_length', params.subjectLength)
    .addMetadata('recipient_count', params.recipientCount)
    .addMetadata('has_attachments', params.hasAttachments)
    .build();
}

export interface MailReceivedParams {
  userId: string;
  messageId?: string;
  threadId: string;
  senderUsername: string;
  subjectLength: number;
  hasAttachments: boolean;
  isNewThread: boolean;
  occurredAt?: string;
}

export function createMailReceivedEvent(params: MailReceivedParams): Event {
  const messageId = params.messageId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.MAIL)
    .withType(params.isNewThread ? MAIL_EVENT_TYPES.THREAD_CREATED : MAIL_EVENT_TYPES.RECEIVED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: params.isNewThread ? 'thread' : 'email',
      object_id: params.isNewThread ? params.threadId : messageId,
      object_ref: params.isNewThread ? `mail://${params.threadId}` : `mail://${params.threadId}/${messageId}`,
    })
    .withThreadId(params.threadId)
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('sender_username', params.senderUsername)
    .addMetadata('subject_length', params.subjectLength)
    .addMetadata('has_attachments', params.hasAttachments)
    .addMetadata('is_new_thread', params.isNewThread)
    .build();
}

export interface MailRepliedParams {
  userId: string;
  messageId?: string;
  threadId: string;
  subjectLength: number;
  recipientCount: number;
  hasAttachments: boolean;
  occurredAt?: string;
}

export function createMailRepliedEvent(params: MailRepliedParams): Event {
  const messageId = params.messageId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.MAIL)
    .withType(MAIL_EVENT_TYPES.REPLIED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'email',
      object_id: messageId,
      object_ref: `mail://${params.threadId}/${messageId}`,
    })
    .withThreadId(params.threadId)
    .withSensitivity(EVENT_SENSITIVITY.MEDIUM)
    .addMetadata('subject_length', params.subjectLength)
    .addMetadata('recipient_count', params.recipientCount)
    .addMetadata('has_attachments', params.hasAttachments)
    .build();
}

export interface CalendarEventCreatedParams {
  userId: string;
  eventId?: string;
  title: string;
  startTime: string;
  endTime: string;
  isAllDay?: boolean;
  participantCount?: number;
  occurredAt?: string;
}

export function createCalendarEventCreatedEvent(params: CalendarEventCreatedParams): Event {
  const eventId = params.eventId || randomUUID();
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CALDAV)
    .withType(CALDAV_EVENT_TYPES.EVENT_CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'calendar_event',
      object_id: eventId,
      object_ref: params.title,
    })
    .withMeetingId(eventId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('title', params.title)
    .addMetadata('scheduled_start', params.startTime)
    .addMetadata('scheduled_end', params.endTime)
    .addMetadata('is_all_day', params.isAllDay || false)
    .addMetadata('participant_count', params.participantCount || 1)
    .build();
}

export interface CalendarEventUpdatedParams {
  userId: string;
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  occurredAt?: string;
}

export function createCalendarEventUpdatedEvent(params: CalendarEventUpdatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CALDAV)
    .withType(CALDAV_EVENT_TYPES.EVENT_UPDATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'calendar_event',
      object_id: params.eventId,
      object_ref: params.title,
    })
    .withMeetingId(params.eventId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('title', params.title)
    .addMetadata('scheduled_start', params.startTime)
    .addMetadata('scheduled_end', params.endTime)
    .build();
}

export interface CalendarEventDeletedParams {
  userId: string;
  eventId: string;
  title: string;
  occurredAt?: string;
}

export function createCalendarEventDeletedEvent(params: CalendarEventDeletedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.CALDAV)
    .withType(CALDAV_EVENT_TYPES.EVENT_DELETED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'calendar_event',
      object_id: params.eventId,
      object_ref: params.title,
    })
    .withMeetingId(params.eventId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('title', params.title)
    .build();
}

export function addDemoProvenanceMetadata(event: Event, scenarioId?: string): Event {
  const updatedMetadata: EventMetadata = { ...event.metadata, _data_source: 'demo' };
  if (scenarioId) {
    updatedMetadata._scenario_id = scenarioId;
  }
  return { ...event, metadata: updatedMetadata };
}

export interface BulletinCreatedParams {
  userId: string;
  bulletinId: string;
  categoryId?: string;
  hasAttachments?: boolean;
  occurredAt?: string;
}

export function createBulletinCreatedEvent(params: BulletinCreatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.BULLETIN)
    .withType(BULLETIN_EVENT_TYPES.CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'bulletin',
      object_id: params.bulletinId,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('category_id', params.categoryId || '')
    .addMetadata('has_attachments', params.hasAttachments || false)
    .build();
}

export interface BulletinUpdatedParams {
  userId: string;
  bulletinId: string;
  categoryId?: string;
  occurredAt?: string;
}

export function createBulletinUpdatedEvent(params: BulletinUpdatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.BULLETIN)
    .withType(BULLETIN_EVENT_TYPES.UPDATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'bulletin',
      object_id: params.bulletinId,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('category_id', params.categoryId || '')
    .build();
}

export interface BulletinDeletedParams {
  userId: string;
  bulletinIds: string[];
  occurredAt?: string;
}

export function createBulletinDeletedEvent(params: BulletinDeletedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.BULLETIN)
    .withType(BULLETIN_EVENT_TYPES.DELETED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'bulletin',
      object_id: params.bulletinIds[0] || randomUUID(),
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('count', params.bulletinIds.length)
    .build();
}

export interface SurveyCreatedParams {
  userId: string;
  surveyId: string;
  isPublic?: boolean;
  occurredAt?: string;
}

export function createSurveyCreatedEvent(params: SurveyCreatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.CREATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'survey',
      object_id: params.surveyId,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('is_public', params.isPublic || false)
    .build();
}

export interface SurveyUpdatedParams {
  userId: string;
  surveyId: string;
  occurredAt?: string;
}

export function createSurveyUpdatedEvent(params: SurveyUpdatedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.UPDATED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'survey',
      object_id: params.surveyId,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .build();
}

export interface SurveyDeletedParams {
  userId: string;
  surveyIds: string[];
  occurredAt?: string;
}

export function createSurveyDeletedEvent(params: SurveyDeletedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.DELETED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'survey',
      object_id: params.surveyIds[0] || randomUUID(),
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('count', params.surveyIds.length)
    .build();
}

export interface SurveyAnswerSubmittedParams {
  userId: string;
  surveyId: string;
  isAnonymous?: boolean;
  occurredAt?: string;
}

export function createSurveyAnswerSubmittedEvent(params: SurveyAnswerSubmittedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.SURVEYS)
    .withType(SURVEY_EVENT_TYPES.ANSWER_SUBMITTED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'survey_answer',
      object_id: randomUUID(),
      object_ref: `survey://${params.surveyId}`,
    })
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('survey_id', params.surveyId)
    .addMetadata('is_anonymous', params.isAnonymous || false)
    .build();
}

export interface WhiteboardSessionStartedParams {
  userId: string;
  roomId: string;
  isMultiUserRoom?: boolean;
  occurredAt?: string;
}

export function createWhiteboardSessionStartedEvent(params: WhiteboardSessionStartedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.WHITEBOARD)
    .withType(WHITEBOARD_EVENT_TYPES.SESSION_STARTED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'whiteboard_session',
      object_id: randomUUID(),
      object_ref: `whiteboard://${params.roomId}`,
    })
    .withSessionId(params.roomId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('room_id', params.roomId)
    .addMetadata('is_multi_user', params.isMultiUserRoom || false)
    .build();
}

export interface WhiteboardSessionEndedParams {
  userId: string;
  roomId: string;
  occurredAt?: string;
}

export function createWhiteboardSessionEndedEvent(params: WhiteboardSessionEndedParams): Event {
  return EventBuilder.create()
    .withUserId(params.userId)
    .withSource(EVENT_SOURCES.WHITEBOARD)
    .withType(WHITEBOARD_EVENT_TYPES.SESSION_ENDED)
    .withOccurredAt(params.occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'whiteboard_session',
      object_id: randomUUID(),
      object_ref: `whiteboard://${params.roomId}`,
    })
    .withSessionId(params.roomId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('room_id', params.roomId)
    .build();
}
