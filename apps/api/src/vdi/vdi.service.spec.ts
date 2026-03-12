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
import { LmnVdiRequest } from '@libs/desktopdeployment/types';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import VdiService from './vdi.service';

const vdiServicesMock = {
  authenticateVdi: jest.fn().mockReturnValue({ dataSource: 'quickconnect', authToken: 'ABC123' }),
  requestVdi: jest.fn(),
  getVirtualMachines: jest.fn(),
  createSSHSession: jest.fn().mockReturnValue({
    authToken: 'ABC123',
    dataSource: 'quickconnect',
    connectionUri: '1',
  }),
  createRDPSession: jest.fn().mockReturnValue({
    authToken: 'ABC123',
    dataSource: 'quickconnect',
    connectionUri: '2',
  }),
};

describe('VdiService', () => {
  let service: VdiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [{ provide: VdiService, useValue: vdiServicesMock }],
    }).compile();

    service = module.get<VdiService>(VdiService);
  });

  it('should authenticate VDI successfully', async () => {
    const result = await service.authenticateVdi();
    expect(service.authenticateVdi).toHaveBeenCalledWith();
    expect(result).toEqual({ dataSource: 'quickconnect', authToken: 'ABC123' });
  });

  describe('requestVdi', () => {
    it('should call vdiService.requestVdi with correct parameters', async () => {
      const lmnVdiRequest: LmnVdiRequest = {
        group: VirtualMachineOs.WIN10,
        user: 'testuser',
      };
      await service.requestVdi(lmnVdiRequest);
      expect(service.requestVdi).toHaveBeenCalledWith(lmnVdiRequest);
    });
  });

  describe('getVirtualMachines', () => {
    it('should call vdiService.getVirtualMachines', async () => {
      await service.getVirtualMachines();
      expect(service.getVirtualMachines).toHaveBeenCalled();
    });
  });

  describe('createSSHSession', () => {
    it('should create SSH session via QuickConnect', async () => {
      const sshSessionDto = { username: 'testuser', password: 'testpass' };
      const result = await service.createSSHSession(sshSessionDto);
      expect(service.createSSHSession).toHaveBeenCalledWith(sshSessionDto);
      expect(result).toEqual({
        authToken: 'ABC123',
        dataSource: 'quickconnect',
        connectionUri: '1',
      });
    });
  });

  describe('createRDPSession', () => {
    it('should create RDP session via QuickConnect', async () => {
      const username = 'testuser';
      const hostname = '10.0.0.1';
      const result = await service.createRDPSession(username, hostname);
      expect(service.createRDPSession).toHaveBeenCalledWith(username, hostname);
      expect(result).toEqual({
        authToken: 'ABC123',
        dataSource: 'quickconnect',
        connectionUri: '2',
      });
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
