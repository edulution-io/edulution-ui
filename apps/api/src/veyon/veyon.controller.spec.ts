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
