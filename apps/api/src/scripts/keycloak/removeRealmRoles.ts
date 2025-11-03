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
import { Scripts } from '../script.type';
import getKeycloakToken from './utilities/getKeycloakToken';
import createKeycloakAxiosClient from './utilities/createKeycloakAxiosClient';

const { KEYCLOAK_EDU_UI_REALM, KEYCLOAK_API, KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<
  string,
  string
>;

type RealmRolesResponse = {
  id: string;
  name: string;
};

const removeRealmRoles: Scripts = {
  name: '000-removeRealmRoles',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        removeRealmRoles.name,
      );
      return;
    }

    const keycloakBaseUrl = `${KEYCLOAK_API}/admin/realms/${KEYCLOAK_EDU_UI_REALM}`;
    const keycloakRolesEndpoint = `${keycloakBaseUrl}/roles/default-roles-${KEYCLOAK_EDU_UI_REALM}/composites`;
    const rolesToDelete = ['query-users', 'view-users', 'query-groups'];

    try {
      Logger.debug('Fetching Keycloak access token...', removeRealmRoles.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      const { data: realmRoles } = await keycloakClient.get<RealmRolesResponse[]>(keycloakRolesEndpoint);

      const realmRolesToDelete = realmRoles.filter((role: { name: string }) => rolesToDelete.includes(role.name));

      if (realmRolesToDelete.length === 0) {
        Logger.log('No roles to delete found.', removeRealmRoles.name);
        return;
      }

      Logger.debug(`Has roles to delete: ${JSON.stringify(realmRolesToDelete)}`, removeRealmRoles.name);

      const response = await keycloakClient.delete(keycloakRolesEndpoint, { data: realmRolesToDelete });

      Logger.log(`Roles deleted successfully: Status ${response.status}`, removeRealmRoles.name);
    } catch (error) {
      Logger.error(error.message, removeRealmRoles.name);
    }
  },
};

export default removeRealmRoles;
