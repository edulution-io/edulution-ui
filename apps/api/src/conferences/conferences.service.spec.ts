/* eslint-disable @typescript-eslint/unbound-method */
import { parseString } from 'xml2js';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import CustomHttpException from '@libs/error/CustomHttpException';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import { HttpException, HttpStatus } from '@nestjs/common';
import BbbResponseDto from '@libs/conferences/types/bbb-api/bbb-response.dto';
import ConferencesService from './conferences.service';
import { Conference, ConferenceDocument } from './conference.schema';
import JWTUser from '../types/JWTUser';
import AppConfigService from '../appconfig/appconfig.service';
import mockAppConfigService from '../appconfig/appconfig.service.mock';
import Attendee from './attendee.schema';
import { AppConfig } from '../appconfig/appconfig.schema';

const mockConference: CreateConferenceDto = {
  name: 'Testconference',
  invitedAttendees: [],
  invitedGroups: [],
};

const mockCreator: Attendee = {
  username: 'username',
  lastName: 'lastName',
  firstName: 'firstName',
};

const mockJWTUser: JWTUser = {
  exp: 0,
  iat: 0,
  jti: '',
  iss: '',
  sub: '',
  typ: '',
  azp: '',
  session_state: '',
  resource_access: {},
  scope: '',
  sid: '',
  email_verified: false,
  name: '',
  preferred_username: 'username',
  given_name: 'firstName',
  family_name: 'lastName',
  email: '',
  ldapGroups: [],
};

const mockConferenceDocument: ConferenceDocument = {
  name: mockConference.name,
  invitedAttendees: [],
  creator: mockCreator,
  meetingID: 'mockMeetingId',
  isRunning: false,
  joinedAttendees: [mockCreator],
  toObject: jest.fn().mockImplementation(() => mockConferenceDocument),
} as unknown as ConferenceDocument;

const conferencesModelMock = {
  create: jest.fn().mockResolvedValue(mockConferenceDocument),
  find: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue([mockConferenceDocument]),
  }),
  findOne: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  deleteMany: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  }),
};

jest.mock('xml2js', () => ({
  parseString: jest.fn(),
}));

describe('ConferencesService.parseXml', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should correctly parse valid XML', async () => {
    const xml = '<response><returncode>SUCCESS</returncode></response>';

    (parseString as jest.Mock).mockImplementation((_xml, _options, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(null, { response: { returncode: 'SUCCESS' } });
    });

    const result = await ConferencesService.parseXml<{ response: { returncode: string } }>(xml);
    expect(result.response.returncode).toBe('SUCCESS');
  });

  it('should handle XML parsing errors', async () => {
    const xml = '<response><returncode>SUCCESS</returncode></response>';

    (parseString as jest.Mock).mockImplementation((_xml, _options, callback) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      callback(new Error('Parsing error'), null);
    });

    await expect(ConferencesService.parseXml(xml)).rejects.toThrow('Parsing error');
  });
});

