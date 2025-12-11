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
