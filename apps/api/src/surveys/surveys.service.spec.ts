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

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import { createdSurvey01, createSurvey01, firstMockJWTUser } from './mocks';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import mockCacheManager from '../common/cache-manager.mock';
import SurveysAttachmentService from './surveys-attachment.service';
import NotificationsService from '../notifications/notifications.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe('SurveyService', () => {
  let service: SurveysService;
  let surveyModel: Model<SurveyDocument>;
  const notificationMock = {
    notifyUsernames: jest.fn().mockResolvedValue(undefined),
  };
  beforeEach(async () => {
    Logger.error = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        SseService,
        ConfigService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveysAttachmentService,
        { provide: GroupsService, useValue: mockGroupsService },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

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
    // it('should search for public survey given an id', async () => {
    //   surveyModel.findOne = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(publicSurvey01),
    //   });
    //
    //   const result = await service.findPublicSurvey(idOfPublicSurvey01.toString());
    //   expect(result).toEqual(publicSurvey01);
    //
    //   expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    // });
    // it('should throw an error if the database access fails', async () => {
    //   surveyModel.findOne = jest.fn().mockReturnValue({
    //     exec: jest
    //       .fn()
    //       .mockRejectedValue(
    //         new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //       ),
    //   });
    //
    //   try {
    //     await service.findPublicSurvey(idOfPublicSurvey01.toString());
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
    //   }
    //   expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    // });
  });

  describe('deleteSurveys', () => {
    // it('should delete a survey', async () => {
    //   surveyModel.deleteMany = jest.fn();
    //
    //   const surveyIds = [surveyUpdateSurveyId.toString()];
    //   await service.deleteSurveys(surveyIds);
    //   expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    // });
    // it('should throw an error if the survey deletion fails', async () => {
    //   surveyModel.deleteMany = jest
    //     .fn()
    //     .mockRejectedValueOnce(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));
    //
    //   const surveyIds = [new Types.ObjectId().toString()];
    //   try {
    //     await service.deleteSurveys(surveyIds);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(SurveyErrorMessages.DeleteError);
    //   }
    //   expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    // });
  });

  describe('createSurvey', () => {
    // it('should create a survey', async () => {
    //   surveyModel.create = jest.fn().mockReturnValueOnce(surveyUpdateInitialSurveyDto);
    //
    //   await service
    //     .createSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser)
    //     .then((data) => expect(data).toStrictEqual(surveyUpdateInitialSurveyDto))
    //     .catch(() => {});
    //
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });
    // it('should throw an error if the survey creation fails', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
    //   surveyModel.create = jest
    //     .fn()
    //     .mockRejectedValueOnce(
    //       new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //     );
    //
    //   try {
    //     await service.createSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
    //   }
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });
  });

  describe('updateSurvey', () => {
    // it('should update a survey', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(surveyUpdateInitialSurveyDto),
    //   });
    //   const result = await service.updateSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser);
    //
    //   expect(result).toStrictEqual(surveyUpdateInitialSurveyDto);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateInitialSurveyDto,
    //   );
    // });
    // it('should throw an error if the survey update fails', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest
    //       .fn()
    //       .mockRejectedValue(
    //         new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
    //       ),
    //   });
    //   try {
    //     await service.updateSurvey(surveyUpdateInitialSurveyDto, firstMockJWTUser);
    //   } catch (e) {
    //     const error = e as Error;
    //     expect(error.message).toBe(CommonErrorMessages.DBAccessFailed);
    //   }
    // });
    // TODO: NIEDUUI-405: Survey: Update backendLimiters on question removal or name change of a question
  });

  describe('updateOrCreateSurvey', () => {
    // it('should create a survey if it does not exist', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(null),
    //   });
    //   surveyModel.create = jest.fn().mockReturnValue(surveyUpdateInitialSurvey);
    //
    //   const result = await service.updateOrCreateSurvey(
    //     surveyUpdateInitialSurveyDto,
    //     firstMockJWTUser,
    //   );
    //   expect(result).toStrictEqual(surveyUpdateInitialSurvey);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateInitialSurveyDto,
    //   );
    //   expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    // });

    // it('should update a survey', async () => {
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
    //   });
    //
    //   const result = await service.updateOrCreateSurvey(
    //     surveyUpdateUpdatedSurveyDto,
    //     firstMockJWTUser,
    //   );
    //   expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);
    //
    //   expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
    //     { id: surveyUpdateSurveyId },
    //     surveyUpdateUpdatedSurveyDto,
    //   );
    // });

    it('should create a survey if the update failed', async () => {
      surveyModel.findById = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValueOnce(null),
      });
      surveyModel.create = jest.fn().mockResolvedValue(createdSurvey01);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(createdSurvey01),
      });

      const result = await service.updateOrCreateSurvey(createSurvey01, firstMockJWTUser);
      expect(result).toBe(createdSurvey01);
    });
  });
});
