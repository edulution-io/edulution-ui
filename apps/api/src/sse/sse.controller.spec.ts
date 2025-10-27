/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
