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

const DOCKER_CONTAINER_NAMES = {
  MAILCOWDOCKERIZED_SOGO_MAILCOW_1: 'mailcowdockerized-sogo-mailcow-1',
  MAILCOWDOCKERIZED_MEMCACHED_MAILCOW_1: 'mailcowdockerized-memcached-mailcow-1',
} as const;

export default DOCKER_CONTAINER_NAMES;
