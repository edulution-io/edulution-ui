/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import ConferencesService from './conferences.service';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import mockAppConfigService from '../appconfig/appconfig.service.mock';
import Attendee from './attendee.schema';
import type UserConnections from '../types/userConnections';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

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
  invitedGroups: [],
  creator: mockCreator,
  meetingID: 'mockMeetingId',
  isRunning: false,
  joinedAttendees: [mockCreator],
  toObject: jest.fn().mockImplementation(() => mockConferenceDocument),
} as unknown as ConferenceDocument;

const mockSseConnections: UserConnections = new Map();

const conferencesModelMock = {
  create: jest.fn().mockResolvedValue(mockConferenceDocument),
  find: jest.fn().mockReturnValue({
    lean: jest.fn().mockResolvedValue([mockConferenceDocument]),
    exec: jest.fn().mockResolvedValue([mockConferenceDocument]),
  }),
  findOne: jest.fn().mockReturnValue({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  findOneAndUpdate: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  }),
  deleteMany: jest.fn().mockReturnValue({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  }),
};

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
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
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
      const result = await service.create(createDto, mockJWTUser, mockSseConnections);
      expect(model.create).toHaveBeenCalled();
      expect(result?.creator).toEqual(mockCreator);
    });
  });

  describe('findAll', () => {
    it('should return an array of conferences', async () => {
      const result = await service.findAllConferencesTheUserHasAccessTo(mockJWTUser);
      expect(result[0].creator).toEqual(mockCreator);
      expect(model.find).toHaveBeenCalled();
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
      const result = await service.remove(
        [mockConferenceDocument.meetingID],
        mockJWTUser.preferred_username,
        mockSseConnections,
      );

      expect(result).toBeTruthy();
      expect(conferencesModelMock.find).toHaveBeenCalledWith(
        { meetingID: { $in: [mockConferenceDocument.meetingID] } },
        { _id: 0, __v: 0 },
      );
      expect(conferencesModelMock.deleteMany).toHaveBeenCalledWith({
        meetingID: { $in: [mockConferenceDocument.meetingID] },
        'creator.username': mockCreator.username,
      });
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
      await service.toggleConferenceIsRunning('mockMeetingId', mockCreator.username, mockSseConnections);
      expect(service.startConference).toHaveBeenCalled();

      mockConferenceDocument.isRunning = true;
      await service.toggleConferenceIsRunning('mockMeetingId', mockCreator.username, mockSseConnections);
      expect(service.stopConference).toHaveBeenCalled();
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
  });

  describe('isCurrentUserTheCreator', () => {
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

      await service.startConference(mockConferenceDocument, mockSseConnections);
      expect(axios.get).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ isRunning: true }));
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

      await service.stopConference(mockConferenceDocument, mockSseConnections);
      expect(axios.get).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ isRunning: false }));
    });
  });
});
