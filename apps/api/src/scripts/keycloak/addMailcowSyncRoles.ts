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
import createKeycloakAxiosClient from './utilities/createKeycloakAxiosClient';
import getKeycloakToken from './utilities/getKeycloakToken';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

const addMailcowSyncRoles: Scripts = {
  name: '001-addMailcowSyncRoles',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        addMailcowSyncRoles.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', addMailcowSyncRoles.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Fetching client IDs...', addMailcowSyncRoles.name);
      const [eduMailcowClient, realmMgmtClient] = await Promise.all([
        keycloakClient.get('/clients', { params: { clientId: 'edu-mailcow-sync' } }),
        keycloakClient.get('/clients', { params: { clientId: 'realm-management' } }),
      ]);

      const eduMailcowClientData = eduMailcowClient.data[0];
      if (!eduMailcowClientData) {
        Logger.warn('No edu-mailcow-sync client found; exiting.', addMailcowSyncRoles.name);
        return;
      }
      const { id: eduMailcowClientId } = eduMailcowClientData;
      const realmMgmtClientData = realmMgmtClient.data[0];
      const { id: realmMgmtClientId } = realmMgmtClientData;

      Logger.debug('Fetching service account user ID for edu-mailcow-sync client...', addMailcowSyncRoles.name);
      const { data: serviceAccountUser } = await keycloakClient.get(
        `/clients/${eduMailcowClientId}/service-account-user`,
      );
      if (!serviceAccountUser) {
        Logger.warn('No service account user found for edu-mailcow-sync client; exiting.', addMailcowSyncRoles.name);
        return;
      }
      const serviceAccountUserId = serviceAccountUser?.id;

      Logger.debug('Fetching roles...', addMailcowSyncRoles.name);
      const [queryUsers, queryGroups] = await Promise.all([
        keycloakClient.get(`/clients/${realmMgmtClientId}/roles/query-users`),
        keycloakClient.get(`/clients/${realmMgmtClientId}/roles/query-groups`),
      ]);
      const rolesToAdd = [queryUsers.data, queryGroups.data].map(({ id, name }) => ({ id, name }));

      Logger.debug(`Assigning roles ${rolesToAdd.map((role) => role.name).join(', ')}`, addMailcowSyncRoles.name);
      const response = await keycloakClient.post(
        `/users/${serviceAccountUserId}/role-mappings/clients/${realmMgmtClientId}`,
        rolesToAdd,
      );

      Logger.log(`Roles added successfully: Status ${response.status}`, addMailcowSyncRoles.name);
    } catch (error) {
      Logger.error(error.message, addMailcowSyncRoles.name);
    }
  },
};

export default addMailcowSyncRoles;
