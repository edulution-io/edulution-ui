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
import { GuacamoleDto, LmnVdiRequest } from '@libs/desktopdeployment/types';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import VdiController from './vdi.controller';
import VdiService from './vdi.service';

const mockVdiServices = {
  authenticateVdi: jest.fn(),
  getConnection: jest.fn(),
  createOrUpdateSession: jest.fn(),
  requestVdi: jest.fn(),
  getVirtualMachines: jest.fn(),
};

describe('VdiController', () => {
  let vdiController: VdiController;
  let vdiService: VdiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VdiController],
      providers: [
        {
          provide: VdiService,
          useValue: mockVdiServices,
        },
      ],
    }).compile();

    vdiController = module.get<VdiController>(VdiController);
    vdiService = module.get<VdiService>(VdiService);
  });

  it('should be defined', () => {
    expect(vdiController).toBeDefined();
  });

  describe('authVdi', () => {
    it('should call vdiService.authenticateVdi', async () => {
      await vdiController.authVdi();
      expect(vdiService.authenticateVdi).toHaveBeenCalled();
    });
  });

  describe('getConnection', () => {
    it('should call vdiService.getConnection with correct parameters', async () => {
      const guacamoleDto: GuacamoleDto = {
        dataSource: 'mysql',
        authToken: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await vdiController.getConnection(guacamoleDto, username);
      expect(vdiService.getConnection).toHaveBeenCalledWith(guacamoleDto, username);
    });
  });

  describe('createOrUpdateSession', () => {
    it('should call vdiService.createOrUpdateSession with correct parameters', async () => {
      const guacamoleDto: GuacamoleDto = {
        dataSource: 'mysql',
        authToken: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await vdiController.createOrUpdateSession(guacamoleDto, username);
      expect(vdiService.createOrUpdateSession).toHaveBeenCalledWith(guacamoleDto, username);
    });
  });

  describe('requestVdi', () => {
    it('should call vdiService.requestVdi with correct parameters', async () => {
      const lmnVdiRequest: LmnVdiRequest = {
        group: VirtualMachineOs.WIN10,
        user: 'testuser',
      };
      await vdiController.requestVdi(lmnVdiRequest);
      expect(vdiService.requestVdi).toHaveBeenCalledWith(lmnVdiRequest);
    });
  });

  describe('getVirtualMachines', () => {
    it('should call vdiService.getVirtualMachines', async () => {
      await vdiController.getVirtualMachines();
      expect(vdiService.getVirtualMachines).toHaveBeenCalled();
    });
  });
});
