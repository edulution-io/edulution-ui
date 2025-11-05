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

export const SSE_HEARTBEAT_INTERVAL_MS = 25000;
export const SSE_PING_TIMEOUT_MS = SSE_HEARTBEAT_INTERVAL_MS + 10000;
export const SSE_RECONNECT_DELAY_MS = 10000;
export const SSE_USER_CONNECTIONS_CACHE_KEY = 'sse:userConnections';
export const SSE_PERSIST_DEBOUNCE_MS = 2000;
