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
      const [eduMailcowClient, realmMgmtClient, accountClient] = await Promise.all([
        keycloakClient.get('/clients', { params: { clientId: 'edu-mailcow-sync' } }),
        keycloakClient.get('/clients', { params: { clientId: 'realm-management' } }),
        keycloakClient.get('/clients', { params: { clientId: 'account' } }),
      ]);

      const eduMailcowClientData = eduMailcowClient.data[0];
      if (!eduMailcowClientData) {
        Logger.warn('No edu-mailcow-sync client found; exiting.', addMailcowSyncRoles.name);
        return;
      }
      const { id: eduMailcowClientId } = eduMailcowClientData;
      const realmMgmtClientData = realmMgmtClient.data[0];
      const { id: realmMgmtClientId } = realmMgmtClientData;
      const accountMgmtClientData = accountClient.data[0];
      const { id: accountMgmtClientId } = accountMgmtClientData;

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
      const [queryUsers, queryGroups, viewUsers, viewGroups] = await Promise.all([
        keycloakClient.get(`/clients/${realmMgmtClientId}/roles/query-users`),
        keycloakClient.get(`/clients/${realmMgmtClientId}/roles/query-groups`),
        keycloakClient.get(`/clients/${realmMgmtClientId}/roles/view-users`),
        keycloakClient.get(`/clients/${accountMgmtClientId}/roles/view-groups`),
      ]);
      const rolesToAdd = [queryUsers.data, queryGroups.data, viewUsers.data].map(({ id, name }) => ({ id, name }));

      Logger.debug(
        `Assigning realm mgmt roles ${rolesToAdd.map((role) => role.name).join(', ')}`,
        addMailcowSyncRoles.name,
      );
      const response = await keycloakClient.post(
        `/users/${serviceAccountUserId}/role-mappings/clients/${realmMgmtClientId}`,
        rolesToAdd,
      );

      Logger.debug(`Assigning account roles ${viewGroups.data.name}`, addMailcowSyncRoles.name);
      const responseAccount = await keycloakClient.post(
        `/users/${serviceAccountUserId}/role-mappings/clients/${accountMgmtClientId}`,
        [{ id: viewGroups.data.id, name: viewGroups.data.name }],
      );

      Logger.log(
        `Roles added successfully: Status ${response.status} and ${responseAccount.status} `,
        addMailcowSyncRoles.name,
      );
    } catch (error) {
      Logger.error(error.message, addMailcowSyncRoles.name);
    }
  },
};

export default addMailcowSyncRoles;
