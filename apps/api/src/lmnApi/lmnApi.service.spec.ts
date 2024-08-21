import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import axios from 'axios';
import CustomHttpException from '@libs/error/CustomHttpException';
import LmnApiErrorMessage from '@libs/lmnApi/types/lmnApiErrorMessage';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import LmnApiSession from '@libs/lmnApi/types/lmnApiSession';
import UserLmnInfo from '@libs/lmnApi/types/userInfo';
import LmnApiSearchResult from '@libs/lmnApi/types/lmnApiSearchResult';
import GroupForm from '@libs/groups/types/groupForm';
import LmnApiProject from '@libs/lmnApi/types/lmnApiProject';
import LmnApiProjectWithMembers from '@libs/lmnApi/types/lmnApiProjectWithMembers';
import LmnApiPrinter from '@libs/lmnApi/types/lmnApiPrinter';
import LmnApiService from './lmnApi.service';
import UsersService from '../users/users.service';

jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;
describe('LmnApiService', () => {
  let service: LmnApiService;
  let usersService: UsersService;

  const groupFormValue: GroupForm = {
    school: '',
    id: 'group123',
    name: 'Group Name',
    displayName: 'Display Name of Group',
    description: 'This is a description of the group.',
    quota: '100GB',
    mailquota: '10GB',
    maillist: true,
    mailalias: false,
    join: true,
    hide: false,
    admins: [
      {
        id: 'admin2',
        name: 'Admin User 2',
        value: '',
        label: '',
      },
    ],
    admingroups: [
      {
        id: 'group2',
        name: 'Admin Group 2',
        path: '',
        label: '',
        value: '',
      },
    ],
    members: [
      {
        id: 'member2',
        name: 'Member User 2',
        value: '',
        label: '',
      },
    ],
    membergroups: [
      {
        id: 'group4',
        name: 'Member Group 2',
        path: '',
        label: '',
        value: '',
      },
    ],
    proxyAddresses: 'group@example.com',
    creationDate: '2024-08-21',
  };

  beforeEach(async () => {
    jest.resetAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LmnApiService,
        {
          provide: UsersService,
          useValue: {
            getPassword: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<LmnApiService>(LmnApiService);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should call enqueue when printPasswords is called', async () => {
    const lmnApiToken = 'test-token';
    const options: PrintPasswordsRequest = {
      format: 'pdf',
      one_per_page: true,
      pdflatex: false,
      school: 'Test School',
      schoolclasses: ['Class 1', 'Class 2'],
    };

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: 'response' }));

    await service.printPasswords(lmnApiToken, options);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails', async () => {
    const lmnApiToken = 'test-token';
    const options: PrintPasswordsRequest = {
      format: 'pdf',
      one_per_page: true,
      pdflatex: false,
      school: 'Test School',
      schoolclasses: ['Class 1', 'Class 2'],
    };

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.printPasswords(lmnApiToken, options)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.PrintPasswordsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when startExamMode is called', async () => {
    const lmnApiToken = 'test-token';
    const users = ['user1', 'user2'];

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: 'response' }));

    await service.startExamMode(lmnApiToken, users);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in startExamMode', async () => {
    const lmnApiToken = 'test-token';
    const users = ['user1', 'user2'];

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));
    await expect(service.startExamMode(lmnApiToken, users)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.StartExamModeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when stopExamMode is called', async () => {
    const lmnApiToken = 'test-token';
    const users = ['user1', 'user2'];
    const groupType = 'typeA';
    const groupName = 'groupA';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: 'response' }));

    await service.stopExamMode(lmnApiToken, users, groupType, groupName);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in stopExamMode', async () => {
    const lmnApiToken = 'test-token';
    const users = ['user1', 'user2'];
    const groupType = 'typeA';
    const groupName = 'groupA';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.stopExamMode(lmnApiToken, users, groupType, groupName)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.StopExamModeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when removeManagementGroup is called', async () => {
    const lmnApiToken = 'test-token';
    const group = 'group1';
    const users = ['user1', 'user2'];

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSchoolClass }));

    await service.removeManagementGroup(lmnApiToken, group, users);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.delete fails in removeManagementGroup', async () => {
    const lmnApiToken = 'test-token';
    const group = 'group1';
    const users = ['user1', 'user2'];
    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'));
    await expect(service.removeManagementGroup(lmnApiToken, group, users)).rejects.toThrow(
      new CustomHttpException(
        LmnApiErrorMessage.RemoveManagementGroupFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      ),
    );
  });

  it('should call enqueue when addManagementGroup is called', async () => {
    const lmnApiToken = 'test-token';
    const group = 'group1';
    const users = ['user1', 'user2'];

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSchoolClass }));

    await service.addManagementGroup(lmnApiToken, group, users);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in addManagementGroup', async () => {
    const lmnApiToken = 'test-token';
    const group = 'group1';
    const users = ['user1', 'user2'];

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.addManagementGroup(lmnApiToken, group, users)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.AddManagementGroupFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getSchoolClass is called', async () => {
    const lmnApiToken = 'test-token';
    const schoolClassName = 'class1';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSchoolClass }));

    await service.getSchoolClass(lmnApiToken, schoolClassName);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getSchoolClass', async () => {
    const lmnApiToken = 'test-token';
    const schoolClassName = 'class1';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getSchoolClass(lmnApiToken, schoolClassName)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetUserSchoolClassFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getUserSchoolClasses is called', async () => {
    const lmnApiToken = 'test-token';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: [] as LmnApiSchoolClass[] }));

    await service.getUserSchoolClasses(lmnApiToken);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getUserSchoolClasses', async () => {
    const lmnApiToken = 'test-token';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getUserSchoolClasses(lmnApiToken)).rejects.toThrow(
      new CustomHttpException(
        LmnApiErrorMessage.GetUserSchoolClassesFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      ),
    );
  });

  it('should call enqueue when toggleSchoolClassJoined is called', async () => {
    const lmnApiToken = 'test-token';
    const schoolClass = 'class1';
    const action = 'join';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSchoolClass }));

    await service.toggleSchoolClassJoined(lmnApiToken, schoolClass, action);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in toggleSchoolClassJoined', async () => {
    const lmnApiToken = 'test-token';
    const schoolClass = 'class1';
    const action = 'join';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.toggleSchoolClassJoined(lmnApiToken, schoolClass, action)).rejects.toThrow(
      new CustomHttpException(
        LmnApiErrorMessage.ToggleSchoolClassJoinedFailed,
        HttpStatus.BAD_GATEWAY,
        LmnApiService.name,
      ),
    );
  });

  it('should call enqueue when getUserSession is called', async () => {
    const lmnApiToken = 'test-token';
    const sessionSid = 'session1';
    const username = 'user1';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSession }));

    await service.getUserSession(lmnApiToken, sessionSid, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getUserSession', async () => {
    const lmnApiToken = 'test-token';
    const sessionSid = 'session1';
    const username = 'user1';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getUserSession(lmnApiToken, sessionSid, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetUserSessionsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when addUserSession is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSession }));

    await service.addUserSession(lmnApiToken, groupFormValue, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in addUserSession', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.addUserSession(lmnApiToken, groupFormValue, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.AddUserSessionsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call removeUserSession and enqueue when updateUserSession is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const removeSpy = jest
      .spyOn(service, 'removeUserSession')
      .mockImplementationOnce(() => Promise.resolve({} as LmnApiSession));

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSession }));

    await service.updateUserSession(lmnApiToken, groupFormValue, username);

    expect(removeSpy).toHaveBeenCalledWith(lmnApiToken, groupFormValue.id, username);
    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in updateUserSession', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    jest.spyOn(service, 'removeUserSession').mockImplementationOnce(() => Promise.resolve({} as LmnApiSession));

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.updateUserSession(lmnApiToken, groupFormValue, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.UpdateUserSessionsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when removeUserSession is called', async () => {
    const lmnApiToken = 'test-token';
    const sessionId = 'session1';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiSession }));

    await service.removeUserSession(lmnApiToken, sessionId, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.delete fails in removeUserSession', async () => {
    const lmnApiToken = 'test-token';
    const sessionId = 'session1';
    const username = 'test-user';

    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.removeUserSession(lmnApiToken, sessionId, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.RemoveUserSessionsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getUserSessions is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: [] as LmnApiSession[] }));

    await service.getUserSessions(lmnApiToken, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getUserSessions', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getUserSessions(lmnApiToken, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetUserSessionsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getUser is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as UserLmnInfo }));

    await service.getUser(lmnApiToken, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getUser', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getUser(lmnApiToken, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetUserFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getCurrentUserRoom is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as UserLmnInfo }));

    await service.getCurrentUserRoom(lmnApiToken, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getCurrentUserRoom', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getCurrentUserRoom(lmnApiToken, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetCurrentUserRoomFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when searchUsersOrGroups is called', async () => {
    const lmnApiToken = 'test-token';
    const searchQuery = 'search-term';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: [] as LmnApiSearchResult[] }));

    await service.searchUsersOrGroups(lmnApiToken, searchQuery);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in searchUsersOrGroups', async () => {
    const lmnApiToken = 'test-token';
    const searchQuery = 'search-term';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.searchUsersOrGroups(lmnApiToken, searchQuery)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.SearchUsersOrGroupsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getUserProjects is called', async () => {
    const lmnApiToken = 'test-token';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: [] as LmnApiProject[] }));

    await service.getUserProjects(lmnApiToken);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getUserProjects', async () => {
    const lmnApiToken = 'test-token';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getUserProjects(lmnApiToken)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetUserProjectsFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getProject is called', async () => {
    const lmnApiToken = 'test-token';
    const projectName = 'project1';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiProjectWithMembers }));

    await service.getProject(lmnApiToken, projectName);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getProject', async () => {
    const lmnApiToken = 'test-token';
    const projectName = 'project1';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getProject(lmnApiToken, projectName)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when createProject is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiProject }));

    await service.createProject(lmnApiToken, groupFormValue, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in createProject', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.createProject(lmnApiToken, groupFormValue, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.CreateProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when updateProject is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiProject }));

    await service.updateProject(lmnApiToken, groupFormValue, username);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.patch fails in updateProject', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';

    mockedAxios.patch.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.updateProject(lmnApiToken, groupFormValue, username)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.UpdateProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when deleteProject is called', async () => {
    const lmnApiToken = 'test-token';
    const projectName = 'project1';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiProject }));

    await service.deleteProject(lmnApiToken, projectName);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.delete fails in deleteProject', async () => {
    const lmnApiToken = 'test-token';
    const projectName = 'project1';

    mockedAxios.delete.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.deleteProject(lmnApiToken, projectName)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.RemoveProjectFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when toggleProjectJoined is called', async () => {
    const lmnApiToken = 'test-token';
    const project = 'project1';
    const action = 'join';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiProject }));

    await service.toggleProjectJoined(lmnApiToken, project, action);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in toggleProjectJoined', async () => {
    const lmnApiToken = 'test-token';
    const project = 'project1';
    const action = 'join';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.toggleProjectJoined(lmnApiToken, project, action)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.ToggleProjectJoinedFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when togglePrinterJoined is called', async () => {
    const lmnApiToken = 'test-token';
    const printer = 'printer1';
    const action = 'join';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: {} as LmnApiPrinter }));

    await service.togglePrinterJoined(lmnApiToken, printer, action);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in togglePrinterJoined', async () => {
    const lmnApiToken = 'test-token';
    const printer = 'printer1';
    const action = 'join';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.togglePrinterJoined(lmnApiToken, printer, action)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.TogglePrinterJoinedFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when getPrinters is called', async () => {
    const lmnApiToken = 'test-token';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: [] as LmnApiPrinter[] }));

    await service.getPrinters(lmnApiToken);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.get fails in getPrinters', async () => {
    const lmnApiToken = 'test-token';

    mockedAxios.get.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.getPrinters(lmnApiToken)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.GetPrintersFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when changePassword is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const bypassSecurityCheck = false;

    jest.spyOn(usersService, 'getPassword').mockResolvedValueOnce(oldPassword);

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: null }));

    await service.changePassword(lmnApiToken, username, oldPassword, newPassword, bypassSecurityCheck);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when passwords do not match in changePassword', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';

    jest.spyOn(usersService, 'getPassword').mockResolvedValueOnce('wrongPassword');

    await expect(service.changePassword(lmnApiToken, username, oldPassword, newPassword)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.PasswordMismatch, HttpStatus.UNAUTHORIZED, LmnApiService.name),
    );
  });

  it('should throw CustomHttpException when axios.post fails in changePassword', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';
    const oldPassword = 'oldPassword123';
    const newPassword = 'newPassword123';
    const bypassSecurityCheck = false;

    jest.spyOn(usersService, 'getPassword').mockResolvedValueOnce(oldPassword);
    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(
      service.changePassword(lmnApiToken, username, oldPassword, newPassword, bypassSecurityCheck),
    ).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.PasswordChangeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });

  it('should call enqueue when setFirstPassword is called', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';
    const password = 'newPassword123';

    const enqueueSpy = jest
      .spyOn(service as any, 'enqueue')
      .mockImplementationOnce(() => Promise.resolve({ data: null }));

    await service.setFirstPassword(lmnApiToken, username, password);

    expect(enqueueSpy).toHaveBeenCalled();
  });

  it('should throw CustomHttpException when axios.post fails in setFirstPassword', async () => {
    const lmnApiToken = 'test-token';
    const username = 'test-user';
    const password = 'newPassword123';

    mockedAxios.post.mockRejectedValueOnce(new Error('Network Error'));

    await expect(service.setFirstPassword(lmnApiToken, username, password)).rejects.toThrow(
      new CustomHttpException(LmnApiErrorMessage.PasswordChangeFailed, HttpStatus.BAD_GATEWAY, LmnApiService.name),
    );
  });
});
