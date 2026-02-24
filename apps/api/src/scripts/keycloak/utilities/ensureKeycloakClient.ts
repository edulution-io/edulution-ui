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
import getErrorMessage from '@libs/common/utils/getErrorMessage';
import getKeycloakToken from './getKeycloakToken';
import createKeycloakAxiosClient from './createKeycloakAxiosClient';

const ensureKeycloakClient = async (clientId: string, clientSecret: string): Promise<string> => {
  try {
    const keycloakAccessToken = await getKeycloakToken();
    const keycloakClient = createKeycloakAxiosClient(keycloakAccessToken);

    const existingClients = await keycloakClient.get<{ id: string }[]>('/clients', { params: { clientId } });
    if (existingClients.data.length > 0) {
      const internalId = existingClients.data[0].id;
      const secretResponse = await keycloakClient.get<{ value: string }>(`/clients/${internalId}/client-secret`);
      Logger.log(`Keycloak client '${clientId}' already exists; using existing secret.`, ensureKeycloakClient.name);
      return secretResponse.data.value;
    }

    await keycloakClient.post('/clients', {
      clientId,
      secret: clientSecret,
      enabled: true,
      protocol: 'openid-connect',
      publicClient: false,
      standardFlowEnabled: true,
      directAccessGrantsEnabled: true,
      serviceAccountsEnabled: true,
    });
    Logger.log(`Keycloak client '${clientId}' created successfully.`, ensureKeycloakClient.name);

    const createdClients = await keycloakClient.get<{ id: string }[]>('/clients', { params: { clientId } });
    const createdId = createdClients.data[0]?.id;
    if (!createdId) {
      throw new Error(`Keycloak client '${clientId}' was created but could not be found`);
    }
    const secretResponse = await keycloakClient.get<{ value: string }>(`/clients/${createdId}/client-secret`);
    return secretResponse.data.value;
  } catch (error) {
    Logger.error(
      `Failed to ensure Keycloak client '${clientId}': ${getErrorMessage(error)}`,
      ensureKeycloakClient.name,
    );
    throw error;
  }
};

export default ensureKeycloakClient;
