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

import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import type { BatchPeersRequest, BatchPeersResult, Peer, PeerConfig } from '@libs/wireguard/types/wireguard';
import WIREGUARD_ERROR_MESSAGES from '@libs/wireguard/constants/wireguardErrorMessages';
import WireguardController from './wireguard.controller';
import WireguardService from './wireguard.service';
import CustomHttpException from '../common/CustomHttpException';
import AdminGuard from '../common/guards/admin.guard';
import GlobalSettingsService from '../global-settings/global-settings.service';

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
  data: '[Interface]\nPrivateKey = mock-private-key\nAddress = 10.0.0.2/32',
};

const mockWireguardService = {
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

describe(WireguardController.name, () => {
  let controller: WireguardController;
  let service: typeof mockWireguardService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WireguardController],
      providers: [
        { provide: WireguardService, useValue: mockWireguardService },
        AdminGuard,
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
      ],
    }).compile();

    controller = module.get<WireguardController>(WireguardController);
    service = mockWireguardService;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserPeer', () => {
    it('should extract and return the peer for the authenticated user from all peers', async () => {
      service.getPeers.mockResolvedValueOnce(mockPeers);

      const result = await controller.getUserPeer('testuser');

      expect(result).toEqual(mockPeer);
      expect(result.name).toBe('testuser');
    });

    it('should throw NOT_FOUND with correct error message when user has no peer', async () => {
      service.getPeers.mockResolvedValue(mockPeers);

      try {
        await controller.getUserPeer('nonexistent');
        fail('Expected to throw CustomHttpException');
      } catch (error) {
        expect(error).toBeInstanceOf(CustomHttpException);
        expect((error as CustomHttpException).getStatus()).toBe(HttpStatus.NOT_FOUND);
        expect((error as CustomHttpException).message).toBe(WIREGUARD_ERROR_MESSAGES.USER_PEER_NOT_FOUND);
      }
    });
  });

  describe('getUserPeerQR', () => {
    it('should set Content-Type to image/png and send buffer to response', async () => {
      const mockBuffer = Buffer.from('mock-qr-png-data');
      service.getPeerQR.mockResolvedValueOnce(mockBuffer);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.getUserPeerQR('testuser', mockResponse);

      expect(service.getPeerQR).toHaveBeenCalledWith('testuser');
      expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('getUserPeerStatus', () => {
    it('should return false when peer is not connected', async () => {
      service.getPeerStatus.mockResolvedValueOnce(false);

      const result = await controller.getUserPeerStatus('testuser');

      expect(result).toBe(false);
      expect(service.getPeerStatus).toHaveBeenCalledWith('testuser');
    });
  });

  describe('getPeerQR (Admin)', () => {
    it('should set Content-Type to image/png and send buffer for admin request', async () => {
      const mockBuffer = Buffer.from('admin-qr-png-data');
      service.getPeerQR.mockResolvedValueOnce(mockBuffer);

      const mockResponse = {
        set: jest.fn(),
        send: jest.fn(),
      } as unknown as Response;

      await controller.getPeerQR('anyuser', mockResponse);

      expect(service.getPeerQR).toHaveBeenCalledWith('anyuser');
      expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'image/png');
      expect(mockResponse.send).toHaveBeenCalledWith(mockBuffer);
    });
  });

  describe('createPeersBatch', () => {
    it('should pass batch request to service and return result with success/failure counts', async () => {
      const batchRequest: BatchPeersRequest = {
        attendees: [{ username: 'user1' }, { username: 'user2' }],
        groups: [{ path: '/school/class1' }, { path: '/school/class2' }],
        routes: ['10.0.0.0/8'],
      };
      const batchResult: BatchPeersResult = {
        successful: 15,
        failed: 2,
        errors: ['existinguser: Peer already exists', 'invaliduser: Invalid username'],
      };
      service.createPeersBatch.mockResolvedValueOnce(batchResult);

      const result = await controller.createPeersBatch(batchRequest);

      expect(result).toEqual(batchResult);
      expect(result.successful).toBe(15);
      expect(result.failed).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(service.createPeersBatch).toHaveBeenCalledWith(batchRequest);
    });
  });

  describe('Service delegation', () => {
    it('should delegate getPeers to service', async () => {
      service.getPeers.mockResolvedValueOnce(mockPeers);

      const result = await controller.getPeers();

      expect(result).toEqual(mockPeers);
    });

    it('should delegate createPeer to service with correct parameters', async () => {
      const peerRequest = { name: 'newuser', routes: ['192.168.0.0/16'] };
      service.createPeer.mockResolvedValueOnce(true);

      await controller.createPeer(peerRequest);

      expect(service.createPeer).toHaveBeenCalledWith(peerRequest);
    });

    it('should delegate deletePeer to service with peer name', async () => {
      service.deletePeer.mockResolvedValueOnce(true);

      await controller.deletePeer('userToDelete');

      expect(service.deletePeer).toHaveBeenCalledWith('userToDelete');
    });

    it('should delegate getUserPeerConfig to service with username', async () => {
      service.getPeerConfig.mockResolvedValueOnce(mockPeerConfig);

      await controller.getUserPeerConfig('currentUser');

      expect(service.getPeerConfig).toHaveBeenCalledWith('currentUser');
    });

    it('should delegate site operations to service', async () => {
      const siteRequest = { name: 'new-site', allowed_ips: ['10.0.0.0/8'] };
      service.createSite.mockResolvedValueOnce(true);
      service.deleteSite.mockResolvedValueOnce(true);

      await controller.createSite(siteRequest);
      await controller.deleteSite('old-site');

      expect(service.createSite).toHaveBeenCalledWith(siteRequest);
      expect(service.deleteSite).toHaveBeenCalledWith('old-site');
    });
  });
});
