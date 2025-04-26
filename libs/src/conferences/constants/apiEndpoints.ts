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

import SSE_EDU_API_ENDPOINTS from '@libs/sse/constants/sseEndpoints';

export const CONFERENCES_EDU_API_ENDPOINT: string = 'conferences';
export const CONFERENCES_JOIN_EDU_API_ENDPOINT = `${CONFERENCES_EDU_API_ENDPOINT}/join`;
export const CONFERENCES_PUBLIC_EDU_API_ENDPOINT = `${CONFERENCES_EDU_API_ENDPOINT}/public`;
export const CONFERENCES_PUBLIC_SSE_EDU_API_ENDPOINT = `${SSE_EDU_API_ENDPOINTS.SSE}/${CONFERENCES_EDU_API_ENDPOINT}/public`;
