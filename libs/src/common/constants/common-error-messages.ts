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

enum CommonErrorMessages {
  DB_ACCESS_FAILED = 'common.errors.dbAccessFailed',
  DIRECTORY_CREATION_FAILED = 'common.errors.directoryNotCreated',
  FILE_UPLOAD_FAILED = 'common.errors.fileUploadFailed',
  FILE_DELETION_FAILED = 'common.errors.fileDeletionFailed',
  FILE_WRITING_FAILED = 'common.errors.fileWritingFailed',
  FILE_MOVE_FAILED = 'common.errors.fileMoveFailed',
  FILE_NOT_FOUND = 'common.errors.fileNotFound',
  FILE_NOT_PROVIDED = 'common.errors.fileNotProvided',
  INVALID_FILE_TYPE = 'common.errors.invalidFileType',
  WRONG_CONFIG = 'common.errors.wrongConfig',
}

export default CommonErrorMessages;
