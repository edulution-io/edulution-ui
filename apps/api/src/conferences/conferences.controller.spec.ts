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

/* eslint-disable @typescript-eslint/unbound-method */

import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import CreateConferenceDto from '@libs/conferences/types/create-conference.dto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import ConferencesService from './conferences.service';
import ConferencesController from './conferences.controller';
import { Conference } from './conference.schema';
import AppConfigService from '../appconfig/appconfig.service';
import { mockAppConfigService } from '../appconfig/appconfig.mock';

const mockConferencesModel = {
  insertMany: jest.fn(),
  bulkWrite: jest.fn(),
  find: jest.fn(),
  deleteOne: jest.fn(),
};

const mockConferencesService = {
  create: jest.fn(),
  join: jest.fn(),
  findAllConferencesTheUserHasAccessTo: jest.fn(),
  isCurrentUserTheCreator: jest.fn(),
  update: jest.fn(),
  toggleConferenceIsRunning: jest.fn(),
  remove: jest.fn(),
};

const jwtUser: JWTUser = {
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
  preferred_username: 'testuser',
  given_name: '',
  family_name: '',
  email: '',
  school: 'default-school',
  ldapGroups: [],
};

describe(ConferencesController.name, () => {
  let controller: ConferencesController;
  let service: ConferencesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConferencesController],
      providers: [
        {
          provide: ConferencesService,
          useValue: mockConferencesService,
        },
        {
          provide: getModelToken(Conference.name),
          useValue: mockConferencesModel,
        },
        {
          provide: AppConfigService,
          useValue: mockAppConfigService,
        },
      ],
    }).compile();

    controller = module.get<ConferencesController>(ConferencesController);
    service = module.get<ConferencesService>(ConferencesService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should call create method of conferencesService with correct arguments', async () => {
      const createConferenceDto: CreateConferenceDto = {
        name: 'Test Conference',
        password: 'testpassword',
        isPublic: false,
        invitedAttendees: [],
        invitedGroups: [],
      };
      await controller.create(createConferenceDto, jwtUser);
      expect(service.create).toHaveBeenCalledWith(createConferenceDto, jwtUser);
    });
  });

  describe('join', () => {
    it('should call join method of conferencesService with correct arguments', async () => {
      const meetingID = '123';
      await controller.join(meetingID, 'password', jwtUser);
      expect(service.join).toHaveBeenCalledWith(meetingID, jwtUser, 'password');
    });
  });

  describe('findAll', () => {
    it('should call findAllConferencesTheUserHasAccessTo method of conferencesService with correct arguments', async () => {
      await controller.findAll(jwtUser);
      expect(service.findAllConferencesTheUserHasAccessTo).toHaveBeenCalledWith(jwtUser);
    });
  });

  describe('update', () => {
    it('should call update method of conferencesService with correct arguments', async () => {
      const conference: Conference = {
        name: 'Test Conference',
        meetingID: '123',
        isPublic: false,
        creator: { firstName: 'John', lastName: 'Doe', username: 'johndoe' },
        password: 'testpassword',
        isRunning: false,
        invitedAttendees: [],
        invitedGroups: [],
        joinedAttendees: [],
      };
      const username = 'testuser';
      await controller.update(conference, jwtUser);
      expect(service.isCurrentUserTheCreator).toHaveBeenCalledWith(conference.meetingID, username);
      expect(service.update).toHaveBeenCalledWith(conference);
      expect(service.findAllConferencesTheUserHasAccessTo).toHaveBeenCalledWith(jwtUser);
    });
  });

  describe('toggleIsRunning', () => {
    it('should call toggleConferenceIsRunning method of conferencesService with correct arguments', async () => {
      const conference: Pick<Conference, 'meetingID' | 'isRunning'> = { meetingID: '123', isRunning: false };
      const username = 'testuser';
      await controller.toggleIsRunning(conference, jwtUser);
      expect(service.toggleConferenceIsRunning).toHaveBeenCalledWith(
        conference.meetingID,
        conference.isRunning,
        username,
      );
      expect(service.findAllConferencesTheUserHasAccessTo).toHaveBeenCalledWith(jwtUser);
    });
  });

  describe('remove', () => {
    it('should call remove method of conferencesService with correct arguments', async () => {
      const meetingIDs = ['123', '456'];
      const username = 'testuser';
      await controller.remove(meetingIDs, jwtUser);
      expect(service.remove).toHaveBeenCalledWith(meetingIDs, username);
      expect(service.findAllConferencesTheUserHasAccessTo).toHaveBeenCalledWith(jwtUser);
    });
  });
});
