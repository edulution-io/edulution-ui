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
import SCHOOL_GROUPS_MAPPER_NAME from '@libs/ldapKeycloakSync/constants/schoolGroupsMapperName';
import GLOBAL_GROUPS_MAPPER_NAME from '@libs/ldapKeycloakSync/constants/globalGroupsMapperName';
import REQUIRED_GROUP_ATTRIBUTES from '@libs/ldapKeycloakSync/constants/requiredGroupAttributes';
import LDAP_PROVIDER_ID from '@libs/ldapKeycloakSync/constants/ldapProviderId';
import LDAP_STORAGE_MAPPER_TYPE from '@libs/ldapKeycloakSync/constants/ldapStorageMapperType';

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD } = process.env as Record<string, string>;

const GROUP_MAPPER_NAMES = [SCHOOL_GROUPS_MAPPER_NAME, GLOBAL_GROUPS_MAPPER_NAME];

const addLdapGroupMappers: Scripts = {
  name: '003-addLdapGroupMappers',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        addLdapGroupMappers.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', addLdapGroupMappers.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Fetching LDAP user storage components...', addLdapGroupMappers.name);
      const { data: components } = await keycloakClient.get<LdapComponent[]>('/components', {
        params: { type: keycloakUserStorageProvider },
      });

      const ldapComponents = components.filter((c) => c.providerId === LDAP_PROVIDER_ID);

      if (ldapComponents.length === 0) {
        Logger.warn('No LDAP user federation found; exiting.', addLdapGroupMappers.name);
        return;
      }

      Logger.debug(`Found ${ldapComponents.length} LDAP component(s)`, addLdapGroupMappers.name);

      let mappersModified = false;

      for (const ldapComponent of ldapComponents) {
        Logger.debug(
          `Processing LDAP component: ${ldapComponent.name} (${ldapComponent.id})`,
          addLdapGroupMappers.name,
        );

        const { data: mappers } = await keycloakClient.get<LdapMapper[]>('/components', {
          params: {
            parent: ldapComponent.id,
            type: LDAP_STORAGE_MAPPER_TYPE,
          },
        });

        Logger.debug(`Found ${mappers.length} existing mappers`, addLdapGroupMappers.name);

        for (const groupMapperName of GROUP_MAPPER_NAMES) {
          const groupMapper = mappers.find((m) => m.name === groupMapperName);

          if (groupMapper) {
            Logger.debug(`Found existing '${groupMapperName}' mapper`, addLdapGroupMappers.name);

            const currentMappedAttributes = groupMapper.config['mapped.group.attributes']?.[0] || '';
            const currentAttributesArray = currentMappedAttributes
              .split(',')
              .map((attr) => attr.trim())
              .filter((attr) => attr.length > 0);

            Logger.debug(`Current mapped attributes: ${currentAttributesArray.join(', ')}`, addLdapGroupMappers.name);

            const missingAttributes = REQUIRED_GROUP_ATTRIBUTES.filter(
              (attr) => !currentAttributesArray.includes(attr),
            );

            if (missingAttributes.length > 0) {
              Logger.debug(`Missing attributes: ${missingAttributes.join(', ')}`, addLdapGroupMappers.name);

              const updatedAttributesArray = [...currentAttributesArray, ...missingAttributes];
              const updatedAttributesString = updatedAttributesArray.join(',');

              const updatedMapper = {
                ...groupMapper,
                config: {
                  ...groupMapper.config,
                  'mapped.group.attributes': [updatedAttributesString],
                },
              };

              Logger.debug(`Updating mapper with attributes: ${updatedAttributesString}`, addLdapGroupMappers.name);

              const response = await keycloakClient.put(`/components/${groupMapper.id}`, updatedMapper);

              if (response.status === 204) {
                Logger.log(
                  `Successfully updated '${groupMapperName}' mapper with attributes: ${missingAttributes.join(', ')}`,
                  addLdapGroupMappers.name,
                );
                mappersModified = true;
              }
            } else {
              Logger.log(
                `All required attributes already present in '${groupMapperName}' mapper`,
                addLdapGroupMappers.name,
              );
            }
          } else {
            Logger.debug(`'${groupMapperName}' mapper not found, skipping creation`, addLdapGroupMappers.name);
          }
        }
      }

      if (mappersModified) {
        Logger.debug('Triggering full user sync...', addLdapGroupMappers.name);

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
                addLdapGroupMappers.name,
              );
            }
          } catch (syncError) {
            Logger.warn(
              `Failed to trigger sync for ${ldapComponent.name}: ${syncError.message}`,
              addLdapGroupMappers.name,
            );
          }
        }
      } else {
        Logger.log('No mappers modified, skipping sync.', addLdapGroupMappers.name);
      }
    } catch (error) {
      Logger.error(error.message, addLdapGroupMappers.name);
      if (error.response?.data) {
        Logger.error(`Response error: ${JSON.stringify(error.response.data)}`, addLdapGroupMappers.name);
      }
    }
  },
};

export default addLdapGroupMappers;
