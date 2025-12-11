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
