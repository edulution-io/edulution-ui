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
