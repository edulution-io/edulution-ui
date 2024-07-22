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
