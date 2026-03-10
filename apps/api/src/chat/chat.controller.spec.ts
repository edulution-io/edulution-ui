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
import { HttpStatus } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ChatController from './chat.controller';
import ChatService from './chat.service';
import ProfilePictureService from './profilePicture.service';
import GroupsService from '../groups/groups.service';
import SseService from '../sse/sse.service';

const mockCurrentUser = { preferred_username: 'testuser', given_name: 'Test', family_name: 'User' } as JwtUser;

const mockChatService = {
  getAuthorizedConversation: jest.fn(),
  getOrCreateAuthorizedConversation: jest.fn(),
  getMessages: jest.fn(),
  sendMessage: jest.fn(),
};

const mockGroupsService = {
  getUserGroupsAndProjects: jest.fn(),
};

const mockProfilePictureService = {
  isAllowedToView: jest.fn(),
  getProfilePicture: jest.fn(),
  saveProfilePicture: jest.fn(),
  getGroupMembers: jest.fn().mockResolvedValue([]),
};

const mockSseService = {
  sendEventToUsers: jest.fn(),
};

const createMockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
  };
  return res as any;
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
        { provide: ProfilePictureService, useValue: mockProfilePictureService },
        { provide: SseService, useValue: mockSseService },
      ],
    }).compile();

    controller = module.get<ChatController>(ChatController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProfilePicture', () => {
    it('returns 403 when user is not allowed to view', async () => {
      mockProfilePictureService.isAllowedToView.mockResolvedValue(false);
      const res = createMockResponse();

      await controller.getProfilePicture('alice', mockCurrentUser, undefined, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
      expect(res.send).toHaveBeenCalled();
    });

    it('returns 404 when profile picture does not exist', async () => {
      mockProfilePictureService.isAllowedToView.mockResolvedValue(true);
      mockProfilePictureService.getProfilePicture.mockResolvedValue(null);
      const res = createMockResponse();

      await controller.getProfilePicture('alice', mockCurrentUser, undefined, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    });

    it('returns 304 when ETag matches', async () => {
      const etag = '"abc123"';
      mockProfilePictureService.isAllowedToView.mockResolvedValue(true);
      mockProfilePictureService.getProfilePicture.mockResolvedValue({ buffer: Buffer.from('img'), etag });
      const res = createMockResponse();

      await controller.getProfilePicture('alice', mockCurrentUser, etag, res);

      expect(res.status).toHaveBeenCalledWith(HttpStatus.NOT_MODIFIED);
    });

    it('returns image with correct headers', async () => {
      const buffer = Buffer.from('img-data');
      const etag = '"abc123"';
      mockProfilePictureService.isAllowedToView.mockResolvedValue(true);
      mockProfilePictureService.getProfilePicture.mockResolvedValue({ buffer, etag });
      const res = createMockResponse();

      await controller.getProfilePicture('alice', mockCurrentUser, undefined, res);

      expect(res.setHeader).toHaveBeenCalledWith('Content-Type', 'image/webp');
      expect(res.setHeader).toHaveBeenCalledWith('ETag', etag);
      expect(res.send).toHaveBeenCalledWith(buffer);
    });
  });

  describe('updateProfilePicture', () => {
    it('calls profilePictureService.saveProfilePicture with current user and picture data', async () => {
      const dto = { profilePicture: 'base64-data' };

      await controller.updateProfilePicture(mockCurrentUser, dto as any);

      expect(mockProfilePictureService.saveProfilePicture).toHaveBeenCalledWith('testuser', 'base64-data');
    });

    it('calls profilePictureService.saveProfilePicture with empty string to delete picture', async () => {
      const dto = { profilePicture: '' };

      await controller.updateProfilePicture(mockCurrentUser, dto as any);

      expect(mockProfilePictureService.saveProfilePicture).toHaveBeenCalledWith('testuser', '');
    });
  });
});
