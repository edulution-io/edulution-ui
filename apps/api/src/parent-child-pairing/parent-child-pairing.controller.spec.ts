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
import type JwtUser from '@libs/user/types/jwt/jwtUser';
import ParentChildPairingController from './parent-child-pairing.controller';
import ParentChildPairingService from './parent-child-pairing.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import AppConfigService from '../appconfig/appconfig.service';

describe(ParentChildPairingController.name, () => {
  let controller: ParentChildPairingController;
  let parentChildPairingService: Record<string, jest.Mock>;

  const mockUser = { preferred_username: 'parent1', school: 'school1' } as unknown as JwtUser;
  const mockGroups = ['/parents'];

  beforeEach(async () => {
    parentChildPairingService = {
      getOrCreateCode: jest.fn().mockResolvedValue({ code: 'ABC123' }),
      refreshCode: jest.fn().mockResolvedValue({ code: 'DEF456' }),
      createParentChildPairing: jest.fn().mockResolvedValue({ id: 'pairing-1' }),
      getEnrichedRelationships: jest.fn().mockResolvedValue([]),
      getAllParentChildPairings: jest.fn().mockResolvedValue([]),
      updateParentChildPairingStatus: jest.fn().mockResolvedValue({ id: 'pairing-1', status: 'approved' }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ParentChildPairingController],
      providers: [
        { provide: ParentChildPairingService, useValue: parentChildPairingService },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
        { provide: AppConfigService, useValue: { getAppConfigFromCache: jest.fn().mockResolvedValue(null) } },
      ],
    }).compile();

    controller = module.get<ParentChildPairingController>(ParentChildPairingController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getCode', () => {
    it('should delegate to parentChildPairingService.getOrCreateCode', async () => {
      await controller.getCode('parent1', mockGroups, mockUser);
      expect(parentChildPairingService.getOrCreateCode).toHaveBeenCalledWith('parent1', mockGroups, 'school1');
    });
  });

  describe('refreshCode', () => {
    it('should delegate to parentChildPairingService.refreshCode', async () => {
      await controller.refreshCode('parent1', mockGroups, mockUser);
      expect(parentChildPairingService.refreshCode).toHaveBeenCalledWith('parent1', mockGroups, 'school1');
    });
  });

  describe('createParentChildPairing', () => {
    it('should delegate to parentChildPairingService.createParentChildPairing', async () => {
      await controller.createParentChildPairing('parent1', mockGroups, mockUser, { code: 'ABC123' });
      expect(parentChildPairingService.createParentChildPairing).toHaveBeenCalledWith(
        'parent1',
        mockGroups,
        'school1',
        'ABC123',
      );
    });
  });

  describe('getEnrichedRelationships', () => {
    it('should delegate to parentChildPairingService.getEnrichedRelationships', async () => {
      await controller.getEnrichedRelationships('parent1', mockGroups, mockUser);
      expect(parentChildPairingService.getEnrichedRelationships).toHaveBeenCalledWith('parent1', mockGroups, 'school1');
    });
  });

  describe('getAllParentChildPairings', () => {
    it('should delegate to parentChildPairingService.getAllParentChildPairings', async () => {
      await controller.getAllParentChildPairings('pending' as never, 'school1');
      expect(parentChildPairingService.getAllParentChildPairings).toHaveBeenCalledWith('pending', 'school1');
    });

    it('should handle optional parameters', async () => {
      await controller.getAllParentChildPairings();
      expect(parentChildPairingService.getAllParentChildPairings).toHaveBeenCalledWith(undefined, undefined);
    });
  });

  describe('updateParentChildPairingStatus', () => {
    it('should delegate to parentChildPairingService.updateParentChildPairingStatus', async () => {
      await controller.updateParentChildPairingStatus(
        'pairing-1',
        { status: 'approved' } as never,
        'admin',
        'api-token',
      );
      expect(parentChildPairingService.updateParentChildPairingStatus).toHaveBeenCalledWith(
        'pairing-1',
        'approved',
        'admin',
        'api-token',
      );
    });
  });
});
