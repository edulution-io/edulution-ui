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
import keycloakUserStorageProvider from '@libs/ldapKeycloakSync/constants/keycloakUserStorageProvider';
import LdapComponent from '@libs/ldapKeycloakSync/types/ldapComponent';
import LDAP_PROVIDER_ID from '@libs/ldapKeycloakSync/constants/ldapProviderId';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

const enableLdapConnectionPoolingAndPagination: Scripts = {
  name: '005-enableLdapConnectionPoolingAndPagination',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        enableLdapConnectionPoolingAndPagination.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', enableLdapConnectionPoolingAndPagination.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Fetching LDAP user storage components...', enableLdapConnectionPoolingAndPagination.name);
      const { data: components } = await keycloakClient.get<LdapComponent[]>('/components', {
        params: { type: keycloakUserStorageProvider },
      });

      const ldapComponents = components.filter((c) => c.providerId === LDAP_PROVIDER_ID);

      if (ldapComponents.length === 0) {
        Logger.warn('No LDAP user federation found; exiting.', enableLdapConnectionPoolingAndPagination.name);
        return;
      }

      Logger.debug(`Found ${ldapComponents.length} LDAP component(s)`, enableLdapConnectionPoolingAndPagination.name);

      let modificationsApplied = false;

      for (const ldapComponent of ldapComponents) {
        Logger.debug(
          `Processing LDAP component: ${ldapComponent.name} (${ldapComponent.id})`,
          enableLdapConnectionPoolingAndPagination.name,
        );

        const currentConnectionPooling = ldapComponent.config.connectionPooling?.[0] === 'true';
        const currentPagination = ldapComponent.config.pagination?.[0] === 'true';

        Logger.debug(
          `Current settings - Connection Pooling: ${currentConnectionPooling}, Pagination: ${currentPagination}`,
          enableLdapConnectionPoolingAndPagination.name,
        );

        if (currentConnectionPooling && currentPagination) {
          Logger.log(
            `Connection pooling and pagination already enabled for '${ldapComponent.name}'`,
            enableLdapConnectionPoolingAndPagination.name,
          );
          continue;
        }

        const updatedComponent = {
          ...ldapComponent,
          config: {
            ...ldapComponent.config,
            connectionPooling: ['true'],
            pagination: ['true'],
          },
        };

        Logger.debug(
          `Updating LDAP component to enable connection pooling and pagination...`,
          enableLdapConnectionPoolingAndPagination.name,
        );

        const response = await keycloakClient.put(`/components/${ldapComponent.id}`, updatedComponent);

        if (response.status === 204) {
          const changes: string[] = [];
          if (!currentConnectionPooling) changes.push('connection pooling');
          if (!currentPagination) changes.push('pagination');

          Logger.log(
            `Successfully enabled ${changes.join(' and ')} for '${ldapComponent.name}'`,
            enableLdapConnectionPoolingAndPagination.name,
          );
          modificationsApplied = true;
        }
      }

      if (modificationsApplied) {
        Logger.debug('Triggering full user sync...', enableLdapConnectionPoolingAndPagination.name);

        for (const ldapComponent of ldapComponents) {
          try {
            const syncResponse = await keycloakClient.post(
              `/user-storage/${ldapComponent.id}/sync`,
              {},
              {
                params: { action: 'triggerFullSync' },
              },
            );

            if (syncResponse.status === 200) {
              Logger.log(
                `Full sync triggered successfully for ${ldapComponent.name}. Result: ${JSON.stringify(syncResponse.data)}`,
                enableLdapConnectionPoolingAndPagination.name,
              );
            }
          } catch (syncError) {
            Logger.warn(
              `Failed to trigger sync for ${ldapComponent.name}: ${syncError.message}`,
              enableLdapConnectionPoolingAndPagination.name,
            );
          }
        }
      } else {
        Logger.log('No modifications needed, skipping sync.', enableLdapConnectionPoolingAndPagination.name);
      }
    } catch (error) {
      Logger.error(error.message, enableLdapConnectionPoolingAndPagination.name);
      if (error.response?.data) {
        Logger.error(
          `Response error: ${JSON.stringify(error.response.data)}`,
          enableLdapConnectionPoolingAndPagination.name,
        );
      }
    }
  },
};

export default enableLdapConnectionPoolingAndPagination;
