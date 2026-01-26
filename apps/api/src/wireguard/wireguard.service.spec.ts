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

/* eslint-disable @typescript-eslint/dot-notation */
import { Test, TestingModule } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';
import type AppConfigDto from '@libs/appconfig/types/appConfigDto';
import type { BatchPeersRequest, Peer, PeerConfig, Site, WireguardPeer } from '@libs/wireguard/types/wireguard';
import WIREGUARD_ERROR_MESSAGES from '@libs/wireguard/constants/wireguardErrorMessages';
import WireguardService from './wireguard.service';
import GroupsService from '../groups/groups.service';
import AppConfigService from '../appconfig/appconfig.service';

const mockPeer: Peer = {
  name: 'testuser',
  private_key: 'mock-private-key',
  public_key: 'mock-public-key',
  ip: '10.0.0.2',
  routes: ['0.0.0.0/0'],
};

const mockPeers: Record<string, Peer> = {
  testuser: mockPeer,
  anotheruser: {
    name: 'anotheruser',
    private_key: 'another-private-key',
    public_key: 'another-public-key',
    ip: '10.0.0.3',
    routes: ['0.0.0.0/0'],
  },
};

const mockPeerConfig: PeerConfig = {
  data: '[Interface]\nPrivateKey = mock-private-key\nAddress = 10.0.0.2/32\n\n[Peer]\nPublicKey = server-public-key\nEndpoint = vpn.example.com:51820\nAllowedIPs = 0.0.0.0/0',
};

const mockWireguardPeer: WireguardPeer = {
  name: 'testuser',
  peer: 'mock-public-key',
  endpoint: '192.168.1.100:51820',
  allowed_ips: '10.0.0.2/32',
  last_handshake: '2025-01-26T12:00:00Z',
  latest_handshake_difference: 30,
  transfer: { received: 1024, send: 2048 },
  status: 'connected',
};

const mockSite: Site = {
  name: 'branch-office',
  private_key: 'site-private-key',
  public_key: 'site-public-key',
  ip: '10.0.1.1',
  routes: ['192.168.0.0/24'],
  type: 'site',
  allowed_ips: ['192.168.0.0/24'],
  endpoint: 'branch.example.com:51820',
};

const mockSites: Record<string, Site> = {
  'branch-office': mockSite,
};

const mockWireguardConfig: Partial<AppConfigDto> = {
  name: 'wireguard',
  options: {
    url: 'http://test-wireguard:8000/api/wireguard',
    apiKey: 'test-api-key',
  },
};

jest.mock('axios');

const mockedAxios = axios as jest.Mocked<typeof axios>;

const mockAxiosInstance = {
  defaults: { baseURL: 'http://test-wireguard:8000/api/wireguard' },
  get: jest.fn(),
  post: jest.fn(),
  delete: jest.fn(),
} as unknown as AxiosInstance;

mockedAxios.create.mockReturnValue(mockAxiosInstance);