describe(ConferencesService.name, () => {
  let service: ConferencesService;
  let model: Model<ConferenceDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferencesService,
        {
          provide: getModelToken(Conference.name),
          useValue: conferencesModelMock,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
    model = module.get<Model<ConferenceDocument>>(getModelToken(Conference.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a conference', async () => {
      const createDto: CreateConferenceDto = { ...mockConference };
      const result = await service.create(createDto, mockJWTUser);
      expect(model.create).toHaveBeenCalled();
      expect(result.creator).toEqual(mockCreator);
    });
  });

  describe('findAll', () => {
    it('should return an array of conferences', async () => {
      const result = await service.findAllConferencesTheUserHasAccessTo(mockJWTUser);
      expect(result[0].creator).toEqual(mockCreator);
      expect(model.find).toHaveBeenCalled();
    });
    it('should handle ldapGroups mapping correctly', async () => {
      const mockUserWithGroups: JWTUser = {
        ...mockJWTUser,
        ldapGroups: ['group1', 'group2'],
      };

      const expectedQuery = {
        $or: [
          { 'invitedAttendees.username': mockUserWithGroups.preferred_username },
          { 'invitedGroups.path': 'group1' },
          { 'invitedGroups.path': 'group2' },
        ],
      };

      await service.findAllConferencesTheUserHasAccessTo(mockUserWithGroups);
      expect(model.find).toHaveBeenCalledWith(expectedQuery);
    });
  });

  describe('findOne', () => {
    it('should retrieve a single conference by ID', async () => {
      const result = await service.findOne(mockConference.name);
      expect(result?.creator).toEqual(mockCreator);
      expect(model.findOne).toHaveBeenCalledWith({ meetingID: mockConference.name });
    });
  });

  describe('update', () => {
    it('should update a conference', async () => {
      const mock = new Conference(mockConference, mockCreator);
      const result = await service.update(mock);
      expect(result?.creator).toEqual(mockCreator);
      expect(model.findOneAndUpdate).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a conference', async () => {
      const result = await service.remove(['1'], mockCreator.username);
      expect(result).toBeTruthy();
      expect(model.deleteMany).toHaveBeenCalled();
    });
  });

  describe('toggleConferenceIsRunning', () => {
    it('should toggle the conference running status', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: true,
      });
      jest.spyOn(service, 'stopConference').mockResolvedValue(undefined);
      jest.spyOn(service, 'startConference').mockResolvedValue(undefined);

      mockConferenceDocument.isRunning = false;
      await service.toggleConferenceIsRunning('mockMeetingId', mockCreator.username);
      expect(service.startConference).toHaveBeenCalled();

      mockConferenceDocument.isRunning = true;
      await service.toggleConferenceIsRunning('mockMeetingId', mockCreator.username);
      expect(service.stopConference).toHaveBeenCalled();
    });

    it('should throw a CustomHttpException if the user is not the creator', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: false,
      });

      await expect(
        service.toggleConferenceIsRunning(mockConferenceDocument.meetingID, mockCreator.username),
      ).rejects.toThrow(CustomHttpException);

      await expect(
        service.toggleConferenceIsRunning(mockConferenceDocument.meetingID, mockCreator.username),
      ).rejects.toThrow(ConferencesErrorMessage.YouAreNotTheCreator);
    });
  });

  describe('join', () => {
    it('should return a join URL', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: true,
      });
      const result = await service.join('mockMeetingId', mockJWTUser);
      expect(result).toContain('join?');
    });
    it('should throw CustomHttpException if there is an error joining the conference', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockRejectedValue(new Error('Network Error'));

      await expect(service.join('mockMeetingId', mockJWTUser)).rejects.toThrow(CustomHttpException);
      await expect(service.join('mockMeetingId', mockJWTUser)).rejects.toThrow(
        ConferencesErrorMessage.BbbServerNotReachable,
      );
    });
  });

  describe('isCurrentUserTheCreator', () => {
    it('should throw CustomHttpException if the conference is not found', async () => {
      jest.spyOn(service, 'findOne').mockResolvedValue(null);

      await expect(service.isCurrentUserTheCreator('nonExistentMeetingId', 'username')).rejects.toThrow(
        CustomHttpException,
      );
      await expect(service.isCurrentUserTheCreator('nonExistentMeetingId', 'username')).rejects.toThrow(
        ConferencesErrorMessage.MeetingNotFound,
      );
    });

    it('should verify if the current user is the creator', async () => {
      const result = await service.isCurrentUserTheCreator('mockMeetingId', mockCreator.username);
      expect(result.isCreator).toBe(true);
      expect(result.conference.creator).toEqual(mockCreator);
    });
  });

  describe('startConference', () => {
    it('should start a conference and update its status', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: '<response><returncode>SUCCESS</returncode></response>',
      });
      jest.spyOn(ConferencesService, 'parseXml').mockResolvedValue({
        response: { returncode: 'SUCCESS' },
      });
      jest.spyOn(service, 'update').mockResolvedValue(mockConferenceDocument);

      await service.startConference(mockConferenceDocument);
      expect(axios.get).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ isRunning: true }));
    });
  });

  describe('ConferencesService.handleBBBApiError', () => {
    it('should not throw an error if returncode is SUCCESS', () => {
      const result = { response: { returncode: 'SUCCESS' } };

      expect(() => ConferencesService.handleBBBApiError(result)).not.toThrow();
    });

    it('should throw an HttpException if returncode is not SUCCESS', () => {
      const result = { response: { returncode: 'FAILED' } };

      expect(() => ConferencesService.handleBBBApiError(result)).toThrow(HttpException);
      expect(() => ConferencesService.handleBBBApiError(result)).toThrow(
        new HttpException(ConferencesErrorMessage.BbbUnauthorized, HttpStatus.UNAUTHORIZED),
      );
    });
  });

  describe('startConferenceWithException', () => {
    it('should throw a CustomHttpException if BBB API is not reachable', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(service.startConference(mockConferenceDocument)).rejects.toThrow(CustomHttpException);
      await expect(service.startConference(mockConferenceDocument)).rejects.toThrow(
        ConferencesErrorMessage.BbbServerNotReachable,
      );
    });
  });

  describe('stopConference', () => {
    it('should stop a conference and update its status', async () => {
      jest.spyOn(axios, 'get').mockResolvedValue({
        data: '<response><returncode>SUCCESS</returncode></response>',
      });
      jest.spyOn(ConferencesService, 'parseXml').mockResolvedValue({
        response: { returncode: 'SUCCESS' },
      });
      jest.spyOn(service, 'update').mockResolvedValue(mockConferenceDocument);

      await service.stopConference(mockConferenceDocument);
      expect(axios.get).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ isRunning: false }));
    });
    it('should throw CustomHttpException if there is an error stopping the conference', async () => {
      jest.spyOn(axios, 'get').mockRejectedValue(new Error('Network Error'));

      await expect(service.stopConference(mockConferenceDocument)).rejects.toThrow(CustomHttpException);
      await expect(service.stopConference(mockConferenceDocument)).rejects.toThrow(
        ConferencesErrorMessage.BbbServerNotReachable,
      );
    });
  });
});

