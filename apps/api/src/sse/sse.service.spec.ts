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
import { Response } from 'express';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import mockCacheManager from '../common/cache-manager.mock';
import SseService from './sse.service';

describe('SseService', () => {
  let sseService: SseService;

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SseService,
        ConfigService,
        {
          provide: CACHE_MANAGER,
          useValue: mockCacheManager,
        },
      ],
    }).compile();

    sseService = module.get<SseService>(SseService);
  });

  describe('subscribe', () => {
    it('should create a new subject and return an observable that maps events', (done) => {
      const username = 'testUser';
      const closeCallbacks: Array<() => void> = [];
      const fakeResponse = {
        on: jest.fn((event: string, callback: () => void) => {
          if (event === 'close') {
            closeCallbacks.push(callback);
          }
        }),
      } as unknown as Response;

      const observable = sseService.subscribe(username, fakeResponse);
      observable.subscribe({
        next: (msgEvent) => {
          expect(msgEvent).toEqual({
            data: 'sampleData',
            type: SSE_MESSAGE_TYPE.MESSAGE,
          });
        },
        complete: () => {
          done();
        },
      });

      sseService.sendEventToUser(username, 'sampleData');

      setTimeout(() => {
        closeCallbacks.forEach((cb) => cb());
      }, 10);
    });

    it('should reuse an existing subject for the same user', () => {
      const username = 'testUser';
      const fakeResponse = {
        on: jest.fn(),
      } as unknown as Response;

      const observable1 = sseService.subscribe(username, fakeResponse);
      const observable2 = sseService.subscribe(username, fakeResponse);

      const nextMock1 = jest.fn();
      const nextMock2 = jest.fn();

      observable1.subscribe(nextMock1);
      observable2.subscribe(nextMock2);

      sseService.sendEventToUser(username, 'data', SSE_MESSAGE_TYPE.MESSAGE);

      expect(nextMock1).toHaveBeenCalledWith({ data: 'data', type: SSE_MESSAGE_TYPE.MESSAGE });
      expect(nextMock2).toHaveBeenCalledWith({ data: 'data', type: SSE_MESSAGE_TYPE.MESSAGE });
    });
  });

  describe('sendEventToUser', () => {
    it('should not throw if the user is not subscribed', () => {
      expect(() => {
        sseService.sendEventToUser('nonexistentUser', 'data', SSE_MESSAGE_TYPE.MESSAGE);
      }).not.toThrow();
    });
  });

  describe('sendEventToUsers', () => {
    it('should send events to multiple users', () => {
      const users = ['user1', 'user2'];
      const fakeResponse = {
        on: jest.fn(),
      } as unknown as Response;

      const obs1 = sseService.subscribe(users[0], fakeResponse);
      const obs2 = sseService.subscribe(users[1], fakeResponse);

      const nextMock1 = jest.fn();
      const nextMock2 = jest.fn();
      obs1.subscribe(nextMock1);
      obs2.subscribe(nextMock2);

      sseService.sendEventToUsers(users, 'bulkData', SSE_MESSAGE_TYPE.MESSAGE);

      expect(nextMock1).toHaveBeenCalledWith({ data: 'bulkData', type: SSE_MESSAGE_TYPE.MESSAGE });
      expect(nextMock2).toHaveBeenCalledWith({ data: 'bulkData', type: SSE_MESSAGE_TYPE.MESSAGE });
    });
  });

  describe('informAllUsers', () => {
    it('should send event to all subscribed users', () => {
      const users = ['user1', 'user2', 'user3'];
      const fakeResponse = {
        on: jest.fn(),
      } as unknown as Response;

      const nextMocks = users.map(() => jest.fn());
      users.forEach((user, idx) => {
        sseService.subscribe(user, fakeResponse).subscribe(nextMocks[idx]);
      });

      sseService.informAllUsers('globalData', SSE_MESSAGE_TYPE.MESSAGE);

      nextMocks.forEach((mock) => {
        expect(mock).toHaveBeenCalledWith({ data: 'globalData', type: SSE_MESSAGE_TYPE.MESSAGE });
      });
    });
  });
});
