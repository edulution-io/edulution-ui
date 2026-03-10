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
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { GROUP_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import SOPHOMORIX_GROUP_TYPES from '@libs/lmnApi/constants/sophomorixGroupTypes';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import SseService from '../sse/sse.service';
import NotificationsService from '../notifications/notifications.service';
import ChatService from './chat.service';
import { Conversation } from './schemas/conversation.schema';
import { ChatMessage } from './schemas/chatMessage.schema';

const mockSseService = { sendEventToUsers: jest.fn() };
const mockNotificationsService = { upsertNotificationForSource: jest.fn() };

const mockConversationModel = {
  findOne: jest.fn(),
  findOneAndUpdate: jest.fn(),
  findByIdAndUpdate: jest.fn(),
};

const mockChatMessageModel = {
  find: jest.fn(),
  create: jest.fn(),
};

describe(ChatService.name, () => {
  let service: ChatService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Conversation.name), useValue: mockConversationModel },
        { provide: getModelToken(ChatMessage.name), useValue: mockChatMessageModel },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: SseService, useValue: mockSseService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAuthorizedConversation', () => {
    it('returns null when group is not cached', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await service.getAuthorizedConversation('test-group', SOPHOMORIX_GROUP_TYPES.ADMIN_CLASS, 'alice');

      expect(result).toBeNull();
    });

    it('returns conversation when user is a member', async () => {
      const mockConversation = { id: 'conv-1', groupName: 'test-group' };
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${GROUP_WITH_MEMBERS_CACHE_KEY}-/test-group`) {
          return { members: [{ username: 'alice' }, { username: 'bob' }] };
        }
        return null;
      });
      mockConversationModel.findOne.mockResolvedValue(mockConversation);

      const result = await service.getAuthorizedConversation('test-group', SOPHOMORIX_GROUP_TYPES.ADMIN_CLASS, 'alice');

      expect(result).toEqual(mockConversation);
    });

    it('throws when user is not a member of the group', async () => {
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${GROUP_WITH_MEMBERS_CACHE_KEY}-/test-group`) {
          return { members: [{ username: 'bob' }] };
        }
        return null;
      });

      await expect(
        service.getAuthorizedConversation('test-group', SOPHOMORIX_GROUP_TYPES.ADMIN_CLASS, 'alice'),
      ).rejects.toThrow();
    });
  });

  describe('getMessages', () => {
    it('queries messages with default parameters', async () => {
      const mockExec = jest.fn().mockResolvedValue([]);
      const mockLimit = jest.fn().mockReturnValue({ exec: mockExec });
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      mockChatMessageModel.find.mockReturnValue({ sort: mockSort });

      const result = await service.getMessages('conv-1');

      expect(mockChatMessageModel.find).toHaveBeenCalledWith({ conversationId: 'conv-1' });
      expect(result).toEqual([]);
    });
  });
});
