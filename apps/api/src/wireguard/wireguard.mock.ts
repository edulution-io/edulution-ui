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

import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type { Peer, PeerConfig, Site, WireguardPeer } from '@libs/wireguard/types/wireguard';

export const mockPeer: Peer = {
  name: 'testuser',
  private_key: 'mock-private-key',
  public_key: 'mock-public-key',
  ip: '10.0.0.2',
  routes: ['0.0.0.0/0'],
};

export const mockPeers: Record<string, Peer> = {
  testuser: mockPeer,
  anotheruser: {
    name: 'anotheruser',
    private_key: 'another-private-key',
    public_key: 'another-public-key',
    ip: '10.0.0.3',
    routes: ['0.0.0.0/0'],
  },
};

export const mockPeerConfig: PeerConfig = {
  data: '[Interface]\nPrivateKey = mock-private-key\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = server-public-key\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0',
};

export const mockWireguardPeer: WireguardPeer = {
  name: 'testuser',
  peer: 'mock-public-key',
  endpoint: '192.168.1.100:51820',
  allowed_ips: '10.0.0.2/32',
  last_handshake: '2025-01-26T12:00:00Z',
  latest_handshake_difference: 30,
  transfer: { received: 1024, send: 2048 },
  status: 'connected',
};

export const mockSite: Site = {
  name: 'branch-office',
  private_key: 'site-private-key',
  public_key: 'site-public-key',
  ip: '10.0.1.1',
  routes: ['192.168.0.0/24'],
  type: 'site',
  allowed_ips: ['192.168.0.0/24'],
  endpoint: 'branch.example.com:51820',
};

export const mockSites: Record<string, Site> = {
  'branch-office': mockSite,
};

export const mockWireguardConfig: Partial<AppConfigDto> = {
  name: 'wireguard',
  options: {
    url: 'http://test-wireguard:8000/api/wireguard',
    apiKey: 'test-api-key',
  },
};

export const mockWireguardService = {
  getPeers: jest.fn(),
  createPeer: jest.fn(),
  deletePeer: jest.fn(),
  getPeerConfig: jest.fn(),
  getPeerQR: jest.fn(),
  getPeerQRBase64: jest.fn(),
  getPeerStatus: jest.fn(),
  getAllPeersStatus: jest.fn(),
  createPeersBatch: jest.fn(),
  restartWireGuard: jest.fn(),
  getSites: jest.fn(),
  createSite: jest.fn(),
  deleteSite: jest.fn(),
  getSiteConfig: jest.fn(),
};
