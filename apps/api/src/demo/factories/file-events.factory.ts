/*
 * LICENSE PLACEHOLDER
 */

import { randomUUID } from 'crypto';
import type { EventInput, EventSource } from '@edulution/events';

interface BaseEventOptions {
  userId: string;
  baseDate?: Date;
  hour?: number;
}

interface AttachmentInfo {
  filename: string;
  size: number;
  mimeType?: string;
}

function guessMimeType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const mimeTypes: Record<string, string> = {
    pdf: 'application/pdf',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    doc: 'application/msword',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    xls: 'application/vnd.ms-excel',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ppt: 'application/vnd.ms-powerpoint',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    txt: 'text/plain',
    zip: 'application/zip',
    rar: 'application/x-rar-compressed',
    mp3: 'audio/mpeg',
    mp4: 'video/mp4',
  };
  return mimeTypes[ext || ''] || 'application/octet-stream';
}

function setHour(date: Date, hour: number): Date {
  const result = new Date(date);
  result.setHours(Math.floor(hour), Math.floor((hour % 1) * 60), 0, 0);
  return result;
}

export function createMailWithAttachmentsFileEvent(
  opts: BaseEventOptions & {
    subject: string;
    from?: string;
    attachments: AttachmentInfo[];
  },
): EventInput {
  const mailId = `mail-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 9);

  return {
    user_id: opts.userId,
    source: 'mail' as EventSource,
    type: 'mail.received',
    object: {
      object_type: 'mail',
      object_id: mailId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      mail_id: mailId,
      subject: opts.subject,
      from: opts.from || 'kollege@schule.de',
      has_attachments: true,
      attachment_count: opts.attachments.length,
    },
    payload: {
      attachments: opts.attachments.map((att, i) => ({
        attachment_id: `att-${mailId}-${i}`,
        filename: att.filename,
        size: att.size,
        mime_type: att.mimeType || guessMimeType(att.filename),
        temp_path: `/tmp/attachments/${mailId}/${att.filename}`,
      })),
    },
    sensitivity: 'medium',
    correlation_id: randomUUID(),
  };
}

export function createFileUploadedEvent(
  opts: BaseEventOptions & {
    filename: string;
    path: string;
    size?: number;
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 10);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.uploaded',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      path: opts.path,
      size: opts.size || 125000,
      mime_type: guessMimeType(opts.filename),
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFileSharedEvent(
  opts: BaseEventOptions & {
    filename: string;
    path?: string;
    sharedWith: string[];
    shareType?: 'read' | 'write';
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 11);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.shared',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      path: opts.path || '/Dokumente',
      share_type: opts.shareType || 'read',
      shared_with_count: opts.sharedWith.length,
    },
    payload: {
      shared_with: opts.sharedWith,
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFolderCreatedEvent(
  opts: BaseEventOptions & {
    folderName: string;
    path: string;
  },
): EventInput {
  const folderId = `folder-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 9);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'folder.created',
    object: {
      object_type: 'folder',
      object_id: folderId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      folder_id: folderId,
      name: opts.folderName,
      path: opts.path,
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFileModifiedEvent(
  opts: BaseEventOptions & {
    filename: string;
    path: string;
    modificationCount?: number;
    lastBackup?: string | null;
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 14);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.modified',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      path: opts.path,
      modification_count: opts.modificationCount || 15,
      last_backup: opts.lastBackup ?? null,
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFileDownloadRequestedEvent(
  opts: BaseEventOptions & {
    filename: string;
    path?: string;
    requestedBy: string;
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 15);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.download_requested',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      path: opts.path || '/Dokumente',
      requested_by: opts.requestedBy,
      requested_at: occurredAt.toISOString(),
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFileDeletedEvent(
  opts: BaseEventOptions & {
    filename: string;
    path: string;
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 16);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.deleted',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      path: opts.path,
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export function createFileMovedEvent(
  opts: BaseEventOptions & {
    filename: string;
    fromPath: string;
    toPath: string;
  },
): EventInput {
  const fileId = `file-${randomUUID().slice(0, 8)}`;
  const date = opts.baseDate || new Date();
  const occurredAt = setHour(date, opts.hour || 12);

  return {
    user_id: opts.userId,
    source: 'files' as EventSource,
    type: 'file.moved',
    object: {
      object_type: 'file',
      object_id: fileId,
    },
    occurred_at: occurredAt.toISOString(),
    metadata: {
      file_id: fileId,
      filename: opts.filename,
      from_path: opts.fromPath,
      to_path: opts.toPath,
    },
    sensitivity: 'low',
    correlation_id: randomUUID(),
  };
}

export const FILE_EVENT_FACTORIES = {
  createMailWithAttachmentsFileEvent,
  createFileUploadedEvent,
  createFileSharedEvent,
  createFolderCreatedEvent,
  createFileModifiedEvent,
  createFileDownloadRequestedEvent,
  createFileDeletedEvent,
  createFileMovedEvent,
};
