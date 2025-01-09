import { Test, TestingModule } from '@nestjs/testing';
import { AxiosInstance } from 'axios';
import CustomHttpException from '@libs/error/CustomHttpException';
import PrintPasswordsFormat from '@libs/classManagement/types/printPasswordsFormat';
import PrintPasswordsRequest from '@libs/classManagement/types/printPasswordsRequest';
import {
  PRINT_PASSWORDS_LMN_API_ENDPOINT,
  PROJECTS_LMN_API_ENDPOINT,
  USERS_LMN_API_ENDPOINT,
} from '@libs/lmnApi/constants/lmnApiEndpoints';
import { HTTP_HEADERS } from '@libs/common/types/http-methods';
import GroupForm from '@libs/groups/types/groupForm';
import LmnApiService from './lmnApi.service';
import UsersService from '../users/users.service';

jest.mock('axios');
const mockedAxios = {
  post: jest.fn(),
  get: jest.fn(),
  delete: jest.fn(),
  patch: jest.fn(),
} as unknown as jest.Mocked<AxiosInstance>;

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
} as unknown as GroupForm;

describe('LmnApiService', () => {
  let service: LmnApiService;
  let usersService: UsersService;

  beforeEach(async () => {
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

    // eslint-disable-next-line @typescript-eslint/dot-notation
    service['lmnApi'] = mockedAxios;
  });

  describe('printPasswords', () => {
    it('should call printPasswords endpoint with correct headers and handle response', async () => {
      const mockResponse = { data: new ArrayBuffer(8) };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.printPasswords(mockToken, {
        format: PrintPasswordsFormat.CSV,
      } as PrintPasswordsRequest);

      expect(mockedAxios.post).toHaveBeenCalledWith(
        PRINT_PASSWORDS_LMN_API_ENDPOINT,
        { format: PrintPasswordsFormat.CSV },
        { responseType: 'arraybuffer', headers: { [HTTP_HEADERS.XApiKey]: mockToken } },
      );
      expect(result).toEqual(mockResponse);
    });
  });

  describe('startExamMode', () => {
    it('should call startExamMode endpoint and return data', async () => {
      mockedAxios.post.mockResolvedValue({ data: 'Exam Started' });

      const result = await service.startExamMode(mockToken, [user1]);
      expect(result).toBe('Exam Started');
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(service.startExamMode(mockToken, [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSchoolClasses', () => {
    it('should get school classes successfully', async () => {
      mockedAxios.get.mockResolvedValue({ data: [{ className: 'Math' }] });

      const result = await service.getUserSchoolClasses(mockToken);
      expect(result).toEqual([{ className: 'Math' }]);
    });

    it('should throw CustomHttpException if API call fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSchoolClasses(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('changePassword', () => {
    it('should change password when old password matches', async () => {
      const oldPass = 'oldPass';
      const newPass = 'newPass';
      jest.spyOn(usersService, 'getPassword').mockResolvedValue(oldPass);
      mockedAxios.post.mockResolvedValue({ data: null });

      const result = await service.changePassword(mockToken, 'username', oldPass, newPass);

      expect(result).toBeNull();
      expect(mockedAxios.post).toHaveBeenCalledWith(
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
      mockedAxios.get.mockResolvedValue({ data: [{ id: user1, type: 'user' }] });

      const result = await service.searchUsersOrGroups(mockToken, 'searchTerm');

      expect(result).toEqual([{ id: user1, type: 'user' }]);
    });

    it('should throw CustomHttpException if search fails', async () => {
      mockedAxios.get.mockRejectedValue(new Error('Error'));

      await expect(service.searchUsersOrGroups(mockToken, 'searchTerm')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('stopExamMode', () => {
    it('should call stopExamMode endpoint and return data', async () => {
      mockedAxios.post.mockResolvedValue({ data: 'Exam Stopped' });

      const result = await service.stopExamMode(mockToken, [user1], 'groupType', 'groupName');
      expect(result).toBe('Exam Stopped');
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('Network Error'));

      await expect(service.stopExamMode(mockToken, [user1], 'groupType', 'groupName')).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('removeManagementGroup', () => {
    it('should call removeManagementGroup endpoint and return data', async () => {
      const mockResponse = { data: { className: 'removedClass' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await service.removeManagementGroup(mockToken, 'group', [user1]);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('API Error'));

      await expect(service.removeManagementGroup(mockToken, 'group', [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('addManagementGroup', () => {
    it('should call addManagementGroup endpoint and return data', async () => {
      const mockResponse = { data: { className: 'addedClass' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.addManagementGroup(mockToken, 'group', [user1]);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.addManagementGroup(mockToken, 'group', [user1])).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getSchoolClass', () => {
    it('should call getSchoolClass endpoint and return data', async () => {
      const mockResponse = { data: { className: 'SchoolClass' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getSchoolClass(mockToken, 'schoolClassName');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getSchoolClass(mockToken, 'schoolClassName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('toggleSchoolClassJoined', () => {
    it('should call toggleSchoolClassJoined endpoint and return data', async () => {
      const mockResponse = { data: { className: 'SchoolClass' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.toggleSchoolClassJoined(mockToken, 'schoolClass', 'join');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.toggleSchoolClassJoined(mockToken, 'schoolClass', 'join')).rejects.toThrow(
        CustomHttpException,
      );
    });
  });

  describe('toggleProjectJoined', () => {
    it('should call toggleProjectJoined endpoint and return data', async () => {
      const mockResponse = { data: { projectName: 'Sample Project' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.toggleProjectJoined(mockToken, 'project', 'join');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.toggleProjectJoined(mockToken, 'project', 'join')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('togglePrinterJoined', () => {
    it('should call togglePrinterJoined endpoint and return data', async () => {
      const mockResponse = { data: { printerName: 'Printer1' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.togglePrinterJoined(mockToken, 'printer', 'join');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.togglePrinterJoined(mockToken, 'printer', 'join')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getPrinters', () => {
    it('should call getPrinters endpoint and return data', async () => {
      const mockResponse = { data: [{ printerName: 'Printer1' }] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getPrinters(mockToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getPrinters(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSession', () => {
    it('should call getUserSession endpoint and return data', async () => {
      const mockResponse = { data: { sessionId: 'session1' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getUserSession(mockToken, 'sessionSid', 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSession(mockToken, 'sessionSid', 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getCurrentUserRoom', () => {
    it('should call getCurrentUserRoom endpoint and return data', async () => {
      const mockResponse = { data: { room: 'Room1' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getCurrentUserRoom(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getCurrentUserRoom(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });
  describe('addUserSession', () => {
    it('should call addUserSession endpoint and return data', async () => {
      const mockResponse = { data: { sessionId: 'session1' } };
      const formValues = {} as GroupForm;
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.addUserSession(mockToken, formValues, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));
      const formValues = {} as GroupForm;

      await expect(service.addUserSession(mockToken, formValues, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('updateUserSession', () => {
    it('should call updateUserSession endpoint and return data', async () => {
      const mockResponse = { data: { sessionId: 'session1' } };
      const formValues = {} as GroupForm;
      mockedAxios.post.mockResolvedValue(mockResponse);
      mockedAxios.delete.mockResolvedValue({ data: null });

      const result = await service.updateUserSession(mockToken, formValues, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      const formValues = {} as GroupForm;
      mockedAxios.delete.mockResolvedValue({ data: null });
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.updateUserSession(mockToken, formValues, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('removeUserSession', () => {
    it('should call removeUserSession endpoint and return data', async () => {
      const mockResponse = { data: { sessionId: 'session1' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await service.removeUserSession(mockToken, 'session1', 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('API Error'));

      await expect(service.removeUserSession(mockToken, 'session1', 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserSessions', () => {
    it('should call getUserSessions endpoint and return data', async () => {
      const mockResponse = { data: [{ sessionId: 'session1' }] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getUserSessions(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserSessions(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUser', () => {
    it('should call getUser endpoint and return data', async () => {
      const mockResponse = { data: { username: 'user1' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getUser(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUser(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUsersQuota', () => {
    it('should call getUsersQuota endpoint and return data', async () => {
      const mockResponse = { data: { quota: '100GB' } };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getUsersQuota(mockToken, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUsersQuota(mockToken, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getUserProjects', () => {
    it('should call getUserProjects endpoint and return data', async () => {
      const mockResponse = { data: [{ projectName: 'Project1' }] };
      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getUserProjects(mockToken);
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getUserProjects(mockToken)).rejects.toThrow(CustomHttpException);
    });
  });

  describe('getProject', () => {
    it('should call getProject endpoint and return data', async () => {
      const mockResponse = {
        data: {
          projectName: 'Project1',
          members: [{ cn: 'member1' }, { cn: 'member2' }],
          sophomorixMembers: ['member1'],
        },
      };

      mockedAxios.get.mockResolvedValue(mockResponse);

      const result = await service.getProject(mockToken, 'projectName');

      const expectedResult = {
        ...mockResponse.data,
        members: [{ cn: 'member1' }],
      };

      expect(result).toEqual(expectedResult);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.get.mockRejectedValue(new Error('API Error'));

      await expect(service.getProject(mockToken, 'projectName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('createProject', () => {
    it('should call createProject endpoint and return data', async () => {
      const mockResponse = { data: { projectName: 'NewProject' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      const result = await service.createProject(mockToken, formValuesMock, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.createProject(mockToken, formValuesMock, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('updateProject', () => {
    it('should call updateProject endpoint and return data', async () => {
      const mockResponse = { data: { projectName: 'UpdatedProject' } };
      mockedAxios.patch.mockResolvedValue(mockResponse);

      const result = await service.updateProject(mockToken, formValuesMock, 'username');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.patch.mockRejectedValue(new Error('API Error'));

      await expect(service.updateProject(mockToken, formValuesMock, 'username')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('deleteProject', () => {
    it('should call deleteProject endpoint and return data', async () => {
      const mockResponse = { data: { projectName: 'DeletedProject' } };
      mockedAxios.delete.mockResolvedValue(mockResponse);

      const result = await service.deleteProject(mockToken, 'projectName');
      expect(result).toEqual(mockResponse.data);
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.delete.mockRejectedValue(new Error('API Error'));

      await expect(service.deleteProject(mockToken, 'projectName')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('setFirstPassword', () => {
    it('should call setFirstPassword endpoint and return null', async () => {
      mockedAxios.post.mockResolvedValue({ data: null });

      const result = await service.setFirstPassword(mockToken, 'username', 'newPassword');
      expect(result).toBeNull();
    });

    it('should throw CustomHttpException on failure', async () => {
      mockedAxios.post.mockRejectedValue(new Error('API Error'));

      await expect(service.setFirstPassword(mockToken, 'username', 'newPassword')).rejects.toThrow(CustomHttpException);
    });
  });

  describe('createProject', () => {
    it('should call createProject with formatted data from getProjectFromForm', async () => {
      const mockResponse = { data: { projectName: 'p_testproject' } };
      mockedAxios.post.mockResolvedValue(mockResponse);

      await service.createProject(mockToken, formValuesMock, 'username');
      expect(mockedAxios.post).toHaveBeenCalledWith(
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

  describe('enqueue method behavior', () => {
    it('should delay multiple requests to enforce rate-limiting', async () => {
      jest.useRealTimers();

      mockedAxios.get.mockResolvedValueOnce({ data: [{ className: 'Math' }] });
      mockedAxios.get.mockResolvedValueOnce({ data: [{ className: 'Science' }] });

      const promise1 = service.getUserSchoolClasses(mockToken);
      const promise2 = service.getUserSchoolClasses(mockToken);

      await Promise.all([promise1, promise2]);

      expect(mockedAxios.get).toHaveBeenCalledTimes(2);

      jest.clearAllMocks();
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});
