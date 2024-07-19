import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { GuacRequest, LmnVdiRequest } from '@libs/desktopdeployment/types';
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
    const response = await axios.post(`${process.env.GUACAMOLE_API_URL}/guacamole/api`);

    expect(response).toHaveProperty('authToken');
  });

  describe('getConnection', () => {
    it('should call getConnection with correct parameters', async () => {
      const body: GuacRequest = {
        dataSource: 'mysql',
        authToken: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await service.getConnection(body, username);
      expect(service.getConnection).toHaveBeenCalledWith(body, username);
    });
  });

  describe('createOrUpdateSession', () => {
    it('should call vdiService.createOrUpdateSession with correct parameters', async () => {
      const body: GuacRequest = {
        dataSource: 'mysql',
        authToken: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await service.createOrUpdateSession(body, username);
      expect(service.createOrUpdateSession).toHaveBeenCalledWith(body, username);
    });
  });

  describe('requestVdi', () => {
    it('should call vdiService.requestVdi with correct parameters', async () => {
      const body: LmnVdiRequest = {
        group: VirtualMachineOs.WIN10,
        user: 'testuser',
      };
      await service.requestVdi(body);
      expect(service.requestVdi).toHaveBeenCalledWith(body);
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
