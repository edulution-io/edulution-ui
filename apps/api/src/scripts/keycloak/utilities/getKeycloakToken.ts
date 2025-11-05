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
import AUTH_PATHS from '@libs/auth/constants/auth-paths';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

const { KEYCLOAK_API, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

const getKeycloakToken = async () => {
  const tokenEndpoint = `${KEYCLOAK_API}/realms/master/${AUTH_PATHS.AUTH_OIDC_TOKEN_PATH}`;

  const params = {
    grant_type: 'password',
    client_id: 'admin-cli',
    username: KEYCLOAK_ADMIN,
    password: KEYCLOAK_ADMIN_PASSWORD,
  };
  const { data: tokenData } = await axios.post<{ access_token: string }>(tokenEndpoint, params, {
    headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
  });

  return tokenData.access_token;
};

export default getKeycloakToken;
