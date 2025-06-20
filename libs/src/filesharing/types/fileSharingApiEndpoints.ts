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

enum FileSharingApiEndpoints {
  FILESHARING_ACTIONS = '/filesharing',
  BASE = 'filesharing',
  FILE_STREAM = 'file-stream',
  FILE_LOCATION = 'file-location',
  ONLY_OFFICE_TOKEN = 'only-office',
  DUPLICATE = 'duplicate',
  COLLECT = 'collect',
  COPY = 'copy',
  FILE_SHARE = 'file-share',
  PUBLIC_FILE_SHARE = 'public-share',
  PUBLIC_FILE_SHARE_DOWNLOAD = 'public-share/download',
  UPLOAD = 'upload',
}

export default FileSharingApiEndpoints;
