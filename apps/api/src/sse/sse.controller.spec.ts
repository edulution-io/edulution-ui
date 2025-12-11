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
import { of } from 'rxjs';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import SseController from './sse.controller';
import SseService from './sse.service';
import { Conference } from '../conferences/conference.schema';

const conferencesModelMock = {
  exists: jest.fn().mockImplementation(({ meetingID }) => ({ _id: meetingID as string })),
};
describe('SseController', () => {
  let sseController: SseController;
  let sseService: SseService;

  const mockSseService = {
    subscribe: jest.fn().mockReturnValue(of({ data: 'test' })),
  };

  beforeEach(async () => {
    jest.clearAllMocks();
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SseController],
      providers: [
        ConfigService,
        { provide: SseService, useValue: mockSseService },
        { provide: getModelToken(Conference.name), useValue: conferencesModelMock },
      ],
    }).compile();

    sseController = module.get<SseController>(SseController);
    sseService = module.get<SseService>(SseService);
  });

  it('should be defined', () => {
    expect(sseController).toBeDefined();
  });

  describe('getSseConnection', () => {
    it('should call sseService.subscribe with the username and response', () => {
      const username = 'testUser';
      const response = {} as Response;

      sseController.getSseConnection(username, response);

      expect(sseService.subscribe).toHaveBeenCalledWith(username, response);
    });
  });

  describe('publicConferenceSse', () => {
    it('should call sseService.subscribe with the meetingID and response', async () => {
      const meetingID = '12345';
      const response = {} as Response;

      await sseController.publicConferenceSse(meetingID, response);

      expect(sseService.subscribe).toHaveBeenCalledWith(meetingID, response);
    });
  });
});
