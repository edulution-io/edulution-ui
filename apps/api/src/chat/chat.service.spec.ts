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
import CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX from '@libs/chat/constants/chatProfilePictureCacheKeyPrefix';
import { USERS_CACHE_TTL_MS } from '@libs/common/constants/cacheTtl';
import cacheManagerMock from '../common/mocks/cacheManagerMock';
import SseService from '../sse/sse.service';
import NotificationsService from '../notifications/notifications.service';
import ChatService from './chat.service';
import { Conversation } from './schemas/conversation.schema';
import { ChatMessage } from './schemas/chatMessage.schema';

const mockSseService = { sendEventToUsers: jest.fn() };
const mockNotificationsService = { upsertNotificationForSource: jest.fn() };

describe(ChatService.name, () => {
  let service: ChatService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatService,
        { provide: getModelToken(Conversation.name), useValue: {} },
        { provide: getModelToken(ChatMessage.name), useValue: {} },
        { provide: CACHE_MANAGER, useValue: cacheManagerMock },
        { provide: SseService, useValue: mockSseService },
        { provide: NotificationsService, useValue: mockNotificationsService },
      ],
    }).compile();

    service = module.get<ChatService>(ChatService);
  });

  describe('cacheProfilePicture', () => {
    it('stores profile picture in cache with correct key and TTL', async () => {
      await service.cacheProfilePicture('alice', 'base64-data');

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}alice`,
        'base64-data',
        USERS_CACHE_TTL_MS,
      );
    });

    it('stores empty string to clear profile picture', async () => {
      await service.cacheProfilePicture('alice', '');

      expect(cacheManagerMock.set).toHaveBeenCalledWith(
        `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}alice`,
        '',
        USERS_CACHE_TTL_MS,
      );
    });
  });

  describe('getProfilePictures', () => {
    it('returns cached profile pictures for requested usernames', async () => {
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}alice`) return 'base64-alice';
        if (key === `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}bob`) return 'base64-bob';
        return null;
      });

      const result = await service.getProfilePictures(['alice', 'bob']);

      expect(result).toEqual({ alice: 'base64-alice', bob: 'base64-bob' });
    });

    it('omits usernames without cached picture', async () => {
      cacheManagerMock.get.mockImplementation((key: string) => {
        if (key === `${CHAT_PROFILE_PICTURE_CACHE_KEY_PREFIX}alice`) return 'base64-alice';
        return null;
      });

      const result = await service.getProfilePictures(['alice', 'unknown']);

      expect(result).toEqual({ alice: 'base64-alice' });
    });

    it('returns empty object when no pictures are cached', async () => {
      cacheManagerMock.get.mockResolvedValue(null);

      const result = await service.getProfilePictures(['alice', 'bob']);

      expect(result).toEqual({});
    });

    it('returns empty object for empty usernames array', async () => {
      const result = await service.getProfilePictures([]);

      expect(result).toEqual({});
      expect(cacheManagerMock.get).not.toHaveBeenCalled();
    });
  });
});
