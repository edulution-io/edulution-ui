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

export const BULLETIN_CATEGORY_EDU_API_ENDPOINT: string = 'bulletin-category';
export const BULLETIN_CATEGORY_WITH_PERMISSION_EDU_API_ENDPOINT: string = `${BULLETIN_CATEGORY_EDU_API_ENDPOINT}?permission=`;
export const BULLETIN_CATEGORY_POSITION_EDU_API_ENDPOINT: string = `${BULLETIN_CATEGORY_EDU_API_ENDPOINT}/position`;
export const BULLETIN_BOARD_EDU_API_ENDPOINT: string = 'bulletinboard';
export const BULLETIN_BOARD_BULLETINS_EDU_API_ENDPOINT: string = `${BULLETIN_BOARD_EDU_API_ENDPOINT}/bulletins`;
export const BULLETIN_BOARD_SSE_EDU_API_ENDPOINT: string = `${BULLETIN_BOARD_EDU_API_ENDPOINT}/${SSE_EDU_API_ENDPOINTS.SSE}`;
export const BULLETIN_BOARD_UPLOAD_EDU_API_ENDPOINT: string = `${BULLETIN_BOARD_EDU_API_ENDPOINT}/files`;
export const BULLETIN_BOARD_ATTACHMENT_EDU_API_ENDPOINT: string = `${BULLETIN_BOARD_EDU_API_ENDPOINT}/attachments`;
