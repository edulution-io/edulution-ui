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

const { KEYCLOAK_ADMIN, KEYCLOAK_ADMIN_PASSWORD, KEYCLOAK_EDU_UI_CLIENT_ID } = process.env as Record<string, string>;

const patchEduUiClient: Scripts = {
  name: '002-patchEduUiClient',
  version: 1,
  execute: async () => {
    if (!KEYCLOAK_ADMIN || !KEYCLOAK_ADMIN_PASSWORD) {
      Logger.error(
        'KEYCLOAK_ADMIN and KEYCLOAK_ADMIN_PASSWORD environment variables must be set.',
        patchEduUiClient.name,
      );
      return;
    }

    try {
      Logger.debug('Fetching Keycloak access token...', patchEduUiClient.name);
      const keycloakAccessToken = await getKeycloakToken();
      const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

      Logger.debug('Get client UUID...', patchEduUiClient.name);
      const eduUiClient = await keycloakClient.get('/clients', { params: { clientId: KEYCLOAK_EDU_UI_CLIENT_ID } });
      const eduUiClientData = eduUiClient.data[0];
      const { id: eduUiClientId } = eduUiClientData;
      Logger.debug(`Client UUID: ${eduUiClientId}`, patchEduUiClient.name);

      const newEduUiClientData = {
        ...eduUiClientData,
        publicClient: true,
        implicitFlowEnabled: false,
        serviceAccountsEnabled: false,
        attributes: {
          ...eduUiClientData.attributes,
          'oauth2.device.authorization.grant.enabled': false,
        },
      };

      Logger.debug('Patching edu-ui client...', patchEduUiClient.name);
      const response = await keycloakClient.put(`/clients/${eduUiClientId}`, newEduUiClientData);

      if (response.status === 204) {
        Logger.log('Client patched successfully.', patchEduUiClient.name);
      }
    } catch (error) {
      Logger.error(error.message, patchEduUiClient.name);
    }
  },
};

export default patchEduUiClient;
