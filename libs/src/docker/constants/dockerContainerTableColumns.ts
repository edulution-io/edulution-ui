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

const DOCKER_CONTAINER_TABLE_COLUMNS = {
  STATE_BADGE: 'state-badge',
  NAME: 'name',
  CONTAINER_IMAGE: 'container-image',
  CONTAINER_STATE: 'container-state',
  CONTAINER_STATUS: 'container-status',
  CONTAINER_PORT: 'container-port',
  CONTAINER_CREATION_DATE: 'container-creation-date',
} as const;

export default DOCKER_CONTAINER_TABLE_COLUMNS;
