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

const DOCKER_PROTECTED_CONTAINERS = {
  API: 'edulution-api',
  UI: 'edulution-ui',
  REDIS: 'edulution-redis',
  MONGODB: 'edulution-db',
  TRAEFIK: 'edulution-traefik',
  KEYCLOAK: 'edulution-keycloak',
  KEYCLOAK_DB: 'edulution-keycloak-db',
  DEV_REDIS: 'redisEdu',
  DEV_MONGODB: 'mongoEdu',
} as const;

export default DOCKER_PROTECTED_CONTAINERS;
