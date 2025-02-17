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

export const DEFAULT_CACHE_TTL_MS = 3600000;
export const KEYCLOACK_SYNC_MS = Number(process.env['KEYCLOACK_SYNC_MS']) || 60000;
export const GROUPS_CACHE_TTL_MS = KEYCLOACK_SYNC_MS <= 60000 ? 120000 : KEYCLOACK_SYNC_MS * 2;
export const AUTH_CACHE_TTL_MS = 3600000;
