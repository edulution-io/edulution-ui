import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import type VeyonAuthDto from '@libs/veyon/types/veyonAuth.dto';
import VeyonService from './veyon.service';
import UsersService from '../users/users.service';

jest.mock('axios');

describe('VeyonService', () => {
  let veyonService: VeyonService;
  let usersService: UsersService;
  let mockedAxios: jest.Mocked<typeof axios>;

  beforeEach(async () => {
    mockedAxios = axios as jest.Mocked<typeof axios>;

    mockedAxios.create.mockReturnValue(mockedAxios);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VeyonService,
        {
          provide: UsersService,
          useValue: {
            getPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    veyonService = module.get<VeyonService>(VeyonService);
    usersService = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(veyonService).toBeDefined();
  });

  describe('authenticate', () => {
    it('should call UsersService.getPassword and axios.post for each IP', async () => {
      const body: VeyonAuthDto = {
        ipList: ['192.168.1.1', '192.168.1.2'],
      };
      const username = 'testuser';
      const password = 'testpassword';
      const mockResponse = {
        data: {
          'connection-uid': '1234',
          validUntil: 1234567890,
        },
      };

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await veyonService.authenticate(body, username);

      expect(usersService.getPassword).toHaveBeenCalledWith(username);
      expect(mockedAxios.post).toHaveBeenCalledTimes(body.ipList.length);
      expect(result.successfulResponses).toEqual([
        { ip: '192.168.1.1', connectionUid: '1234', validUntil: 1234567890 },
        { ip: '192.168.1.2', connectionUid: '1234', validUntil: 1234567890 },
      ]);
    });

    it('should handle errors gracefully and log them', async () => {
      const body: VeyonAuthDto = {
        ipList: ['192.168.1.1', '192.168.1.2'],
      };
      const username = 'testuser';
      const password = 'testpassword';
      const mockError = new Error('Connection timeout');

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);
      mockedAxios.post.mockRejectedValue(mockError);

      const result = await veyonService.authenticate(body, username);
      const errorResult = [
        {
          error: 'Authentication failed for IP 192.168.1.1: Connection timeout',
          ip: '192.168.1.1',
        },
        {
          error: 'Authentication failed for IP 192.168.1.2: Connection timeout',
          ip: '192.168.1.2',
        },
      ];

      expect(usersService.getPassword).toHaveBeenCalledWith(username);
      expect(mockedAxios.post).toHaveBeenCalledTimes(body.ipList.length);
      expect(result.successfulResponses).toEqual(errorResult);
    });
  });
});
