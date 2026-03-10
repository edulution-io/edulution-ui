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
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ChatController from './chat.controller';
import ChatService from './chat.service';
import GroupsService from '../groups/groups.service';

const mockCurrentUser = { preferred_username: 'testuser', given_name: 'Test', family_name: 'User' } as JwtUser;

const mockChatService = {
  getProfilePictures: jest.fn(),
  cacheProfilePicture: jest.fn(),
  getAuthorizedConversation: jest.fn(),
  getOrCreateAuthorizedConversation: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
};

const mockGroupsService = {
  getUserGroupsAndProjects: jest.fn(),
};

describe(ChatController.name, () => {
  let controller: ChatController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatController],
      providers: [
        { provide: ChatService, useValue: mockChatService },
        { provide: GroupsService, useValue: mockGroupsService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfilePictures', () => {
    it('calls chatService.getProfilePictures with dto usernames and current user', async () => {
      const dto = { usernames: ['alice', 'bob'] };
      const expected = { alice: 'base64-alice', bob: 'base64-bob' };
      mockChatService.getProfilePictures.mockResolvedValue(expected);

      const result = await controller.getProfilePictures(mockCurrentUser, dto as any);

      expect(mockChatService.getProfilePictures).toHaveBeenCalledWith(['alice', 'bob'], 'testuser');
      expect(result).toEqual(expected);
    });

    it('returns empty object when no pictures found', async () => {
      mockChatService.getProfilePictures.mockResolvedValue({});

      const result = await controller.getProfilePictures(mockCurrentUser, { usernames: ['unknown'] } as any);

      expect(result).toEqual({});
    });
  });

  describe('updateProfilePicture', () => {
    it('calls chatService.cacheProfilePicture with current user and picture data', async () => {
      const dto = { profilePicture: 'base64-data' };

      await controller.updateProfilePicture(mockCurrentUser, dto as any);

      expect(mockChatService.cacheProfilePicture).toHaveBeenCalledWith('testuser', 'base64-data');
    });

    it('calls chatService.cacheProfilePicture with empty string to clear picture', async () => {
      const dto = { profilePicture: '' };

      await controller.updateProfilePicture(mockCurrentUser, dto as any);

      expect(mockChatService.cacheProfilePicture).toHaveBeenCalledWith('testuser', '');
    });
  });
});
