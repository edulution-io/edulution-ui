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
import VeyonController from './veyon.controller';
import VeyonService from './veyon.service';

describe('VeyonController', () => {
  let veyonController: VeyonController;
  let veyonService: VeyonService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VeyonController],
      providers: [
        {
          provide: VeyonService,
          useValue: {
            authenticate: jest.fn(),
          },
        },
      ],
    }).compile();

    veyonController = module.get<VeyonController>(VeyonController);
    veyonService = module.get<VeyonService>(VeyonService);
  });

  it('should be defined', () => {
    expect(veyonController).toBeDefined();
  });

  describe('authentication', () => {
    it('should call VeyonService.authenticate with correct parameters', async () => {
      const ip = '192.168.1.1';
      const username = 'testuser';
      const body = { veyonUser: 'testuser' };
      const expectedResponse = {
        ip: '192.168.1.1',
        veyonUsername: 'testuser',
        connectionUid: '1234',
        validUntil: 1234567890,
      };
      jest.spyOn(veyonService, 'authenticate').mockResolvedValue(expectedResponse);

      const result = await veyonController.authentication(ip, username, body);

      expect(veyonService.authenticate).toHaveBeenCalledWith(ip, username, body.veyonUser);
      expect(result).toEqual(expectedResponse);
    });

    it('should handle errors thrown by VeyonService.authenticate', async () => {
      const ip = '192.168.1.1';
      const username = 'testuser';
      const body = { veyonUser: 'testuser' };
      const error = new Error('Authentication failed');
      jest.spyOn(veyonService, 'authenticate').mockRejectedValue(error);

      await expect(veyonController.authentication(ip, username, body)).rejects.toThrow('Authentication failed');
      expect(veyonService.authenticate).toHaveBeenCalledWith(ip, username, body.veyonUser);
    });
  });
});
