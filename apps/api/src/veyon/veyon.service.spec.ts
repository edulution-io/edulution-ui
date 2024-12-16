import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
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
      const ip = '192.168.1.1';
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

      const result = await veyonService.authenticate(ip, username);

      expect(usersService.getPassword).toHaveBeenCalledWith(username);
      expect(result).toEqual({ ip: '192.168.1.1', connectionUid: '1234', validUntil: 1234567890 });
    });

    it('should handle errors gracefully and log them', async () => {
      const ip = '192.168.1.1';
      const username = 'testuser';
      const password = 'testpassword';
      const mockError = new Error('Connection timeout');

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);
      mockedAxios.post.mockRejectedValue(mockError);

      await expect(veyonService.authenticate(ip, username)).rejects.toThrow('An unexpected error occurred');

      expect(usersService.getPassword).toHaveBeenCalledWith(username);
    });
  });
});
