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

import axios from 'axios';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import { KEYCLOAK_REQUEST_TIMEOUT_MS } from '@libs/groups/constants/keycloakQueueConfig';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env as Record<string, string>;

const createKeycloakAxiosClient = (token: string) =>
  axios.create({
    baseURL: `${KEYCLOAK_API}/admin/realms/${KEYCLOAK_EDU_UI_REALM}`,
    headers: {
      [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      [HTTP_HEADERS.Authorization]: `Bearer ${token}`,
    },
    timeout: KEYCLOAK_REQUEST_TIMEOUT_MS,
  });

export default createKeycloakAxiosClient;
