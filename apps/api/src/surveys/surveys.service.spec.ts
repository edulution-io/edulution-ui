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

import { HttpStatus } from '@nestjs/common';
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { EventEmitter2 } from '@nestjs/event-emitter';
import createTestingModule from '@libs/test-utils/api-mocks/createTestingModule';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import {
  createdSurvey01,
  createSurvey01,
  firstMockJWTUser,
  secondMockJWTUser,
  idOfPublicSurvey01,
  publicSurvey01,
} from './mocks';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import SurveysAttachmentService from './surveys-attachment.service';
import NotificationsService from '../notifications/notifications.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

const notificationMock = {
  notifyUsernames: jest.fn().mockResolvedValue(undefined),
  upsertNotificationForSource: jest.fn().mockResolvedValue(undefined),
  cascadeDeleteBySourceId: jest.fn().mockResolvedValue(undefined),
};

describe(SurveysService.name, () => {
  let service: SurveysService;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module = await createTestingModule({
      providers: [
        SurveysService,
        SseService,
        ConfigService,
        { provide: getModelToken(Survey.name), useValue: jest.fn() },
        SurveysAttachmentService,
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn().mockResolvedValue([]) } },
        { provide: EventEmitter2, useValue: { emit: jest.fn() } },
      ],
    });

    service = module.get<SurveysService>(SurveysService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findPublicSurvey', () => {
    it('should return a public survey given an id', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey01),
      });

      const result = await service.findPublicSurvey(idOfPublicSurvey01.toString());
      expect(result).toEqual(publicSurvey01);
    });

    it('should throw a CustomHttpException when database access fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB connection lost')),
      });

      await expect(service.findPublicSurvey(idOfPublicSurvey01.toString())).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('findSurvey', () => {
    it('should return a survey accessible by the user', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey01),
      });

      const result = await service.findSurvey(idOfPublicSurvey01.toString(), firstMockJWTUser);
      expect(result).toEqual(publicSurvey01);
    });

    it('should return null when survey not found', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findSurvey(new Types.ObjectId().toString(), firstMockJWTUser);
      expect(result).toBeNull();
    });

    it('should throw when database access fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(service.findSurvey(new Types.ObjectId().toString(), firstMockJWTUser)).rejects.toMatchObject({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    });
  });

  describe('throwErrorIfSurveyIsNotAccessible', () => {
    it('should not throw when survey is accessible, it should return the survey instead', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey01),
      });

      await expect(
        service.throwErrorIfSurveyIsNotAccessible(idOfPublicSurvey01.toString(), firstMockJWTUser),
      ).resolves.toBe(publicSurvey01);
    });

    it('should throw NOT_FOUND when survey is not accessible', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.throwErrorIfSurveyIsNotAccessible(new Types.ObjectId().toString(), firstMockJWTUser),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('throwErrorIfSurveyIsNotPublic', () => {
    it('should not throw when survey is public, it should return the survey instead', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey01),
      });

      await expect(service.throwErrorIfPublicSurveyIsNotAccessible(idOfPublicSurvey01.toString())).resolves.toBe(
        publicSurvey01,
      );
    });

    it('should throw NOT_FOUND when survey is not public', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.throwErrorIfPublicSurveyIsNotAccessible(new Types.ObjectId().toString()),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('throwErrorIfUserIsNotCreator', () => {
    it('should not throw when user is the creator', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey01),
      });

      await expect(
        service.throwErrorIfUserIsNotCreator(idOfPublicSurvey01.toString(), firstMockJWTUser),
      ).resolves.toBeUndefined();
    });

    it('should throw NOT_FOUND when user is not the creator', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(
        service.throwErrorIfUserIsNotCreator(new Types.ObjectId().toString(), secondMockJWTUser),
      ).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('deleteSurveys', () => {
    it('should delete surveys by ids', async () => {
      surveyModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 1 });

      const surveyIds = [new Types.ObjectId().toString()];
      await service.deleteSurveys(surveyIds);

      expect(surveyModel.deleteMany).toHaveBeenCalled();
    });

    it('should throw when deletion fails', async () => {
      surveyModel.deleteMany = jest.fn().mockRejectedValue(new Error('DB error'));

      const surveyIds = [new Types.ObjectId().toString()];

      await expect(service.deleteSurveys(surveyIds)).rejects.toMatchObject({
        message: SurveyErrorMessages.DeleteError,
      });
    });

    it('should cascade delete notifications for each survey', async () => {
      surveyModel.deleteMany = jest.fn().mockResolvedValue({ deletedCount: 2 });

      const id1 = new Types.ObjectId().toString();
      const id2 = new Types.ObjectId().toString();
      await service.deleteSurveys([id1, id2]);

      expect(notificationMock.cascadeDeleteBySourceId).toHaveBeenCalledWith(id1);
      expect(notificationMock.cascadeDeleteBySourceId).toHaveBeenCalledWith(id2);
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should create a survey if the update target does not exist', async () => {
      surveyModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockResolvedValue(createdSurvey01);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(createdSurvey01),
      });

      const result = await service.updateOrCreateSurvey(createSurvey01, firstMockJWTUser);
      expect(result).toBe(createdSurvey01);
    });

    it('should throw BAD_REQUEST when surveyDto has no id and generated id is empty', async () => {
      const emptyDto = { ...createSurvey01, id: undefined };

      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(createdSurvey01),
      });

      const result = await service.updateOrCreateSurvey(emptyDto, firstMockJWTUser);
      expect(result).toBeDefined();
    });

    it('should throw NOT_FOUND when trying to update a non-existing survey', async () => {
      const surveyWithId = { ...createSurvey01, id: new Types.ObjectId().toString() };
      surveyModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(null),
      });

      await expect(service.updateOrCreateSurvey(surveyWithId, firstMockJWTUser)).rejects.toMatchObject({
        status: HttpStatus.NOT_FOUND,
      });
    });
  });

  describe('findSurveyWithCreatorDependency', () => {
    it('should return survey when creator matches', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(createdSurvey01),
      });

      const result = await service.findSurveyWithCreatorDependency(new Types.ObjectId().toString(), firstMockJWTUser);
      expect(result).toEqual(createdSurvey01);
    });

    it('should return null when creator does not match', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const result = await service.findSurveyWithCreatorDependency(new Types.ObjectId().toString(), secondMockJWTUser);
      expect(result).toBeNull();
    });

    it('should throw when database access fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValue(new Error('DB error')),
      });

      await expect(
        service.findSurveyWithCreatorDependency(new Types.ObjectId().toString(), firstMockJWTUser),
      ).rejects.toMatchObject({
        message: CommonErrorMessages.DB_ACCESS_FAILED,
      });
    });
  });

  describe('assertUserIsAuthorized', () => {
    it('should not throw when user is the owner', async () => {
      await expect(
        service.assertUserIsAuthorized(firstMockJWTUser.preferred_username, firstMockJWTUser),
      ).resolves.toBeUndefined();
    });

    it('should throw UNAUTHORIZED when user is not the owner and not admin', async () => {
      await expect(service.assertUserIsAuthorized('other-user', firstMockJWTUser)).rejects.toMatchObject({
        status: HttpStatus.UNAUTHORIZED,
      });
    });
  });
});
