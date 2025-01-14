import { Test, TestingModule } from '@nestjs/testing';
import { Response } from 'express';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import GroupForm from '@libs/groups/types/groupForm';
import { LmnApiController } from './lmnApi.controller';
import LmnApiService from './lmnApi.service';
import mockLmnApiService from './lmnApi.serice.mock';

describe('LmnApiController', () => {
  let controller: LmnApiController;
  let service: LmnApiService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LmnApiController],
      providers: [{ provide: LmnApiService, useValue: mockLmnApiService }],
    }).compile();

    controller = module.get<LmnApiController>(LmnApiController);
    service = module.get<LmnApiService>(LmnApiService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('printPasswords', () => {
    it('should call printPasswords and send response', async () => {
      const mockResponse = { headers: { 'content-disposition': 'attachment' }, data: new ArrayBuffer(8) };
      mockLmnApiService.printPasswords.mockResolvedValue(mockResponse);
      const res = { setHeader: jest.fn(), send: jest.fn() } as unknown as Response;

      await controller.printPasswords('mockToken', { options: {} as PrintPasswordsRequest }, res);

      expect(service.printPasswords).toHaveBeenCalledWith('mockToken', {});
      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'application/pdf');
      expect(res.send).toHaveBeenCalledWith(expect.any(Buffer));
    });
  });

  describe('startExamMode', () => {
    it('should call startExamMode when state is start', async () => {
      await controller.startExamMode({ state: 'start' }, 'mockToken', {
        users: ['user1'],
        groupType: 'type',
        groupName: 'group',
      });
      expect(service.startExamMode).toHaveBeenCalledWith('mockToken', ['user1']);
    });

    it('should call stopExamMode when state is not start', async () => {
      await controller.startExamMode({ state: 'stop' }, 'mockToken', {
        users: ['user1'],
        groupType: 'type',
        groupName: 'group',
      });
      expect(service.stopExamMode).toHaveBeenCalledWith('mockToken', ['user1'], 'type', 'group');
    });
  });

  describe('addManagementGroup', () => {
    it('should call addManagementGroup', async () => {
      await controller.addManagementGroup('mockToken', { group: 'group1', users: ['user1'] });
      expect(service.addManagementGroup).toHaveBeenCalledWith('mockToken', 'group1', ['user1']);
    });
  });

  describe('getSchoolClass', () => {
    it('should call getSchoolClass', async () => {
      await controller.getSchoolClass({ schoolClassName: 'class1' }, 'mockToken');
      expect(service.getSchoolClass).toHaveBeenCalledWith('mockToken', 'class1');
    });
  });

  describe('getUser', () => {
    it('should call getUser', async () => {
      await controller.getUser('mockToken', { username: 'testUser' });
      expect(service.getUser).toHaveBeenCalledWith('mockToken', 'testUser', undefined);
    });
  });

  describe('toggleProjectJoined', () => {
    it('should call toggleProjectJoined', async () => {
      await controller.toggleProjectJoined({ project: 'project1', action: 'join' }, 'mockToken');
      expect(service.toggleProjectJoined).toHaveBeenCalledWith('mockToken', 'project1', 'join');
    });
  });

  describe('changePassword', () => {
    it('should call changePassword', async () => {
      await controller.changePassword('mockToken', { oldPassword: 'old', newPassword: 'new' }, 'user1');
      expect(service.changePassword).toHaveBeenCalledWith('mockToken', 'user1', 'old', 'new');
    });
  });
  describe('removeManagementGroup', () => {
    it('should call removeManagementGroup', async () => {
      await controller.removeManagementGroup('mockToken', { group: 'group1', users: ['user1'] });
      expect(service.removeManagementGroup).toHaveBeenCalledWith('mockToken', 'group1', ['user1']);
    });
  });

  describe('getUserSchoolClasses', () => {
    it('should call getUserSchoolClasses', async () => {
      await controller.getUserSchoolClasses('mockToken');
      expect(service.getUserSchoolClasses).toHaveBeenCalledWith('mockToken');
    });
  });

  describe('toggleSchoolClassJoined', () => {
    it('should call toggleSchoolClassJoined', async () => {
      await controller.toggleSchoolClassJoined({ schoolClass: 'class1', action: 'join' }, 'mockToken');
      expect(service.toggleSchoolClassJoined).toHaveBeenCalledWith('mockToken', 'class1', 'join');
    });
  });

  describe('getCurrentUserRoom', () => {
    it('should call getCurrentUserRoom', async () => {
      await controller.getCurrentUserRoom('mockToken', 'username');
      expect(service.getCurrentUserRoom).toHaveBeenCalledWith('mockToken', 'username');
    });
  });

  describe('getUserSessions', () => {
    it('should call getUserSessions', async () => {
      await controller.getUserSessions('mockToken', 'username');
      expect(service.getUserSessions).toHaveBeenCalledWith('mockToken', 'username');
    });
  });

  describe('deleteProject', () => {
    it('should call deleteProject', async () => {
      await controller.deleteProject('mockToken', { projectName: 'project1' });
      expect(service.deleteProject).toHaveBeenCalledWith('mockToken', 'project1');
    });
  });

  describe('getPrinters', () => {
    it('should call getPrinters', async () => {
      await controller.getPrinters('mockToken');
      expect(service.getPrinters).toHaveBeenCalledWith('mockToken');
    });
  });

  describe('setFirstPassword', () => {
    it('should call setFirstPassword', async () => {
      await controller.setFirstPassword('mockToken', { password: 'newPassword', username: 'username' });
      expect(service.setFirstPassword).toHaveBeenCalledWith('mockToken', 'username', 'newPassword');
    });
  });

  describe('getUserSession', () => {
    it('should call getUserSession', async () => {
      await controller.getUserSession('mockToken', { sessionSid: 'session1' }, 'username');
      expect(service.getUserSession).toHaveBeenCalledWith('mockToken', 'session1', 'username');
    });
  });

  describe('addUserSession', () => {
    it('should call addUserSession', async () => {
      await controller.addUserSession('mockToken', { formValues: {} as GroupForm }, 'username');
      expect(service.addUserSession).toHaveBeenCalledWith('mockToken', {}, 'username');
    });
  });

  describe('removeUserSession', () => {
    it('should call removeUserSession', async () => {
      await controller.removeUserSession('mockToken', { sessionId: 'session1' }, 'username');
      expect(service.removeUserSession).toHaveBeenCalledWith('mockToken', 'session1', 'username');
    });
  });

  describe('updateUserSession', () => {
    it('should call updateUserSession', async () => {
      await controller.updateUserSession('mockToken', { formValues: {} as GroupForm }, 'username');
      expect(service.updateUserSession).toHaveBeenCalledWith('mockToken', {}, 'username');
    });
  });

  describe('getUsersQuota', () => {
    it('should call getUsersQuota', async () => {
      await controller.getUsersQuota('mockToken', { username: 'testUser' });
      expect(service.getUsersQuota).toHaveBeenCalledWith('mockToken', 'testUser');
    });
  });

  describe('searchUsersOrGroups', () => {
    it('should call searchUsersOrGroups', async () => {
      await controller.searchUsersOrGroups('mockToken', 'searchQuery');
      expect(service.searchUsersOrGroups).toHaveBeenCalledWith('mockToken', 'searchQuery');
    });
  });

  describe('getProject', () => {
    it('should call getProject', async () => {
      await controller.getProject('mockToken', { projectName: 'project1' });
      expect(service.getProject).toHaveBeenCalledWith('mockToken', 'project1');
    });
  });

  describe('getUserProjects', () => {
    it('should call getUserProjects', async () => {
      await controller.getUserProjects('mockToken');
      expect(service.getUserProjects).toHaveBeenCalledWith('mockToken');
    });
  });

  describe('togglePrinterJoined', () => {
    it('should call togglePrinterJoined', async () => {
      await controller.togglePrinterJoined({ project: 'project1', action: 'join' }, 'mockToken');
      expect(service.togglePrinterJoined).toHaveBeenCalledWith('mockToken', 'project1', 'join');
    });
  });

  describe('createProject', () => {
    it('should call createProject', async () => {
      await controller.createProject('mockToken', { formValues: {} as GroupForm }, 'username');
      expect(service.createProject).toHaveBeenCalledWith('mockToken', {}, 'username');
    });
  });

  describe('updateProject', () => {
    it('should call updateProject', async () => {
      await controller.updateProject('mockToken', { formValues: {} as GroupForm }, 'username');
      expect(service.updateProject).toHaveBeenCalledWith('mockToken', {}, 'username');
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
