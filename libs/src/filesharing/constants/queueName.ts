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
const FILESHARING_QUEUE_NAMES = {
  COPY_QUEUE: 'COPY_QUEUE',
  DUPLICATE_QUEUE: 'DUPLICATE_QUEUE',
  DELETE_QUEUE: 'DELETE_QUEUE',
  MOVE_QUEUE: 'MOVE_QUEUE',
} as const;

export default FILESHARING_QUEUE_NAMES;
