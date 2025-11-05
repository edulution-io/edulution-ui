/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
