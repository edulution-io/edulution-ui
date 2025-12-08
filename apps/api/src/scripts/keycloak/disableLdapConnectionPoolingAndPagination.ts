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

const disableLdapConnectionPoolingAndPagination: Scripts = {
  name: '005-disableLdapConnectionPoolingAndPagination',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        disableLdapConnectionPoolingAndPagination.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', disableLdapConnectionPoolingAndPagination.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Fetching LDAP user storage components...', disableLdapConnectionPoolingAndPagination.name);
      const { data: components } = await keycloakClient.get<LdapComponent[]>('/components', {
        params: { type: keycloakUserStorageProvider },
      });

      const ldapComponents = components.filter((c) => c.providerId === LDAP_PROVIDER_ID);

      if (ldapComponents.length === 0) {
        Logger.warn('No LDAP user federation found; exiting.', disableLdapConnectionPoolingAndPagination.name);
        return;
      }

      Logger.debug(`Found ${ldapComponents.length} LDAP component(s)`, disableLdapConnectionPoolingAndPagination.name);

      let modificationsApplied = false;

      for (const ldapComponent of ldapComponents) {
        Logger.debug(
          `Processing LDAP component: ${ldapComponent.name} (${ldapComponent.id})`,
          disableLdapConnectionPoolingAndPagination.name,
        );

        const currentConnectionPooling = ldapComponent.config.connectionPooling?.[0] === 'false';
        const currentPagination = ldapComponent.config.pagination?.[0] === 'false';

        Logger.debug(
          `Current settings - Connection Pooling: ${currentConnectionPooling}, Pagination: ${currentPagination}`,
          disableLdapConnectionPoolingAndPagination.name,
        );

        if (currentConnectionPooling && currentPagination) {
          Logger.log(
            `Connection pooling and pagination already disabled for '${ldapComponent.name}'`,
            disableLdapConnectionPoolingAndPagination.name,
          );
          continue;
        }

        const updatedComponent = {
          ...ldapComponent,
          config: {
            ...ldapComponent.config,
            connectionPooling: ['false'],
            pagination: ['false'],
          },
        };

        Logger.debug(
          `Updating LDAP component to enable connection pooling and pagination...`,
          disableLdapConnectionPoolingAndPagination.name,
        );

        const response = await keycloakClient.put(`/components/${ldapComponent.id}`, updatedComponent);

        if (response.status === 204) {
          const changes: string[] = [];
          if (!currentConnectionPooling) changes.push('connection pooling');
          if (!currentPagination) changes.push('pagination');

          Logger.log(
            `Successfully disabled ${changes.join(' and ')} for '${ldapComponent.name}'`,
            disableLdapConnectionPoolingAndPagination.name,
          );
          modificationsApplied = true;
        }
      }

      if (modificationsApplied) {
        Logger.debug('Triggering full user sync...', disableLdapConnectionPoolingAndPagination.name);

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
                disableLdapConnectionPoolingAndPagination.name,
              );
            }
          } catch (syncError) {
            Logger.warn(
              `Failed to trigger sync for ${ldapComponent.name}: ${syncError.message}`,
              disableLdapConnectionPoolingAndPagination.name,
            );
          }
        }
      } else {
        Logger.log('No modifications needed, skipping sync.', disableLdapConnectionPoolingAndPagination.name);
      }
    } catch (error) {
      Logger.error(error.message, disableLdapConnectionPoolingAndPagination.name);
      if (error.response?.data) {
        Logger.error(
          `Response error: ${JSON.stringify(error.response.data)}`,
          disableLdapConnectionPoolingAndPagination.name,
        );
      }
    }
  },
};

export default disableLdapConnectionPoolingAndPagination;
