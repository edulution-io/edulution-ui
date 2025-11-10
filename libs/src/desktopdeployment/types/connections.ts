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

// This DTO is based on a third-party object definition from apache/guacamole.
// Any modifications should be carefully reviewed to ensure compatibility with the source.
type ConnectionAttributes = {
  'guacd-encryption': string;
  'failover-only': string | null;
  weight: string | null;
  'max-connections': string;
  'guacd-hostname': string | null;
  'guacd-port': string | null;
  'max-connections-per-user': string;
};

type Connection = {
  name: string;
  identifier: string;
  parentIdentifier: string;
  protocol: string;
  attributes: ConnectionAttributes;
  activeConnections: number;
  lastActive: number;
};

type Connections = {
  [key: string]: Connection;
};

export default Connections;
