import { Test, TestingModule } from '@nestjs/testing';
import { GuacRequest, LmnVdiRequest } from '@libs/desktopdeployment/types';
import VirtualMachineOs from '@libs/desktopdeployment/types/virtual-machines.enum';
import VdiController from './vdi.controller';
import VdiService from './vdi.service';

const mockVdiServices = {
  authenticateVdi: jest.fn(),
  getConnections: jest.fn(),
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

  describe('getConnections', () => {
    it('should call vdiService.getConnections with correct parameters', async () => {
      const body: GuacRequest = {
        id: 1,
        dataSource: 'mysql',
        token: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await vdiController.getConnections(body, username);
      expect(vdiService.getConnections).toHaveBeenCalledWith(body, username);
    });
  });

  describe('createOrUpdateSession', () => {
    it('should call vdiService.createOrUpdateSession with correct parameters', async () => {
      const body: GuacRequest = {
        id: 1,
        dataSource: 'mysql',
        token: 'ABC123',
        hostname: '10.0.0.1',
      };
      const username = 'testuser';
      await vdiController.createOrUpdateSession(body, username);
      expect(vdiService.createOrUpdateSession).toHaveBeenCalledWith(body, username);
    });
  });

  describe('requestVdi', () => {
    it('should call vdiService.requestVdi with correct parameters', async () => {
      const body: LmnVdiRequest = {
        group: VirtualMachineOs.WIN10,
        user: 'testuser',
      };
      await vdiController.requestVdi(body);
      expect(vdiService.requestVdi).toHaveBeenCalledWith(body);
    });
  });

  describe('getVirtualMachines', () => {
    it('should call vdiService.getVirtualMachines', async () => {
      await vdiController.getVirtualMachines();
      expect(vdiService.getVirtualMachines).toHaveBeenCalled();
    });
  });
});
