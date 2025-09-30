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

const WEBDAV_SHARE_TABLE_COLUMNS = {
  DISPLAY_NAME: 'displayName',
  WEBDAV_SHARE_ID: 'webdavShareId',
  URL: 'url',
  PATHNAME: 'pathname',
  IS_ROOT_PATH: 'isRootPath',
  VARIABLE: 'variable',
  ACCESSGROUPS: 'accessGroups',
  TYPE: 'type',
  STATUS: 'status',
} as const;

export default WEBDAV_SHARE_TABLE_COLUMNS;
