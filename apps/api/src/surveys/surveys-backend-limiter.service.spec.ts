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
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyAnswersService from './survey-answers.service';
import SurveysBackendLimiterService from './surveys-backend-limiter.service';
import { SurveyAnswer /* , SurveyAnswerDocument */ } from './survey-answers.schema';
// import { SurveysBackendLimiter, SurveysBackendLimiterDocument } from './surveys-backend-limiter.schema';
import {
  filteredChoices,
  filteredChoicesAfterAddingValidAnswer,
  idOfPublicSurvey01,
  idOfPublicSurvey02,
  publicSurvey01,
  publicSurvey02,
  publicSurvey02AfterAddingValidAnswer,
  publicSurvey02QuestionNameWithLimiters,
} from './mocks';
import SurveysService from './surveys.service';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import mockCacheManager from '../common/cache-manager.mock';
import NotificationsService from '../notifications/notifications.service';
import GlobalSettingsService from '../global-settings/global-settings.service';

describe('SurveysBackendLimiterService', () => {
  let service: SurveysBackendLimiterService;
  // let model: Model<SurveysBackendLimiterDocument>;
  let surveyModel: Model<SurveyDocument>;
  // let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const notificationMock = {
      notifyUsernames: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SurveysService,
        SseService,
        ConfigService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveyAnswersService,
        SurveysAttachmentService,
        SurveyAnswerAttachmentsService,
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: NotificationsService, useValue: notificationMock },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
        SseService,
        SurveysService,
      ],
    }).compile();

    service = module.get<SurveysBackendLimiterService>(SurveysBackendLimiterService);
    // model = module.get<Model<SurveysBackendLimiterDocument>>(getModelToken(SurveysBackendLimiter.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    // surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('updateOrCreateSurveysBackendLimiters', () => {});

  describe('getSelectableChoices', () => {
    it('Should return those choices that are still selectable (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countTotalChoiceSelectionsInSurveyAnswers = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02);

      const result = await service.getSelectableChoices(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(result).toEqual(filteredChoices);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(service.countTotalChoiceSelectionsInSurveyAnswers).toHaveBeenCalledTimes(4);
    });

    it('Should return those choices that are still selectable even after adding a new answer (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countTotalChoiceSelectionsInSurveyAnswers = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02AfterAddingValidAnswer);

      const result = await service.getSelectableChoices(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(result).toEqual(filteredChoicesAfterAddingValidAnswer);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(service.countTotalChoiceSelectionsInSurveyAnswers).toHaveBeenCalledTimes(4);
    });

    it('Throw error when the backendLimit is not set', async () => {
      jest.spyOn(service, 'getSelectableChoices');
      jest.spyOn(service, 'countTotalChoiceSelectionsInSurveyAnswers');

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey01);

      try {
        await service.getSelectableChoices(idOfPublicSurvey01.toString(), publicSurvey02QuestionNameWithLimiters);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e instanceof Error && e.message).toBe(SurveyErrorMessages.NoBackendLimiters);
      }

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey01.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
    });
  });
});
