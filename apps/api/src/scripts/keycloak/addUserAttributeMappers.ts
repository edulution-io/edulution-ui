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
import LdapMapper from '@libs/ldapKeycloakSync/types/ldapMapper';
import REQUIRED_USER_ATTRIBUTES from '@libs/ldapKeycloakSync/constants/requiredUserAttributes';
import LDAP_PROVIDER_ID from '@libs/ldapKeycloakSync/constants/ldapProviderId';
import LDAP_STORAGE_MAPPER_TYPE from '@libs/ldapKeycloakSync/constants/ldapStorageMapperType';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

const addUserAttributeMappers: Scripts = {
  name: '004-addUserAttributeMappers',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        addUserAttributeMappers.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', addUserAttributeMappers.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Fetching LDAP user storage components...', addUserAttributeMappers.name);
      const { data: components } = await keycloakClient.get<LdapComponent[]>('/components', {
        params: { type: keycloakUserStorageProvider },
      });

      const ldapComponents = components.filter((c) => c.providerId === LDAP_PROVIDER_ID);

      if (ldapComponents.length === 0) {
        Logger.warn('No LDAP user federation found; exiting.', addUserAttributeMappers.name);
        return;
      }

      Logger.debug(`Found ${ldapComponents.length} LDAP component(s)`, addUserAttributeMappers.name);

      let mappersAdded = false;

      for (const ldapComponent of ldapComponents) {
        Logger.debug(
          `Processing LDAP component: ${ldapComponent.name} (${ldapComponent.id})`,
          addUserAttributeMappers.name,
        );

        const { data: mappers } = await keycloakClient.get<LdapMapper[]>('/components', {
          params: {
            parent: ldapComponent.id,
            type: LDAP_STORAGE_MAPPER_TYPE,
          },
        });

        Logger.debug(`Found ${mappers.length} existing mappers`, addUserAttributeMappers.name);

        const existingMapperNames = new Set(mappers.map((m) => m.name.toLowerCase()));

        for (const userAttribute of REQUIRED_USER_ATTRIBUTES) {
          if (existingMapperNames.has(userAttribute.toLowerCase())) {
            Logger.debug(`Mapper for '${userAttribute}' already exists, skipping`, addUserAttributeMappers.name);
            continue;
          }

          Logger.debug(`Creating mapper for '${userAttribute}'...`, addUserAttributeMappers.name);

          const mapperConfig = {
            name: userAttribute,
            providerId: 'user-attribute-ldap-mapper',
            providerType: LDAP_STORAGE_MAPPER_TYPE,
            parentId: ldapComponent.id,
            config: {
              'ldap.attribute': [userAttribute],
              'attribute.force.default': ['false'],
              'is.mandatory.in.ldap': ['false'],
              'is.binary.attribute': ['false'],
              'read.only': ['true'],
              'always.read.value.from.ldap': ['false'],
              'user.model.attribute': [userAttribute],
            },
          };

          const response = await keycloakClient.post('/components', mapperConfig);

          if (response.status === 201) {
            Logger.log(`Successfully created mapper for '${userAttribute}'`, addUserAttributeMappers.name);
            mappersAdded = true;
          }
        }
      }

      if (mappersAdded) {
        Logger.debug('Triggering full user sync...', addUserAttributeMappers.name);

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
                addUserAttributeMappers.name,
              );
            }
          } catch (syncError) {
            Logger.warn(
              `Failed to trigger sync for ${ldapComponent.name}: ${syncError.message}`,
              addUserAttributeMappers.name,
            );
          }
        }
      } else {
        Logger.log('No new mappers added, skipping sync.', addUserAttributeMappers.name);
      }
    } catch (error) {
      Logger.error(error.message, addUserAttributeMappers.name);
      if (error.response?.data) {
        Logger.error(`Response error: ${JSON.stringify(error.response.data)}`, addUserAttributeMappers.name);
      }
    }
  },
};

export default addUserAttributeMappers;
