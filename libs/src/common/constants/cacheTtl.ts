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

import THIRTY_DAYS from '@libs/common/constants/thirtyDays';

export const DEFAULT_CACHE_TTL_MS = 3600000;
export const USERS_CACHE_TTL_MS = THIRTY_DAYS;
export const KEYCLOAK_SYNC_MS = Number(process.env['KEYCLOAK_SYNC_MS']) || 61000;
export const KEYCLOAK_INITIAL_SYNC_MS = Number(process.env['KEYCLOAK_INITIAL_SYNC_MS']) || 60000;
export const GROUPS_CACHE_TTL_MS = THIRTY_DAYS;
export const AUTH_CACHE_TTL_MS = 3600000;
