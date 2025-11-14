/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

const SSE_MESSAGE_TYPE = {
  MESSAGE: 'message',
  PING: 'ping',
  UPDATED: 'updated',
  CONTAINER_STATUS: 'container_status',
  CONTAINER_UPDATE: 'container_update',
  CONTAINER_PROGRESS: 'container_progress',
  CONFERENCE_CREATED: 'conference_created',
  CONFERENCE_STARTED: 'conference_started',
  CONFERENCE_STOPPED: 'conference_stopped',
  CONFERENCE_DELETED: 'conference_deleted',
  SURVEY_CREATED: 'survey_created',
  SURVEY_UPDATED: 'survey_updated',
  SURVEY_DELETED: 'survey_deleted',
  BULLETIN_UPDATED: 'bulletin_update',
  FILESHARING_SHARE_FILES: 'filesharing_share_files',
  FILESHARING_COLLECT_FILES: 'filesharing_collect_files',
  FILESHARING_DELETE_FILES: 'filesharing_delete_files',
  FILESHARING_MOVE_OR_RENAME_FILES: 'filesharing_move_or_rename_files',
  FILESHARING_COPY_FILES: 'filesharing_copy_files',
  FILESHARING_CREATE_FOLDER: 'filesharing_create_folder',
  FILESHARING_FILE_UPLOAD: 'filesharing_file_upload',
  TLDRAW_SYNC_ROOM_LOG_MESSAGE: 'tldraw_sync_room_log_message',
  MAIL_THEME_UPDATED: 'mail_theme_updated',
  MAIL_THEME_UPDATE_FAILED: 'mail_theme_update_failed',
} as const;

export default SSE_MESSAGE_TYPE;
