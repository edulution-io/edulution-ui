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
import { ConfigService } from '@nestjs/config';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import axios from 'axios';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { SchedulerRegistry } from '@nestjs/schedule';
import ConferencesErrorMessage from '@libs/conferences/types/conferencesErrorMessage';
import ConferencesService from './conferences.service';
import { Conference, ConferenceDocument } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import { mockAppConfigService } from '../appconfig/appconfig.mock';
import Attendee from './attendee.schema';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import NotificationsService from '../notifications/notifications.service';
import AiService from '../ai/ai.service';
import UsersService from '../users/users.service';

const mockConference: CreateConferenceDto = {
  name: 'Testconference',
  isPublic: false,
  invitedAttendees: [],
  invitedGroups: [],
};

const mockCreator: Attendee = {
  username: 'username',
  lastName: 'lastName',
  firstName: 'firstName',
};

const mockAiService = {
  chat: jest.fn().mockResolvedValue(''),
  translate: jest.fn().mockResolvedValue(''),
  translateNotification: jest.fn().mockResolvedValue({ title: 'Test', body: 'Test' }),
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
  school: 'default-school',
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

const schedulerRegistryMock = {
  addInterval: jest.fn().mockImplementation((_, interval: NodeJS.Timeout) => interval.unref()),
  deleteInterval: jest.fn(),
};

const conferencesModelMock = {
  create: jest.fn().mockResolvedValue(mockConferenceDocument),
  find: jest.fn().mockImplementation(() => ({
    lean: jest.fn().mockResolvedValue([mockConferenceDocument]),
    exec: jest.fn().mockResolvedValue([mockConferenceDocument]),
  })),
  findOne: jest.fn().mockImplementation(() => ({
    lean: jest.fn().mockReturnThis(),
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  })),
  findOneAndUpdate: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue(mockConferenceDocument),
  })),
  deleteMany: jest.fn().mockImplementation(() => ({
    exec: jest.fn().mockResolvedValue({ deletedCount: 1 }),
  })),
};

const mockUsersService = {
  findOne: jest.fn().mockResolvedValue(null),
  findByUsername: jest.fn().mockResolvedValue(null),
  findByUsernames: jest.fn().mockResolvedValue([]),
  getUserLanguage: jest.fn().mockResolvedValue('de'),
};

describe(ConferencesService.name, () => {
  let service: ConferencesService;
  let model: Model<ConferenceDocument>;

  beforeEach(async () => {
    const notificationMock = {
      notifyUsernames: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ConferencesService,
        SseService,
        ConfigService,
        {
          provide: getModelToken(Conference.name),
          useValue: conferencesModelMock,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
        {
          provide: SchedulerRegistry,
          useValue: schedulerRegistryMock,
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: AiService, useValue: mockAiService },
        { provide: UsersService, useValue: mockUsersService },
      ],
    }).compile();

    service = module.get<ConferencesService>(ConferencesService);
    model = module.get<Model<ConferenceDocument>>(getModelToken(Conference.name));

    service.BBB_API_URL = 'http://bbb-123-456.test/';
    service.BBB_SECRET = 'test-secret';
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create and save a conference', async () => {
      const createDto: CreateConferenceDto = { ...mockConference };
      const result = await service.create(createDto, mockJWTUser);
      expect(model.create).toHaveBeenCalled();
      expect(result?.creator).toEqual(mockCreator);
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      jest
        .spyOn(service as any, 'syncConferencesInfoWithBBB')
        .mockResolvedValue([mockConferenceDocument] as unknown as Partial<Conference>[]);

      jest
        .spyOn(ConferencesService as any, 'replaceForeignConferencesPasswords')
        .mockReturnValue([mockConferenceDocument] as unknown as Partial<Conference>[]);
    });

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
      const result = await service.remove([mockConferenceDocument.meetingID], mockJWTUser.preferred_username);

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
    beforeEach(() => {
      jest.spyOn(service, 'startConference').mockResolvedValue(undefined);
      jest.spyOn(service, 'stopConference').mockResolvedValue(undefined);
    });

    it('should start the conference if it is not running', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: true,
      });
      jest.spyOn(service, 'checkConferenceIsRunningWithBBB').mockResolvedValue(false);

      mockConferenceDocument.isRunning = false;

      await service.toggleConferenceIsRunning('mockMeetingId', false, mockCreator.username);

      expect(service.startConference).toHaveBeenCalledWith(mockConferenceDocument, false);
      expect(service.stopConference).not.toHaveBeenCalled();
    });

    it('should stop the conference if it is running', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: true,
      });
      jest.spyOn(service, 'checkConferenceIsRunningWithBBB').mockResolvedValue(true);

      mockConferenceDocument.isRunning = true;

      await service.toggleConferenceIsRunning(mockConferenceDocument.meetingID, true, mockCreator.username);

      expect(service.stopConference).toHaveBeenCalledWith(mockConferenceDocument, true);
      expect(service.startConference).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not the creator', async () => {
      jest.spyOn(service, 'isCurrentUserTheCreator').mockResolvedValue({
        conference: mockConferenceDocument,
        isCreator: false,
      });

      await expect(
        service.toggleConferenceIsRunning(mockConferenceDocument.meetingID, true, 'mockUsername'),
      ).rejects.toThrow(ConferencesErrorMessage.YouAreNotTheCreator);

      expect(service.stopConference).not.toHaveBeenCalled();
      expect(service.startConference).not.toHaveBeenCalled();
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

      await service.startConference(mockConferenceDocument, false);
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

      await service.stopConference(mockConferenceDocument, true);
      expect(axios.get).toHaveBeenCalled();
      expect(service.update).toHaveBeenCalledWith(expect.objectContaining({ isRunning: false }));
    });
  });

  afterAll(() => {
    schedulerRegistryMock.deleteInterval.mockClear();
    schedulerRegistryMock.addInterval.mockClear();
  });
});
