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
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API } = process.env as Record<string, string>;

const createKeycloakAxiosClient = (token: string) =>
  axios.create({
    baseURL: `${KEYCLOAK_API}/admin/realms/${KEYCLOAK_EDU_UI_REALM}`,
    headers: {
      [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
      [HTTP_HEADERS.Authorization]: `Bearer ${token}`,
    },
  });

export default createKeycloakAxiosClient;
