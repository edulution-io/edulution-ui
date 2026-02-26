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

import { Client, Status } from '@glokon/guacamole-common-js';

export const guacamoleClientStateMap: Record<number, string> = Object.fromEntries(
  Object.entries(Client.State)
    .filter(([_key, value]) => typeof value === 'number')
    .map(([key, value]) => [value, key]),
);

export const getGuacamoleErrorMessage = (status: Status): string => {
  const message = status.message ?? '';
  const messageLower = message.toLowerCase();

  const errorMessages: Record<number, string> = {
    512: message || 'Server error occurred',
    513: 'Server is busy. Please try again later.',
    514: 'Connection timed out. The remote server is not responding.',
    515: 'Upstream connection timed out. Check if the target is reachable.',
    516:
      messageLower.includes('ssl') || messageLower.includes('certificate')
        ? `SSL/TLS connection failed. ${message}`
        : message || 'Upstream connection error',
    517: 'Connection resource not found',
    518: 'Resource conflict - connection may already be in use',
    519: 'Connection was closed by the server',
    520: 'Remote server not found. Check the hostname and port.',
    521: 'Remote server is unavailable. Connection refused.',
    768: 'Invalid connection request',
    769: 'Authentication failed. Check your credentials.',
    771: 'Access forbidden. You may not have permission to connect.',
    776: 'Client connection timed out',
  };
  return errorMessages[status.code] || message || `Connection error (code: ${status.code})`;
};
