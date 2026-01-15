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

export interface Peer {
  name: string;
  private_key: string;
  public_key: string;
  ip: string;
  routes: string[];
}

export interface PeerRequest {
  name: string;
  routes?: string[];
}

export interface Site {
  name: string;
  private_key: string;
  public_key: string;
  ip: string;
  routes: string[];
  type: 'site';
  allowed_ips: string[];
  endpoint?: string;
}

export interface SiteRequest {
  name: string;
  allowed_ips: string[];
  endpoint?: string;
  routes?: string[];
}

export interface PeerStatus {
  peer: string;
  endpoint?: string;
  allowed_ips: string;
  last_handshake?: string;
  latest_handshake_difference?: number;
  transfer?: {
    received: number;
    send: number;
  };
  status: 'connected' | 'disconnected';
}

export interface PeerConfig {
  data: string;
}

export interface BatchPeersRequest {
  attendees: { username: string }[];
  groups: { path: string }[];
  routes?: string[];
}

export interface BatchPeersResult {
  successful: number;
  failed: number;
  errors: string[];
}
