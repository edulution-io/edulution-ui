/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
  TLDRAW_SYNC_ROOM_LOG_MESSAGE: 'tldraw_sync_room_log_message',
  FILESHARING_CREATE_FOLDER: 'filesharing_create_folder',
  FILESHARING_FILE_UPLOAD: 'filesharing_file_upload',
} as const;

export default SSE_MESSAGE_TYPE;
