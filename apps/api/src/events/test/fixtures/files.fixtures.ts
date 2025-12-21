/*
 * LICENSE PLACEHOLDER
 */

import {
  EventBuilder,
  EVENT_SOURCES,
  FILE_EVENT_TYPES,
  EVENT_SENSITIVITY,
} from '@edulution/events';
import type { Event } from '@edulution/events';

export interface FileOperationStub {
  fileId: string;
  fileName: string;
  path: string;
  userId: string;
  projectId?: string;
  fileSize?: number;
  mimeType?: string;
}

export const FILE_OPERATION_STUBS: FileOperationStub[] = [
  {
    fileId: 'file-stub-001',
    fileName: 'report-q4.pdf',
    path: '/projects/alpha/docs/report-q4.pdf',
    userId: 'user-1',
    projectId: 'project-alpha',
    fileSize: 1048576,
    mimeType: 'application/pdf',
  },
  {
    fileId: 'file-stub-002',
    fileName: 'presentation.pptx',
    path: '/projects/alpha/slides/presentation.pptx',
    userId: 'user-2',
    projectId: 'project-alpha',
    fileSize: 5242880,
    mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  },
  {
    fileId: 'file-stub-003',
    fileName: 'data-export.csv',
    path: '/shared/exports/data-export.csv',
    userId: 'user-1',
    fileSize: 102400,
    mimeType: 'text/csv',
  },
  {
    fileId: 'file-stub-004',
    fileName: 'meeting-notes.md',
    path: '/team/notes/meeting-notes.md',
    userId: 'user-3',
    fileSize: 8192,
    mimeType: 'text/markdown',
  },
  {
    fileId: 'file-stub-005',
    fileName: 'config.json',
    path: '/projects/beta/config/config.json',
    userId: 'user-2',
    projectId: 'project-beta',
    fileSize: 2048,
    mimeType: 'application/json',
  },
];

export function createFileCreatedEvent(
  stub: FileOperationStub,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(stub.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.CREATED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: stub.fileId,
      object_ref: stub.path,
    })
    .withProjectId(stub.projectId)
    .withCorrelationId(`file-corr-${stub.fileId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('file_name', stub.fileName)
    .addMetadata('file_size', stub.fileSize || 0)
    .addMetadata('mime_type', stub.mimeType || 'application/octet-stream')
    .build();
}

export function createFileMovedEvent(
  stub: FileOperationStub,
  newPath: string,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(stub.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.MOVED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: stub.fileId,
      object_ref: newPath,
    })
    .withProjectId(stub.projectId)
    .withCorrelationId(`file-corr-${stub.fileId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('old_path', stub.path)
    .addMetadata('new_path', newPath)
    .addMetadata('file_name', stub.fileName)
    .build();
}

export function createFileDeletedEvent(
  stub: FileOperationStub,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(stub.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.DELETED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: stub.fileId,
      object_ref: stub.path,
    })
    .withProjectId(stub.projectId)
    .withCorrelationId(`file-corr-${stub.fileId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('file_name', stub.fileName)
    .addMetadata('permanently_deleted', false)
    .build();
}

export function createFileAccessedEvent(
  stub: FileOperationStub,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(stub.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.ACCESSED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: stub.fileId,
      object_ref: stub.path,
    })
    .withProjectId(stub.projectId)
    .withCorrelationId(`file-corr-${stub.fileId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('file_name', stub.fileName)
    .addMetadata('access_type', 'read')
    .build();
}

export function createFileCopiedEvent(
  stub: FileOperationStub,
  destinationPath: string,
  newFileId: string,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(stub.userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.COPIED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'file',
      object_id: newFileId,
      object_ref: destinationPath,
    })
    .withProjectId(stub.projectId)
    .withCorrelationId(`file-corr-${stub.fileId}`)
    .withCausationId(stub.fileId)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('source_path', stub.path)
    .addMetadata('destination_path', destinationPath)
    .addMetadata('source_file_id', stub.fileId)
    .build();
}

export function createFolderCreatedEvent(
  userId: string,
  folderId: string,
  folderPath: string,
  projectId?: string,
  occurredAt?: string,
): Event {
  return EventBuilder.create()
    .withUserId(userId)
    .withSource(EVENT_SOURCES.FILES)
    .withType(FILE_EVENT_TYPES.FOLDER_CREATED)
    .withOccurredAt(occurredAt || new Date().toISOString())
    .withObject({
      object_type: 'folder',
      object_id: folderId,
      object_ref: folderPath,
    })
    .withProjectId(projectId)
    .withCorrelationId(`folder-corr-${folderId}`)
    .withSensitivity(EVENT_SENSITIVITY.LOW)
    .addMetadata('folder_name', folderPath.split('/').pop() || '')
    .build();
}

export default {
  FILE_OPERATION_STUBS,
  createFileCreatedEvent,
  createFileMovedEvent,
  createFileDeletedEvent,
  createFileAccessedEvent,
  createFileCopiedEvent,
  createFolderCreatedEvent,
};
