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

const JOB_NAMES = {
  DUPLICATE_FILE_JOB: 'duplicate-file',
  COLLECT_FILE_JOB: 'collect-file',
  DELETE_FILE_JOB: 'delete-file',
  MOVE_OR_RENAME_JOB: 'move-or-rename-file',
  COPY_FILE_JOB: 'copy-file',
  CREATE_FOLDER_JOB: 'create-folder',
  FILE_UPLOAD_JOB: 'file-upload',
} as const;

export default JOB_NAMES;