describe('ConferencesService.getJoinedAttendees', () => {
  it('should return an empty array if attendees are not present', () => {
    const bbbMeetingDto = { response: {} } as unknown as BbbResponseDto;
    const result = ConferencesService.getJoinedAttendees(bbbMeetingDto);
    expect(result).toEqual([]);
  });

  it('should return a single attendee if attendees.attendee is not an array', () => {
    const bbbMeetingDto = {
      response: {
        attendees: {
          attendee: {
            role: 'Viewer',
            fullName: 'John Doe',
            userID: 'john_doe',
          },
        },
      },
    } as unknown as BbbResponseDto;
    const result = ConferencesService.getJoinedAttendees(bbbMeetingDto);
    expect(result).toEqual([
      {
        lastName: 'Viewer',
        firstName: 'John Doe',
        username: 'john_doe',
      },
    ]);
  });

  it('should return an array of attendees if attendees.attendee is an array', () => {
    const bbbMeetingDto = {
      response: {
        attendees: {
          attendee: [
            {
              role: 'Viewer',
              fullName: 'John Doe',
              userID: 'john_doe',
            },
            {
              role: 'Moderator',
              fullName: 'Jane Smith',
              userID: 'jane_smith',
            },
          ],
        },
      },
    } as unknown as BbbResponseDto;
    const result = ConferencesService.getJoinedAttendees(bbbMeetingDto);
    expect(result).toEqual([
      {
        lastName: 'Viewer',
        firstName: 'John Doe',
        username: 'john_doe',
      },
      {
        lastName: 'Moderator',
        firstName: 'Jane Smith',
        username: 'jane_smith',
      },
    ]);
  });
});

describe('ConferencesService.loadConfig', () => {
  let service: ConferencesService;
  let appConfigService: AppConfigService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferencesService,
        {
          provide: getModelToken(Conference.name),
          useValue: conferencesModelMock,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
    appConfigService = module.get<AppConfigService>(AppConfigService);
  });

  it('should throw CustomHttpException if app config is not properly set', async () => {
    jest.spyOn(appConfigService, 'getAppConfigByName').mockResolvedValue({
      options: { url: '', apiKey: '' },
    } as AppConfig);

    await expect(service.loadConfig()).rejects.toThrow(CustomHttpException);
    await expect(service.loadConfig()).rejects.toThrow(ConferencesErrorMessage.AppNotProperlyConfigured);
  });
});
