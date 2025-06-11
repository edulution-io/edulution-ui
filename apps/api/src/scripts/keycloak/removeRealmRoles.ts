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

import { Logger } from '@nestjs/common';
import { Scripts } from '../../scripts/script.type';
import AUTH_PATHS from '@libs/auth/constants/auth-endpoints';
import axios from 'axios';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as {
  [key: string]: string;
};

type RealmRolesResponse = {
  id: string;
  name: string;
};

const removeRealmRoles: Scripts = {
  name: '000-removeRealmRoles',
  version: 1,
  execute: async () => {
    const keycloakBaseUrl = `${KEYCLOAK_API}/admin/realms/${KEYCLOAK_EDU_UI_REALM}`;
    const tokenEndpoint = `${KEYCLOAK_API}/realms/master/${AUTH_PATHS.AUTH_OIDC_TOKEN_PATH}`;
    const keycloakRolesEndpoint = `${keycloakBaseUrl}/roles/default-roles-${KEYCLOAK_EDU_UI_REALM}/composites`;
    const params = {
      grant_type: 'password',
      client_id: 'admin-cli',
      username: KEYCLOAK_ADMIN,
      password: KEYCLOAK_ADMIN_PASSWORD,
    };
    const rolesToDelete = ['query-users', 'view-users', 'query-groups'];

    try {
      Logger.debug('Fetching Keycloak access token...', removeRealmRoles.name);
      const { data: tokenData } = await axios.post<{ access_token: string }>(tokenEndpoint, params, {
        headers: { [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED },
      });

      const keycloakAccessToken = tokenData.access_token;

      const headers = {
        [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_X_WWW_FORM_URLENCODED,
        [HTTP_HEADERS.Authorization]: `Bearer ${keycloakAccessToken}`,
      };

      const { data: realmRoles } = await axios.get<RealmRolesResponse[]>(keycloakRolesEndpoint, { headers });

      const rolesToDelet = realmRoles.filter((role: { name: string }) => rolesToDelete.includes(role.name));

      if (rolesToDelet.length === 0) {
        Logger.log('No roles to delete found.', removeRealmRoles.name);
        return;
      }

      Logger.debug(`Has roles to delete: ${JSON.stringify(rolesToDelet)}`, removeRealmRoles.name);

      const response = await axios.delete(keycloakRolesEndpoint, {
        headers: {
          [HTTP_HEADERS.ContentType]: RequestResponseContentType.APPLICATION_JSON,
          [HTTP_HEADERS.Authorization]: `Bearer ${keycloakAccessToken}`,
        },
        data: rolesToDelet,
      });

      Logger.log(`Roles deleted successfully: Status ${response.status}`, removeRealmRoles.name);
    } catch (error) {
      Logger.error(error.message, removeRealmRoles.name);
    }
  },
};

export default removeRealmRoles;
