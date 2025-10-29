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
