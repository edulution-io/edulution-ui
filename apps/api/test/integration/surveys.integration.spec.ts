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

import { INestApplication, HttpStatus } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { APP_GUARD } from '@nestjs/core';
import request from 'supertest';
import {
  SURVEYS,
  FIND_ONE,
  ANSWER,
  RESULT,
  CAN_PARTICIPATE,
  HAS_ANSWERS,
} from '@libs/survey/constants/surveys-endpoint';
import SurveysController from '../../src/surveys/surveys.controller';
import SurveysService from '../../src/surveys/surveys.service';
import SurveysTemplateService from '../../src/surveys/surveys-template.service';
import SurveyAnswersService from '../../src/surveys/survey-answers.service';
import SurveyAnswerAttachmentsService from '../../src/surveys/survey-answer-attachments.service';
import FilesystemService from '../../src/filesystem/filesystem.service';
import GlobalSettingsService from '../../src/global-settings/global-settings.service';
import { TEST_USER, MockAuthGuard, MockAccessGuard } from './createTestApp';

const BASE = `/edu-api/${SURVEYS}`;
const SURVEY_ID = '507f1f77bcf86cd799439011';

describe('Surveys Integration', () => {
  let app: INestApplication;
  let surveysService: Record<string, jest.Mock>;
  let surveyAnswerService: Record<string, jest.Mock>;
  let surveysTemplateService: Record<string, jest.Mock>;

  beforeAll(async () => {
    const mockSurvey = {
      _id: SURVEY_ID,
      formula: { title: 'Test Survey', pages: [] },
      saveNo: 1,
      creator: { username: 'testuser', firstName: 'Test', lastName: 'User' },
      invitedAttendees: [],
      invitedGroups: [],
      participatedAttendees: [],
      answers: [],
    };

    surveysService = {
      findSurvey: jest.fn().mockResolvedValue(mockSurvey),
      updateOrCreateSurvey: jest.fn().mockResolvedValue(mockSurvey),
      deleteSurveys: jest.fn().mockResolvedValue(undefined),
      throwErrorIfUserIsNotCreator: jest.fn().mockResolvedValue(undefined),
      throwErrorIfSurveyIsNotAccessible: jest.fn().mockResolvedValue(undefined),
    };

    surveyAnswerService = {
      findUserSurveys: jest.fn().mockResolvedValue([mockSurvey]),
      canUserParticipateSurvey: jest.fn().mockResolvedValue(true),
      hasAlreadySubmittedSurveyAnswers: jest.fn().mockResolvedValue(false),
      getPublicAnswers: jest.fn().mockResolvedValue([]),
      getAnswer: jest.fn().mockResolvedValue({ answer: {} }),
      addAnswer: jest.fn().mockResolvedValue({ _id: 'answer-1', surveyId: SURVEY_ID }),
      onSurveyRemoval: jest.fn().mockResolvedValue(undefined),
      getSelectableChoices: jest.fn().mockResolvedValue([]),
    };

    surveysTemplateService = {
      updateOrCreateTemplateDocument: jest.fn().mockResolvedValue({ name: 'template-1' }),
      getTemplates: jest.fn().mockImplementation((_groups: string[], res: { json: (data: unknown) => void }) => {
        res.json([]);
      }),
      deleteTemplate: jest.fn().mockResolvedValue(undefined),
      setIsTemplateActive: jest.fn().mockResolvedValue(undefined),
    };

    const mockGlobalSettingsService = {
      getAdminGroupsFromCache: jest.fn().mockResolvedValue(['/role-globaladministrator']),
    };

    const moduleFixture = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        { provide: SurveysService, useValue: surveysService },
        { provide: SurveyAnswersService, useValue: surveyAnswerService },
        { provide: SurveysTemplateService, useValue: surveysTemplateService },
        { provide: SurveyAnswerAttachmentsService, useValue: {} },
        { provide: FilesystemService, useValue: { serveFile: jest.fn(), serveTempFile: jest.fn() } },
        { provide: GlobalSettingsService, useValue: mockGlobalSettingsService },
        { provide: APP_GUARD, useValue: new MockAuthGuard(TEST_USER) },
        { provide: APP_GUARD, useValue: new MockAccessGuard() },
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('edu-api');
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('GET /edu-api/surveys', () => {
    it('returns surveys for current user by status', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}?status=open`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith('open', TEST_USER);
    });
  });

  describe('GET /edu-api/surveys/id/:surveyId', () => {
    it('returns a single survey by ID', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${FIND_ONE}/${SURVEY_ID}`);

      expect(response.status).toBe(HttpStatus.OK);
      // eslint-disable-next-line no-underscore-dangle
      expect(response.body._id).toBe(SURVEY_ID);
      expect(surveysService.findSurvey).toHaveBeenCalledWith(SURVEY_ID, TEST_USER);
    });
  });

  describe('GET /edu-api/surveys/can-participate/:surveyId', () => {
    it('returns participation status', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${CAN_PARTICIPATE}/${SURVEY_ID}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(surveyAnswerService.canUserParticipateSurvey).toHaveBeenCalledWith(
        SURVEY_ID,
        TEST_USER.preferred_username,
      );
    });
  });

  describe('GET /edu-api/surveys/has-answers/:surveyId', () => {
    it('returns whether survey has answers', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${HAS_ANSWERS}/${SURVEY_ID}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(surveyAnswerService.hasAlreadySubmittedSurveyAnswers).toHaveBeenCalledWith(SURVEY_ID);
    });
  });

  describe('GET /edu-api/surveys/results/:surveyId', () => {
    it('returns survey results', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${RESULT}/${SURVEY_ID}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(Array.isArray(response.body)).toBe(true);
      expect(surveyAnswerService.getPublicAnswers).toHaveBeenCalledWith(SURVEY_ID);
    });
  });

  describe('POST /edu-api/surveys', () => {
    it('creates or updates a survey', async () => {
      const surveyDto = {
        formula: { title: 'New Survey', pages: [] },
        saveNo: 1,
        invitedAttendees: [],
        invitedGroups: [],
      };

      const response = await request(app.getHttpServer()).post(BASE).send(surveyDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(surveysService.updateOrCreateSurvey).toHaveBeenCalled();
    });
  });

  describe('POST /edu-api/surveys/answers', () => {
    it('submits a survey answer', async () => {
      const answerDto = {
        surveyId: SURVEY_ID,
        answer: [{ questionId: 'q1', value: 'test answer' }],
      };

      const response = await request(app.getHttpServer()).post(`${BASE}/${ANSWER}`).send(answerDto);

      expect(response.status).toBe(HttpStatus.CREATED);
      expect(surveysService.throwErrorIfSurveyIsNotAccessible).toHaveBeenCalledWith(SURVEY_ID, TEST_USER);
      expect(surveyAnswerService.addAnswer).toHaveBeenCalled();
    });
  });

  describe('DELETE /edu-api/surveys', () => {
    it('deletes surveys by IDs', async () => {
      const response = await request(app.getHttpServer())
        .delete(BASE)
        .send({ surveyIds: [SURVEY_ID] });

      expect(response.status).toBe(HttpStatus.OK);
      expect(surveysService.throwErrorIfUserIsNotCreator).toHaveBeenCalledWith(SURVEY_ID, TEST_USER);
      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([SURVEY_ID]);
      expect(surveyAnswerService.onSurveyRemoval).toHaveBeenCalledWith([SURVEY_ID]);
    });
  });

  describe('GET /edu-api/surveys/answers/:surveyId', () => {
    it('returns submitted answer for current user', async () => {
      const response = await request(app.getHttpServer()).get(`${BASE}/${ANSWER}/${SURVEY_ID}`);

      expect(response.status).toBe(HttpStatus.OK);
      expect(surveyAnswerService.getAnswer).toHaveBeenCalledWith(SURVEY_ID, TEST_USER.preferred_username);
    });
  });

  describe('Permissions enforcement', () => {
    it('DELETE verifies creator before deleting', async () => {
      surveysService.throwErrorIfUserIsNotCreator.mockRejectedValueOnce({
        status: HttpStatus.FORBIDDEN,
        message: 'Not the creator',
        getStatus: () => HttpStatus.FORBIDDEN,
        getResponse: () => 'Not the creator',
      });

      const response = await request(app.getHttpServer())
        .delete(BASE)
        .send({ surveyIds: [SURVEY_ID] });

      expect(response.status).toBe(HttpStatus.INTERNAL_SERVER_ERROR);
      expect(surveysService.deleteSurveys).not.toHaveBeenCalled();
    });
  });
});
