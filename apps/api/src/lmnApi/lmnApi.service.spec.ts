/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Test, TestingModule } from '@nestjs/testing';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import {
  PRINT_PASSWORDS_LMN_API_ENDPOINT,
  PROJECTS_LMN_API_ENDPOINT,
  USERS_LMN_API_ENDPOINT,
  EXAM_MODE_LMN_API_ENDPOINT,
} from '@libs/lmnApi/constants/lmnApiEndpoints';
import { HttpMethods, HTTP_HEADERS } from '@libs/common/types/http-methods';
import GroupForm from '@libs/groups/types/groupForm';
import SPECIAL_SCHOOLS from '@libs/common/constants/specialSchools';
import LmnApiSchoolClass from '@libs/lmnApi/types/lmnApiSchoolClass';
import { encodeBase64Api } from '@libs/common/utils/getBase64StringApi';
import GroupJoinState from '@libs/classManagement/constants/joinState.enum';
import GroupFormDto from '@libs/groups/types/groupForm.dto';
import CustomHttpException from '../common/CustomHttpException';
import LmnApiService from './lmnApi.service';
import UsersService from '../users/users.service';
import LdapKeycloakSyncService from '../ldap-keycloak-sync/ldap-keycloak-sync.service';
import LmnApiRequestQueue from './queue/lmn-api-request.queue';

const queueResponse = <T>(data: T, headers: Record<string, unknown> = {}) => ({
  data,
  headers,
  status: 200,
});

const lmnApiQueueMock = {
  enqueue: jest.fn(),
};

const mockToken = 'mockToken';
const user1 = 'user1';
const formValuesMock = {
  id: '1',
  name: 'p_testproject',
  displayName: 'Testproject',
  description: 'Cool project for students',
  quota: '',
  mailquota: '',
  mailalias: false,
  maillist: false,
  join: true,
  hide: false,
  admins: ['school-admin'],
  admingroups: [],
  members: ['netzint1', 'netzint2', 'netzint3'],
  membergroups: [],
  school: 'default-school',
} as unknown as GroupFormDto;

