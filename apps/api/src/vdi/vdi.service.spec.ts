/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { GuacamoleDto, LmnVdiRequest } from '@libs/desktopdeployment/types';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import VdiService from './vdi.service';

const vdiServicesMock = {
  authenticateVdi: jest.fn().mockReturnValue({ dataSource: 'mysql', authToken: 'ABC123' }),
  getConnection: jest.fn(),
  createOrUpdateSession: jest.fn(),
  requestVdi: jest.fn(),
  getVirtualMachines: jest.fn(),
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
    expect(result).toEqual({ dataSource: 'mysql', authToken: 'ABC123' });
  });

  it('should return a successful response with the correct headers', async () => {
    const mockData = {
      dataSource: 'mysql',
      authToken: 'ABC123',
    };

    axios.post = jest.fn().mockResolvedValue(mockData);
    const response = await axios.post(`http://localhost:8081/guacamole/api`);

    expect(response).toHaveProperty('authToken');
  });

  describe('getConnection', () => {
    it('should call getConnection with correct parameters', async () => {
      const guacamoleDto: GuacamoleDto = {
        dataSource: 'mysql',
        authToken: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await service.getConnection(guacamoleDto, username);
      expect(service.getConnection).toHaveBeenCalledWith(guacamoleDto, username);
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
      await service.createOrUpdateSession(guacamoleDto, username);
      expect(service.createOrUpdateSession).toHaveBeenCalledWith(guacamoleDto, username);
    });
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

  afterEach(() => {
    jest.clearAllMocks();
  });
});
