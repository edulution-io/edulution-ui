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
