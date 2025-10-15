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

const LMN_API_EDU_API_ENDPOINT = 'lmn-api';

const LMN_API_EDU_API_ENDPOINTS = {
  ROOT: LMN_API_EDU_API_ENDPOINT,
  SCHOOL_CLASSES: `${LMN_API_EDU_API_ENDPOINT}/school-classes`,
  PROJECT: `${LMN_API_EDU_API_ENDPOINT}/projects`,
  USER: `${LMN_API_EDU_API_ENDPOINT}/user`,
  USER_SESSIONS: `${LMN_API_EDU_API_ENDPOINT}/sessions`,
  SEARCH_USERS_OR_GROUPS: `${LMN_API_EDU_API_ENDPOINT}/search`,
  MANAGEMENT_GROUPS: `${LMN_API_EDU_API_ENDPOINT}/management-groups`,
  EXAM_MODE: `${LMN_API_EDU_API_ENDPOINT}/exam-mode`,
  PRINT_PASSWORDS: `${LMN_API_EDU_API_ENDPOINT}/passwords`,
  ROOM: `${LMN_API_EDU_API_ENDPOINT}/room`,
  CHANGE_PASSWORD: `${LMN_API_EDU_API_ENDPOINT}/password`,
  FIRST_PASSWORD: `${LMN_API_EDU_API_ENDPOINT}/first-password`,
  PRINTERS: `${LMN_API_EDU_API_ENDPOINT}/printers`,
  USERS_QUOTA: 'quotas',
  SCHOOLS: `${LMN_API_EDU_API_ENDPOINT}/schools`,
} as const;

export default LMN_API_EDU_API_ENDPOINTS;
