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
import { HttpStatus } from '@nestjs/common';
import { getConnectionToken, getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import CustomHttpException from '../common/CustomHttpException';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import SurveyAnswersService from './survey-answers.service';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answers.schema';
import {
  answeredSurvey01,
  answeredSurvey02,
  answeredSurvey03,
  createdSurvey01,
  firstMockJWTUser,
  firstMockUser,
  firstUsername,
  firstUsersMockedAnswerForAnsweredSurveys01,
  firstUsersSurveyAnswerAnsweredSurvey01,
  idOfAnsweredSurvey01,
  idOfPublicSurvey01,
  openSurvey01,
  openSurvey02,
  publicSurvey01,
  secondMockUser,
  secondUsername,
  secondUsersSurveyAnswerAnsweredSurvey01,
  surveyAnswerAnsweredSurvey02,
  surveyAnswerAnsweredSurvey03,
  surveyUpdateInitialSurvey,
  updatedSurveyAnswerAnsweredSurvey03,
} from './mocks';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import mockCacheManager from '../common/cache-manager.mock';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveysTemplateService from './surveys-template.service';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';
import NotificationsService from '../notifications/notifications.service';
import GlobalSettingsService from '../global-settings/global-settings.service';
import { SurveysTemplate } from './surveys-template.schema';

describe(SurveysController.name, () => {
  let controller: SurveysController;
  let surveyService: SurveysService;
  let surveyAnswersService: SurveyAnswersService;
  let surveyModel: Model<SurveyDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;
  const pushMock = { notify: jest.fn() };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        SurveysService,
        SseService,
        ConfigService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        { provide: GroupsService, useValue: mockGroupsService },
        SurveysAttachmentService,
        SurveyAnswersService,
        SurveysTemplateService,
        {
          provide: getConnectionToken(),
          useValue: jest.fn(),
        },
        SurveyAnswerAttachmentsService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValueOnce([firstUsersSurveyAnswerAnsweredSurvey01]),
          },
        },
        {
          provide: getModelToken(SurveysTemplate.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            findOne: jest.fn().mockReturnThis(),
            findOneAndUpdate: jest.fn().mockReturnThis(),
            findById: jest.fn().mockReturnThis(),
            findByIdAndUpdate: jest.fn().mockReturnThis(),
            create: jest.fn().mockReturnThis(),
          },
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: NotificationsService, useValue: pushMock },
        { provide: GlobalSettingsService, useValue: { getAdminGroupsFromCache: jest.fn() } },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveyService = module.get<SurveysService>(SurveysService);
    surveyAnswersService = module.get<SurveyAnswersService>(SurveyAnswersService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('fileUpload', () => {
    it('returns 201 and file URL for allowed mime types', () => {
      const file = { filename: 'upload.png', mimetype: 'image/png' } as unknown as Express.Multer.File;
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      controller.fileUpload(file, { status } as unknown as import('express').Response);

      expect(status).toHaveBeenCalledWith(HttpStatus.CREATED);
      expect(json).toHaveBeenCalledWith('surveys/files/upload.png');
    });

    it('throws CustomHttpException on missing file (malformed upload)', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      try {
        controller.fileUpload(
          undefined as unknown as Express.Multer.File,
          { status } as unknown as import('express').Response,
        );
        fail('Expected to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as Error).message).toBe(CommonErrorMessages.FILE_NOT_PROVIDED);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });

    it('throws CustomHttpException on disallowed mime types', () => {
      const json = jest.fn();
      const status = jest.fn().mockReturnValue({ json });

      try {
        controller.fileUpload(
          { filename: 'file.txt', mimetype: 'text/plain' } as unknown as Express.Multer.File,
          { status } as unknown as import('express').Response,
        );
        fail('Expected to throw');
      } catch (e) {
        expect(e).toBeInstanceOf(CustomHttpException);
        expect((e as Error).message).toBe(CommonErrorMessages.FILE_UPLOAD_FAILED);
        expect((e as CustomHttpException).getStatus()).toBe(HttpStatus.BAD_REQUEST);
      }
    });
  });

  describe('findOne', () => {
    it('it should return a public survey given the id', async () => {
      jest.spyOn(surveyService, 'findSurvey');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(publicSurvey01),
      });

      const result = await controller.findOne({ surveyId: idOfPublicSurvey01 as unknown as string }, firstMockJWTUser);
      expect(result).toEqual(publicSurvey01);

      expect(surveyModel.findOne).toHaveBeenCalledWith({
        $and: [
          {
            $or: [
              { isPublic: true },
              { 'creator.username': firstUsername },
              { 'invitedAttendees.username': firstUsername },
              { 'invitedGroups.path': { $in: firstMockJWTUser.ldapGroups } },
            ],
          },
          { _id: idOfPublicSurvey01 },
        ],
      });
    });
  });

  describe('findByStatus', () => {
    it('[OPEN] should return a list of surveys for the requesting user filtered for the survey status (eq. OPEN)', async () => {
      jest.spyOn(surveyAnswersService, 'findUserSurveys');
      jest.spyOn(surveyAnswersService, 'getOpenSurveys');

      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const result = await controller.findByStatus(SurveyStatus.OPEN, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(surveyAnswersService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstMockJWTUser);
      expect(surveyAnswersService.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser);
    });

    it('[CREATED] should return a list of surveys for the requesting user filtered for the survey status (eq. CREATED)', async () => {
      jest.spyOn(surveyAnswersService, 'findUserSurveys');
      jest.spyOn(surveyAnswersService, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await controller.findByStatus(SurveyStatus.CREATED, firstMockJWTUser);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(surveyAnswersService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstMockJWTUser);
      expect(surveyAnswersService.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('[ANSWERED] should return a list of surveys for the requesting user filtered for the survey status (eq. ANSWERED)', async () => {
      jest.spyOn(surveyAnswersService, 'findUserSurveys');
      jest.spyOn(surveyAnswersService, 'getAnsweredSurveys');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);

      surveyModel.find = jest.fn().mockReturnValue([answeredSurvey01, answeredSurvey02]);

      const result = await controller.findByStatus(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(result).toEqual([answeredSurvey01, answeredSurvey02]);

      expect(surveyAnswersService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(surveyAnswersService.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of the participants', async () => {
      jest.spyOn(surveyAnswersService, 'getPublicAnswers');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);

      const result = await controller.getSurveyResult({ surveyId: idOfAnsweredSurvey01.toString() });
      expect(result).toEqual([
        firstUsersSurveyAnswerAnsweredSurvey01.answer,
        secondUsersSurveyAnswerAnsweredSurvey01.answer,
      ]);

      expect(surveyAnswersService.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString());
    });
  });

  describe('getSubmittedSurveyAnswers', () => {
    it('should return the submitted answer of the current user', async () => {
      jest.spyOn(surveyAnswersService, 'getAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswerCurrentUser(
        { surveyId: idOfAnsweredSurvey01.toString() },
        firstUsername,
      );
      expect(result).toEqual(firstUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswersService.getAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString(), firstUsername);
    });

    it('should return the submitted answer of a given user', async () => {
      jest.spyOn(surveyAnswersService, 'getAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswers(
        {
          surveyId: idOfAnsweredSurvey01.toString(),
          username: firstUsername,
        },
        secondUsername,
      );
      expect(result).toEqual(firstUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswersService.getAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString(), firstUsername);
    });
  });

  describe('updateOrCreateSurvey', () => {
    // it('should call the updateOrCreateSurvey() function of the surveyService', async () => {
    //   jest.spyOn(surveyService, 'updateOrCreateSurvey');
    //   surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //     exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
    //   });
    //
    //   const { id } = surveyUpdateUpdatedSurveyDto;
    //   const createSurvey = {
    //     ...surveyUpdateUpdatedSurveyDto,
    //     _id: new mongoose.Types.ObjectId(id),
    //   };
    //
    //   await controller.updateOrCreateSurvey(surveyUpdateUpdatedSurveyDto, firstMockJWTUser);
    //   expect(surveyService.updateOrCreateSurvey).toHaveBeenCalledWith(createSurvey);
    // });
  });

  describe('deleteSurvey', () => {
    it('should also remove the survey answers that are stored', async () => {
      jest.spyOn(surveyService, 'deleteSurveys');
      jest.spyOn(surveyAnswersService, 'onSurveyRemoval');
      jest.spyOn(SurveysAttachmentService, 'onSurveyRemoval');

      SurveysAttachmentService.onSurveyRemoval = jest.fn().mockImplementation(() => {});
      surveyModel.deleteMany = jest.fn().mockResolvedValueOnce(true);
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue(true);

      await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01.toString()] });

      expect(surveyService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyAnswersService.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: [idOfAnsweredSurvey01] } });
      expect(surveyAnswerModel.deleteMany).toHaveBeenCalledWith(
        { surveyId: { $in: [idOfAnsweredSurvey01] } },
        { ordered: false },
      );
    });

    it('it should not remove the survey answers if the survey deletion failed', async () => {
      jest.spyOn(surveyService, 'deleteSurveys');
      jest.spyOn(surveyAnswersService, 'onSurveyRemoval');

      surveyModel.deleteMany = jest
        .fn()
        .mockRejectedValue(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));
      surveyAnswerModel.deleteMany = jest.fn();

      try {
        await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01.toString()] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e instanceof Error && e.message).toBe(SurveyErrorMessages.DeleteError);
      }

      expect(surveyService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyAnswersService.onSurveyRemoval).toHaveBeenCalledTimes(0);
    });
  });

  describe('answerSurvey', () => {
    beforeEach(() => {
      jest
        .spyOn(mockGroupsService, 'getInvitedMembers')
        .mockResolvedValue([firstMockUser.username, secondMockUser.username]);
    });

    it('should call the addAnswer() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswersService, 'addAnswer');
      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answeredSurvey03),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(surveyAnswerAnsweredSurvey03),
      });
      surveyAnswerModel.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      const attendee = {
        username: firstMockJWTUser.preferred_username,
        firstName: firstMockJWTUser.given_name,
        lastName: firstMockJWTUser.family_name,
      } as AttendeeDto;

      await controller.answerSurvey(
        {
          surveyId: idOfAnsweredSurvey01.toString(),
          answer: firstUsersMockedAnswerForAnsweredSurveys01,
          attendee,
        },
        firstMockJWTUser,
      );

      expect(surveyAnswersService.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01.toString(),
        firstUsersMockedAnswerForAnsweredSurveys01,
        attendee,
      );
    });
  });
});
