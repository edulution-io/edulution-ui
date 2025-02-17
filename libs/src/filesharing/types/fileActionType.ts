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

enum FileActionType {
  MOVE_FILE_FOLDER = 'moveFileFolder',
  CREATE_FOLDER = 'createFolder',
  CREATE_FILE = 'createFile',
  DELETE_FILE_FOLDER = 'deleteFileFolder',
  UPLOAD_FILE = 'uploadFile',
  RENAME_FILE_FOLDER = 'renameFileFolder',
}

export default FileActionType;