describe('LmnApiService', () => {
  let service: LmnApiService;
  let usersService: UsersService;
  let requestSpy: jest.SpyInstance;

  beforeEach(async () => {
    lmnApiQueueMock.enqueue.mockReset();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LmnApiService,
        {
          provide: UsersService,
          useValue: {
            getPassword: jest.fn(),
          },
        },
        {
          provide: LdapKeycloakSyncService,
          useValue: {
            updateGroupMembershipByNames: jest.fn(),
            reconcileNamedGroupMembers: jest.fn(),
          },
        },
        {
          provide: LmnApiRequestQueue,
          useValue: lmnApiQueueMock,
        },
      ],
    }).compile();

    service = module.get<LmnApiService>(LmnApiService);
    usersService = module.get<UsersService>(UsersService);
    requestSpy = jest.spyOn<any, any>(service, 'request');
  });

  describe('getLmnApiToken', () => {
    it('should get password from usersService and call auth endpoint with basic auth', async () => {
      const username = 'testuser';
      const password = 'testpassword';
      const expectedToken = 'mock-api-token-12345';

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);

      // eslint-disable-next-line @typescript-eslint/dot-notation
      const axiosGetSpy = jest.spyOn<any, any>(service['lmnApi'], 'get').mockResolvedValue({
        data: expectedToken,
      });

      const result = await service.getLmnApiToken(username);

      expect(usersService.getPassword).toHaveBeenCalledWith(username);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      expect(axiosGetSpy).toHaveBeenCalledWith('/auth/', {
        auth: { username, password },
        timeout: 10_000,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        validateStatus: expect.any(Function),
      });
      expect(result).toBe(expectedToken);
    });

    it('should return empty string with space if token is not returned', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      jest.spyOn<any, any>(service['lmnApi'], 'get').mockResolvedValue({
        data: '',
      });

      const result = await service.getLmnApiToken(username);

      expect(result).toBe(' ');
    });

    it('should return empty string with space if token is null', async () => {
      const username = 'testuser';
      const password = 'testpassword';

      jest.spyOn(usersService, 'getPassword').mockResolvedValue(password);
      // eslint-disable-next-line @typescript-eslint/dot-notation
      jest.spyOn<any, any>(service['lmnApi'], 'get').mockResolvedValue({
        data: null,
      });

      const result = await service.getLmnApiToken(username);

      expect(result).toBe(' ');
    });
  });

  describe('printPasswords', () => {
    it('should call printPasswords endpoint with correct headers and handle response', async () => {
      const buffer = Buffer.from('mock');
      const response = queueResponse(buffer, { 'content-disposition': 'inline' });
      requestSpy.mockResolvedValue(response);

      const result = await service.printPasswords(mockToken, {
        format: PrintPasswordsFormat.CSV,
      } as PrintPasswordsRequest);

      expect(requestSpy).toHaveBeenCalledWith(
        HttpMethods.POST,
        PRINT_PASSWORDS_LMN_API_ENDPOINT,
        { format: PrintPasswordsFormat.CSV },
        { responseType: 'arraybuffer', headers: { [HTTP_HEADERS.XApiKey]: mockToken } },
      );
      expect(result).toEqual(response);
    });
  });

  describe('startExamMode', () => {
    it('should call startExamMode endpoint and return data', async () => {
      requestSpy.mockResolvedValue(queueResponse('Exam Started'));

      const result = await service.startExamMode(mockToken, [user1]);
      expect(requestSpy).toHaveBeenCalledWith(
        HttpMethods.POST,
        `${EXAM_MODE_LMN_API_ENDPOINT}/start`,
        { users: [user1] },
        { headers: { [HTTP_HEADERS.XApiKey]: mockToken } },
      );
      expect(result).toBe('Exam Started');
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('Network Error'));

      await expect(service.startExamMode(mockToken, [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSchoolClasses', () => {
    it('should get school classes successfully', async () => {
      requestSpy.mockResolvedValue(queueResponse([{ className: 'Math' }]));

      const result = await service.getUserSchoolClasses(mockToken);
      expect(result).toEqual([{ className: 'Math' }]);
    });

    it('should throw CustomHttpException if API call fails', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSchoolClasses(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('changePassword', () => {
    it('should change password when old base64 encoded password matches', async () => {
      const oldPass = 'oldPass';
      const newPass = 'newPass';
      jest.spyOn(usersService, 'getPassword').mockResolvedValue(oldPass);
      requestSpy.mockResolvedValue(queueResponse(null));

      const result = await service.changePassword(
        mockToken,
        'username',
        encodeBase64Api(oldPass),
        encodeBase64Api(newPass),
      );

      expect(result).toBeNull();
      expect(requestSpy).toHaveBeenCalledWith(
        HttpMethods.POST,
        `${USERS_LMN_API_ENDPOINT}/username/set-current-password`,
        { password: newPass, set_first: false },
        { headers: { [HTTP_HEADERS.XApiKey]: mockToken } },
      );
    });

    it('should throw an error if passwords do not match', async () => {
      jest.spyOn(usersService, 'getPassword').mockResolvedValue('wrongOldPass');

      await expect(service.changePassword(mockToken, 'username', 'oldPass', 'newPass')).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('searchUsersOrGroups', () => {
    it('should return search results', async () => {
      requestSpy.mockResolvedValue(queueResponse([{ id: user1, type: 'user' }]));

      const result = await service.searchUsersOrGroups(mockToken, SPECIAL_SCHOOLS.GLOBAL, 'searchTerm');

      expect(result).toEqual([{ id: user1, type: 'user' }]);
    });

    it('should throw CustomHttpException if search fails', async () => {
      requestSpy.mockRejectedValue(new Error('Error'));

      await expect(service.searchUsersOrGroups(mockToken, SPECIAL_SCHOOLS.GLOBAL, 'searchTerm')).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('stopExamMode', () => {
    it('should call stopExamMode endpoint and return data', async () => {
      requestSpy.mockResolvedValue(queueResponse('Exam Stopped'));

      const result = await service.stopExamMode(mockToken, [user1], 'groupType', 'groupName');
      expect(result).toBe('Exam Stopped');
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('Network Error'));

      await expect(service.stopExamMode(mockToken, [user1], 'groupType', 'groupName')).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('removeManagementGroup', () => {
    it('should call removeManagementGroup endpoint and return data', async () => {
      const mockResponse = queueResponse({ className: 'removedClass' } as unknown as LmnApiSchoolClass);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.removeManagementGroup(mockToken, 'group', [user1]);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.removeManagementGroup(mockToken, 'group', [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('addManagementGroup', () => {
    it('should call addManagementGroup endpoint and return data', async () => {
      const mockResponse = queueResponse({ className: 'addedClass' } as unknown as LmnApiSchoolClass);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.addManagementGroup(mockToken, 'group', [user1]);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.addManagementGroup(mockToken, 'group', [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getSchoolClass', () => {
    it('should call getSchoolClass endpoint and return data', async () => {
      const mockResponse = queueResponse({ className: 'SchoolClass' } as unknown as LmnApiSchoolClass);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getSchoolClass(mockToken, 'schoolClassName');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getSchoolClass(mockToken, 'schoolClassName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('toggleSchoolClassJoined', () => {
    it('should call toggleSchoolClassJoined endpoint and return data', async () => {
      jest.spyOn(service, 'getSchoolClass').mockResolvedValue({} as unknown as LmnApiSchoolClass);

      const mockResponse = queueResponse({ className: 'SchoolClass' } as unknown as LmnApiSchoolClass);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.toggleSchoolClassJoined(mockToken, 'schoolClass', GroupJoinState.Join);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.toggleSchoolClassJoined(mockToken, 'schoolClass', GroupJoinState.Join)).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('toggleProjectJoined', () => {
    it('should call toggleProjectJoined endpoint and return data', async () => {
      const mockResponse = queueResponse({ projectName: 'Sample Project' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.toggleProjectJoined(mockToken, 'project', GroupJoinState.Join);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.toggleProjectJoined(mockToken, 'project', GroupJoinState.Join)).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('togglePrinterJoined', () => {
    it('should call togglePrinterJoined endpoint and return data', async () => {
      const mockResponse = queueResponse({ printerName: 'Printer1' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.togglePrinterJoined(mockToken, 'printer', GroupJoinState.Join);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.togglePrinterJoined(mockToken, 'printer', GroupJoinState.Join)).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('getPrinters', () => {
    it('should call getPrinters endpoint and return data', async () => {
      const mockResponse = queueResponse([{ printerName: 'Printer1' }]);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getPrinters(mockToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getPrinters(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSession', () => {
    it('should call getUserSession endpoint and return data', async () => {
      const mockResponse = queueResponse({ sessionId: 'session1' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getUserSession(mockToken, 'sessionId', 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSession(mockToken, 'sessionId', 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getCurrentUserRoom', () => {
    it('should call getCurrentUserRoom endpoint and return data', async () => {
      const mockResponse = queueResponse({ room: 'Room1' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getCurrentUserRoom(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getCurrentUserRoom(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });
  describe('addUserSession', () => {
    it('should call addUserSession endpoint and return data', async () => {
      const mockResponse = queueResponse({ sessionId: 'session1' });
      const formValues = {} as GroupForm;
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.addUserSession(mockToken, formValues, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));
      const formValues = {} as GroupForm;

      await expect(service.addUserSession(mockToken, formValues, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('updateUserSession', () => {
    it('should call updateUserSession endpoint and return data', async () => {
      const mockResponse = queueResponse({ sessionId: 'session1' });
      const formValues = {} as GroupForm;
      requestSpy.mockResolvedValueOnce(queueResponse(null));
      requestSpy.mockResolvedValueOnce(mockResponse);

      const result = await service.updateUserSession(mockToken, formValues, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      const formValues = {} as GroupForm;
      requestSpy.mockResolvedValueOnce(queueResponse(null));
      requestSpy.mockRejectedValueOnce(new Error('API Error'));

      await expect(service.updateUserSession(mockToken, formValues, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('removeUserSession', () => {
    it('should call removeUserSession endpoint and return data', async () => {
      const mockResponse = queueResponse({ sessionId: 'session1' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.removeUserSession(mockToken, 'session1', 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.removeUserSession(mockToken, 'session1', 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSessions', () => {
    it('should call getUserSessions endpoint and return data', async () => {
      const mockResponse = queueResponse([{ sessionId: 'session1' }]);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getUserSessions(mockToken, 'username', false);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSessions(mockToken, 'username', false)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUser', () => {
    it('should call getUser endpoint and return data', async () => {
      const mockResponse = queueResponse({ username: 'user1' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getUser(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUser(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUsersQuota', () => {
    it('should call getUsersQuota endpoint and return data', async () => {
      const mockResponse = queueResponse({ quota: '100GB' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getUsersQuota(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUsersQuota(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserProjects', () => {
    it('should call getUserProjects endpoint and return data', async () => {
      const mockResponse = queueResponse([{ projectName: 'Project1' }]);
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getUserProjects(mockToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserProjects(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getProject', () => {
    it('should call getProject endpoint and return data', async () => {
      const mockResponse = queueResponse({
        projectName: 'Project1',
        members: [{ cn: 'member1' }, { cn: 'member2' }],
        all_members: ['member1'],
      });

      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.getProject(mockToken, 'projectName');

      const expectedResult = {
        ...mockResponse.data,
        members: [{ cn: 'member1' }],
      };

      expect(result).toEqual(expectedResult);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.getProject(mockToken, 'projectName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('createProject', () => {
    it('should call createProject endpoint and return data', async () => {
      const mockResponse = queueResponse({ projectName: 'NewProject' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.createProject(mockToken, formValuesMock, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.createProject(mockToken, formValuesMock, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('updateProject', () => {
    it('should call updateProject endpoint and return data', async () => {
      const mockResponse = queueResponse({ projectName: 'UpdatedProject' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.updateProject(mockToken, formValuesMock, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.updateProject(mockToken, formValuesMock, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('deleteProject', () => {
    it('should call deleteProject endpoint and return data', async () => {
      const mockResponse = queueResponse({ projectName: 'DeletedProject' });
      requestSpy.mockResolvedValue(mockResponse);

      const result = await service.deleteProject(mockToken, 'projectName');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.deleteProject(mockToken, 'projectName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('setFirstPassword', () => {
    it('should call setFirstPassword endpoint and return null', async () => {
      requestSpy.mockResolvedValue(queueResponse(null));

      const result = await service.setFirstPassword(mockToken, 'username', 'newPassword');
      expect(result).toBeNull();
    });

    it('should throw CustomHttpException on failure', async () => {
      requestSpy.mockRejectedValue(new Error('API Error'));

      await expect(service.setFirstPassword(mockToken, 'username', 'newPassword')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('createProject', () => {
    it('should call createProject with formatted data from getProjectFromForm', async () => {
      const mockResponse = queueResponse({ projectName: 'p_testproject' });
      requestSpy.mockResolvedValue(mockResponse);

      await service.createProject(mockToken, formValuesMock, 'username');
      expect(requestSpy).toHaveBeenCalledWith(
        HttpMethods.POST,
        `${PROJECTS_LMN_API_ENDPOINT}/p_testproject`,
        expect.objectContaining({
          admins: formValuesMock.admins,
          members: [...formValuesMock.members],
          displayName: formValuesMock.displayName,
        }),
        expect.any(Object),
      );
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