describe(WireguardService.name, () => {
  let service: WireguardService;
  let groupsService: GroupsService;
  let appConfigService: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WireguardService,
        {
          provide: GroupsService,
          useValue: {
            getInvitedMembers: jest.fn(),
          },
        },
        {
          provide: AppConfigService,
          useValue: {
            getAppConfigByName: jest.fn(),
            patchSingleFieldInConfig: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<WireguardService>(WireguardService);
    groupsService = module.get<GroupsService>(GroupsService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Peer CRUD Operations', () => {
    it('should fetch all peers with correct API endpoint', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockPeers });

      const result = await service.getPeers();

      expect(result).toEqual(mockPeers);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/peers');
    });

    it('should create a peer with correct request body', async () => {
      const peerRequest = { name: 'newuser', routes: ['10.0.0.0/8'] };
      (service['wireguardApi'].post as jest.Mock).mockResolvedValueOnce({ data: true });

      const result = await service.createPeer(peerRequest);

      expect(result).toBe(true);
      expect(service['wireguardApi'].post).toHaveBeenCalledWith('/peers', peerRequest);
    });

    it('should delete a peer with correct URL parameter', async () => {
      (service['wireguardApi'].delete as jest.Mock).mockResolvedValueOnce({ data: true });

      const result = await service.deletePeer('testuser');

      expect(result).toBe(true);
      expect(service['wireguardApi'].delete).toHaveBeenCalledWith('/peers/testuser');
    });

    it('should fetch peer configuration', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockPeerConfig });

      const result = await service.getPeerConfig('testuser');

      expect(result).toEqual(mockPeerConfig);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/peers/testuser/config');
    });
  });

  describe('QR Code Generation', () => {
    it('should return QR code as Buffer with arraybuffer response type', async () => {
      const mockArrayBuffer = new ArrayBuffer(100);
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockArrayBuffer });

      const result = await service.getPeerQR('testuser');

      expect(result).toBeInstanceOf(Buffer);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/peers/testuser/qr', { responseType: 'arraybuffer' });
    });

    it('should return QR code as base64 string', async () => {
      const mockBase64 =
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockBase64 });

      const result = await service.getPeerQRBase64('testuser');

      expect(result).toBe(mockBase64);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/peers/testuser/qr/b64');
    });
  });

  describe('Peer Status', () => {
    it('should return peer status with connection details when connected', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockWireguardPeer });

      const result = await service.getPeerStatus('testuser');

      expect(result).toEqual(mockWireguardPeer);
      expect((result as WireguardPeer).status).toBe('connected');
      expect((result as WireguardPeer).transfer).toBeDefined();
    });

    it('should return false when peer is not connected or does not exist', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: false });

      const result = await service.getPeerStatus('offlineuser');

      expect(result).toBe(false);
    });

    it('should return status of all peers', async () => {
      const mockAllStatus: Record<string, WireguardPeer> = {
        testuser: mockWireguardPeer,
        anotheruser: { ...mockWireguardPeer, name: 'anotheruser', status: 'disconnected' },
      };
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockAllStatus });

      const result = await service.getAllPeersStatus();

      expect(Object.keys(result)).toHaveLength(2);
      expect(result['testuser'].status).toBe('connected');
      expect(result['anotheruser'].status).toBe('disconnected');
    });
  });

  describe('Site Operations', () => {
    it('should fetch all sites', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: mockSites });

      const result = await service.getSites();

      expect(result).toEqual(mockSites);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/sites');
    });

    it('should create a site with all parameters', async () => {
      const siteRequest = {
        name: 'new-site',
        allowed_ips: ['192.168.10.0/24'],
        endpoint: 'site.example.com:51820',
        routes: ['192.168.10.0/24'],
      };
      (service['wireguardApi'].post as jest.Mock).mockResolvedValueOnce({ data: true });

      const result = await service.createSite(siteRequest);

      expect(result).toBe(true);
      expect(service['wireguardApi'].post).toHaveBeenCalledWith('/sites', siteRequest);
    });

    it('should delete a site', async () => {
      (service['wireguardApi'].delete as jest.Mock).mockResolvedValueOnce({ data: true });

      await service.deleteSite('branch-office');

      expect(service['wireguardApi'].delete).toHaveBeenCalledWith('/sites/branch-office');
    });

    it('should fetch site configuration', async () => {
      const siteConfig: PeerConfig = { data: '[Interface]\nPrivateKey = site-private-key\n...' };
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: siteConfig });

      const result = await service.getSiteConfig('branch-office');

      expect(result).toEqual(siteConfig);
    });
  });

  describe('Batch Peer Creation', () => {
    const batchRequest: BatchPeersRequest = {
      attendees: [{ username: 'user1' }, { username: 'user2' }],
      groups: [{ path: '/school/class1' }],
      routes: ['10.0.0.0/8'],
    };

    it('should create peers for all unique usernames from groups and attendees', async () => {
      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce(['user1', 'user2', 'user3']);

      (service['wireguardApi'].post as jest.Mock)
        .mockResolvedValueOnce({ data: true })
        .mockResolvedValueOnce({ data: true })
        .mockResolvedValueOnce({ data: true });

      const result = await service.createPeersBatch(batchRequest);

      expect(result.successful).toBe(3);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(groupsService.getInvitedMembers).toHaveBeenCalledWith(batchRequest.groups, [
        { username: 'user1' },
        { username: 'user2' },
      ]);
    });

    it('should deduplicate usernames before creating peers', async () => {
      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce(['user1', 'user1', 'user2', 'user2']);

      (service['wireguardApi'].post as jest.Mock)
        .mockResolvedValueOnce({ data: true })
        .mockResolvedValueOnce({ data: true });

      const result = await service.createPeersBatch(batchRequest);

      expect(result.successful).toBe(2);
      expect(service['wireguardApi'].post).toHaveBeenCalledTimes(2);
    });

    it('should use default route 0.0.0.0/0 when routes not provided', async () => {
      const requestWithoutRoutes: BatchPeersRequest = {
        attendees: [{ username: 'user1' }],
        groups: [],
      };

      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce(['user1']);
      (service['wireguardApi'].post as jest.Mock).mockResolvedValueOnce({ data: true });

      await service.createPeersBatch(requestWithoutRoutes);

      expect(service['wireguardApi'].post).toHaveBeenCalledWith('/peers', {
        name: 'user1',
        routes: ['0.0.0.0/0'],
      });
    });

    it('should track partial failures with detailed error messages', async () => {
      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce(['user1', 'user2', 'user3']);

      (service['wireguardApi'].post as jest.Mock)
        .mockResolvedValueOnce({ data: true })
        .mockRejectedValueOnce(new Error('Peer already exists'))
        .mockResolvedValueOnce({ data: true });

      const result = await service.createPeersBatch(batchRequest);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('user2');
      expect(result.errors[0]).toContain('Peer already exists');
    });

    it('should handle complete batch failure gracefully', async () => {
      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce(['user1', 'user2']);

      (service['wireguardApi'].post as jest.Mock)
        .mockRejectedValueOnce(new Error('Error 1'))
        .mockRejectedValueOnce(new Error('Error 2'));

      const result = await service.createPeersBatch(batchRequest);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
    });

    it('should return empty result when no users to create', async () => {
      jest.spyOn(groupsService, 'getInvitedMembers').mockResolvedValueOnce([]);

      const result = await service.createPeersBatch(batchRequest);

      expect(result.successful).toBe(0);
      expect(result.failed).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(service['wireguardApi'].post).not.toHaveBeenCalled();
    });
  });

  describe('WireGuard Service Management', () => {
    it('should restart wireguard service', async () => {
      (service['wireguardApi'].get as jest.Mock).mockResolvedValueOnce({ data: true });

      const result = await service.restartWireGuard();

      expect(result).toBe(true);
      expect(service['wireguardApi'].get).toHaveBeenCalledWith('/restart');
    });
  });

  describe('Error Handling', () => {
    it('should throw CustomHttpException with correct error message when API calls fail', async () => {
      (service['wireguardApi'].get as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      await expect(service.getPeers()).rejects.toThrow(HttpException);
      await expect(service.getPeers()).rejects.toMatchObject({
        message: WIREGUARD_ERROR_MESSAGES.GET_PEERS_FAILED,
      });
    });

    it('should include specific error messages for different operations', async () => {
      (service['wireguardApi'].post as jest.Mock).mockRejectedValue(new Error('API error'));
      (service['wireguardApi'].delete as jest.Mock).mockRejectedValue(new Error('API error'));

      await expect(service.createPeer({ name: 'test' })).rejects.toMatchObject({
        message: WIREGUARD_ERROR_MESSAGES.CREATE_PEER_FAILED,
      });

      await expect(service.deletePeer('test')).rejects.toMatchObject({
        message: WIREGUARD_ERROR_MESSAGES.DELETE_PEER_FAILED,
      });

      await expect(service.createSite({ name: 'test', allowed_ips: [] })).rejects.toMatchObject({
        message: WIREGUARD_ERROR_MESSAGES.CREATE_SITE_FAILED,
      });
    });
  });

  describe('Configuration Initialization', () => {
    it('should load API configuration from AppConfigService on module init', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(mockWireguardConfig as AppConfigDto);

      await service.onModuleInit();

      expect(appConfigService.getAppConfigByName).toHaveBeenCalledWith('wireguard');
    });

    it('should handle missing wireguard config gracefully', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValueOnce(undefined);

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });

    it('should handle database errors during config initialization', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockRejectedValueOnce(new Error('DB error'));

      await expect(service.onModuleInit()).resolves.not.toThrow();
    });

    it('should reinitialize API on config update event', async () => {
      jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValue(mockWireguardConfig as AppConfigDto);
      jest.spyOn(appConfigService, 'patchSingleFieldInConfig').mockResolvedValue([]);

      await service.handleWireguardConfigUpdate();

      expect(appConfigService.getAppConfigByName).toHaveBeenCalled();
    });
  });
});
