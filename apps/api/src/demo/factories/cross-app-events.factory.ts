import { randomUUID } from 'crypto';
import type { EventInput, EventSource } from '@edulution/events';

interface BaseEventOptions {
  userId: string;
  baseDate?: Date;
  hour?: number;
}

export function createConferenceEvent(
  opts: BaseEventOptions & {
    subjectName: string;
    participants?: string[];
  },
): EventInput {
  const conferenceId = `conf-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const scheduledAt = new Date(date);
  scheduledAt.setHours(opts.hour || 10, 0, 0, 0);

  return {
    user_id: opts.userId,
    source: 'conferences' as EventSource,
    type: 'conference.created',
    object: {
      object_type: 'conference',
      object_id: conferenceId,
      object_ref: opts.subjectName.toLowerCase(),
    },
    metadata: {
      conference_id: conferenceId,
      subject_name: opts.subjectName,
      scheduled_at: scheduledAt.toISOString(),
      participant_count: opts.participants?.length || 0,
    },
    payload: {
      participants: opts.participants || [],
    },
    sensitivity: 'low',
  };
}

export function createSurveyEvent(
  opts: BaseEventOptions & {
    title: string;
    targetGroups?: string[];
  },
): EventInput {
  const surveyId = `survey-${randomUUID().slice(0, 8)}`;

  return {
    user_id: opts.userId,
    source: 'surveys' as EventSource,
    type: 'survey.created',
    object: {
      object_type: 'survey',
      object_id: surveyId,
    },
    metadata: {
      survey_id: surveyId,
      title: opts.title,
      target_group_count: opts.targetGroups?.length || 0,
    },
    payload: {
      target_groups: opts.targetGroups || [],
    },
    sensitivity: 'low',
  };
}

export function createProjectEvent(
  opts: BaseEventOptions & {
    projectName: string;
    members?: string[];
  },
): EventInput {
  const projectId = `proj-${randomUUID().slice(0, 8)}`;

  return {
    user_id: opts.userId,
    source: 'system' as EventSource,
    type: 'project.created',
    object: {
      object_type: 'project',
      object_id: projectId,
    },
    metadata: {
      project_id: projectId,
      project_name: opts.projectName,
      member_count: opts.members?.length || 0,
    },
    payload: {
      members: opts.members || [],
    },
    sensitivity: 'low',
  };
}

export function createClassEvent(
  opts: BaseEventOptions & {
    className: string;
    students?: string[];
    teachers?: string[];
  },
): EventInput {
  const classId = `class-${opts.className.toLowerCase().replace(/\s/g, '-')}`;
  const teachers = opts.teachers || [opts.userId];

  return {
    user_id: opts.userId,
    source: 'system' as EventSource,
    type: 'class.created',
    object: {
      object_type: 'class',
      object_id: classId,
    },
    metadata: {
      class_id: classId,
      class_name: opts.className,
      student_count: opts.students?.length || 0,
      teacher_count: teachers.length,
    },
    payload: {
      students: opts.students || [],
      teachers,
    },
    sensitivity: 'low',
  };
}

export function createExamSessionEvent(
  opts: BaseEventOptions & {
    className: string;
    students?: string[];
  },
): EventInput {
  const sessionId = `session-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const scheduledAt = new Date(date);
  scheduledAt.setHours(opts.hour || 8, 0, 0, 0);

  return {
    user_id: opts.userId,
    source: 'system' as EventSource,
    type: 'session.started',
    object: {
      object_type: 'session',
      object_id: sessionId,
    },
    metadata: {
      session_id: sessionId,
      class_name: opts.className,
      is_exam: true,
      scheduled_at: scheduledAt.toISOString(),
      student_count: opts.students?.length || 0,
    },
    payload: {
      students: opts.students || [],
    },
    sensitivity: 'medium',
  };
}

export function createMailWithAttachmentsEvent(
  opts: BaseEventOptions & {
    subject: string;
    attachments: Array<{ filename: string; size: number }>;
  },
): EventInput {
  const mailId = `mail-${randomUUID().slice(0, 8)}`;

  return {
    user_id: opts.userId,
    source: 'mail' as EventSource,
    type: 'mail.received',
    object: {
      object_type: 'mail',
      object_id: mailId,
    },
    metadata: {
      mail_id: mailId,
      subject: opts.subject,
      has_attachments: true,
      attachment_count: opts.attachments.length,
    },
    payload: {
      attachments: opts.attachments.map((att) => ({
        filename: att.filename,
        temp_path: `/tmp/attachments/${mailId}/${att.filename}`,
        size: att.size,
      })),
    },
    sensitivity: 'medium',
  };
}

export function createImportantBulletinEvent(
  opts: BaseEventOptions & {
    title: string;
    targetGroups: Array<{ group_id: string; name: string; chat_id: string }>;
  },
): EventInput {
  const bulletinId = `bulletin-${randomUUID().slice(0, 8)}`;

  return {
    user_id: opts.userId,
    source: 'bulletin' as EventSource,
    type: 'bulletin.created',
    object: {
      object_type: 'bulletin',
      object_id: bulletinId,
    },
    metadata: {
      bulletin_id: bulletinId,
      title: opts.title,
      is_important: true,
      target_group_count: opts.targetGroups.length,
    },
    payload: {
      target_groups: opts.targetGroups,
    },
    sensitivity: 'low',
  };
}
