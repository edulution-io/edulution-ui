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

import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyAnswersService from './survey-answers.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answers.schema';
import {
  answeredSurvey01,
  answeredSurvey02,
  answeredSurvey03,
  answeredSurvey04,
  answeredSurvey05,
  createdSurvey01,
  filteredChoices,
  filteredChoicesAfterAddingValidAnswer,
  firstMockJWTUser,
  firstMockUser,
  firstParticipant,
  firstUsername,
  firstUsersMockedAnswerForAnsweredSurveys01,
  firstUsersSurveyAnswerAnsweredSurvey01,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfAnsweredSurvey03,
  idOfAnsweredSurvey04,
  idOfAnsweredSurvey05,
  idOfPublicSurvey01,
  idOfPublicSurvey02,
  idOfTheSurveyAnswerForTheAnsweredSurvey04,
  idOfTheSurveyAnswerForTheAnsweredSurvey05,
  mockedAnswerForAnsweredSurveys02,
  mockedAnswerForAnsweredSurveys04,
  newMockedAnswerForAnsweredSurveys05,
  newSurveyAnswerAnsweredSurvey05,
  openSurvey01,
  openSurvey02,
  publicSurvey01,
  publicSurvey02,
  publicSurvey02AfterAddingValidAnswer,
  publicSurvey02QuestionNameWithLimiters,
  secondMockUser,
  secondParticipant,
  surveyAnswerAnsweredSurvey02,
  surveyAnswerAnsweredSurvey03,
  surveyAnswerAnsweredSurvey04,
  surveyAnswerAnsweredSurvey05,
  surveyUpdateInitialSurvey,
  updatedMockedAnswerForAnsweredSurveys03,
  updatedSurveyAnswerAnsweredSurvey03,
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

describe('SurveyAnswersService', () => {
  let service: SurveyAnswersService;
  let model: Model<SurveyAnswerDocument>;
  let surveyModel: Model<SurveyDocument>;

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

    service = module.get<SurveyAnswersService>(SurveyAnswersService);
    model = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSelectableChoices', () => {
    it('Should return those choices that are still selectable (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countChoiceSelections = jest
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
      expect(service.countChoiceSelections).toHaveBeenCalledTimes(4);
    });

    it('Should return those choices that are still selectable even after adding a new answer (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countChoiceSelections = jest
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
      expect(service.countChoiceSelections).toHaveBeenCalledTimes(4);
    });

    it('Throw error when the backendLimit is not set', async () => {
      jest.spyOn(service, 'getSelectableChoices');
      jest.spyOn(service, 'countChoiceSelections');

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

  describe('getCreatedSurveys', () => {
    it('should return a list with surveys the user created', async () => {
      jest.spyOn(service, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01, answeredSurvey02]);

      const result = await service.getCreatedSurveys(firstUsername);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01, answeredSurvey02]);

      expect(service.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
      expect(surveyModel.find).toHaveBeenCalledWith({ 'creator.username': firstUsername });
    });
  });

  describe('getOpenSurveys', () => {
    it('should return a list with surveys that the user should/could participate', async () => {
      jest.spyOn(service, 'getOpenSurveys');
      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const currentDate = new Date();
      const result = await service.getOpenSurveys(firstMockJWTUser, currentDate);
      expect(result).toEqual([openSurvey01, openSurvey02]);
      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser, currentDate);

      expect(surveyModel.find).toHaveBeenCalledWith({
        $or: [
          {
            $and: [
              { isPublic: true },
              {
                $or: [
                  { $nor: [{ participatedAttendees: { $elemMatch: { username: firstUsername } } }] },
                  { canSubmitMultipleAnswers: true },
                ],
              },
              {
                $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
              },
            ],
          },
          {
            $and: [
              {
                $or: [
                  { 'invitedAttendees.username': firstUsername },
                  { 'invitedGroups.path': { $in: firstMockJWTUser.ldapGroups } },
                ],
              },
              {
                $or: [
                  { $nor: [{ participatedAttendees: { $elemMatch: { username: firstUsername } } }] },
                  { canSubmitMultipleAnswers: true },
                ],
              },
              {
                $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
              },
            ],
          },
        ],
      });
    });
  });

  describe('getAnsweredSurveys', () => {
    it('should return a list with surveys that the user has already participated in', async () => {
      jest.spyOn(service, 'getAnsweredSurveys');

      model.find = jest
        .fn()
        .mockReturnValue([
          firstUsersSurveyAnswerAnsweredSurvey01,
          surveyAnswerAnsweredSurvey02,
          surveyAnswerAnsweredSurvey05,
          surveyAnswerAnsweredSurvey04,
        ]);
      surveyModel.find = jest
        .fn()
        .mockReturnValue([answeredSurvey01, answeredSurvey02, answeredSurvey05, answeredSurvey04]);

      const result = await service.getAnsweredSurveys(firstUsername);
      expect(result).toEqual([answeredSurvey01, answeredSurvey02, answeredSurvey05, answeredSurvey04]);

      expect(service.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
      expect(model.find).toHaveBeenCalledWith({ 'attendee.username': firstUsername });
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: {
          $in: [idOfAnsweredSurvey01, idOfAnsweredSurvey02, idOfAnsweredSurvey05, idOfAnsweredSurvey04],
        },
      });
    });
  });

  describe('findUserSurveys', () => {
    it('return surveys with status OPEN', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getOpenSurveys');

      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const result = await service.findUserSurveys(SurveyStatus.OPEN, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstMockJWTUser);
      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser);
    });

    it('return surveys with status CREATED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await service.findUserSurveys(SurveyStatus.CREATED, firstMockJWTUser);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstMockJWTUser);
      expect(service.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('return surveys with status ANSWERED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getAnsweredSurveys');

      model.find = jest.fn().mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);
      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, answeredSurvey01, answeredSurvey02]);

      const result = await service.findUserSurveys(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, answeredSurvey01, answeredSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(service.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
    });
  });

  describe('addAnswer', () => {
    beforeEach(() => {
      jest
        .spyOn(mockGroupsService, 'getInvitedMembers')
        .mockResolvedValue([firstMockUser.username, secondMockUser.username]);
    });

    it('should return an error if the survey was not found', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });

      const id = new Types.ObjectId().toString();

      try {
        await service.addAnswer(id, {} as JSON, firstParticipant);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e instanceof Error && e.message).toBe(SurveyErrorMessages.NotFoundError);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(id, {} as JSON, firstParticipant);
    });

    it('should return an error if the survey has already expired', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answeredSurvey01),
      });
      model.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      model.create = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      model.findByIdAndUpdate = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(answeredSurvey01);

      try {
        await service.addAnswer(
          idOfAnsweredSurvey01.toString(),
          firstUsersMockedAnswerForAnsweredSurveys01,
          firstParticipant,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e instanceof Error && e.message).toBe(SurveyErrorMessages.ParticipationErrorSurveyExpired);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01.toString(),
        firstUsersMockedAnswerForAnsweredSurveys01,
        firstParticipant,
      );
    });

    it('should return an error if the user is no participant (or creator)', async () => {
      // jest.spyOn(service, 'addAnswer');
      //
      // surveyModel.findOne = jest.fn().mockReturnValue(answeredSurvey02);
      // surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey02);
      // surveyModel.create = jest.fn().mockReturnValue(answeredSurvey02);
      // model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey02);
      //
      // try {
      //   await service.addAnswer(
      //     idOfAnsweredSurvey02.toString(),
      //     saveNoAnsweredSurvey02,
      //     mockedAnswerForAnsweredSurveys02,
      //     firstParticipant,
      //   );
      // } catch (e) {
      //   expect(e).toBeInstanceOf(Error);
      //   expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorUserNotAssigned);
      // }
      //
      // expect(service.addAnswer).toHaveBeenCalledWith(
      //   idOfAnsweredSurvey02.toString(),
      //   saveNoAnsweredSurvey02,
      //   mockedAnswerForAnsweredSurveys02,
      //   firstParticipant,
      // );
    });

    it(
      'should return an error if the has already participated and can not' +
        ' update the answer or submit multiple answers',
      async () => {
        jest.spyOn(service, 'addAnswer');

        surveyModel.findById = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(answeredSurvey02),
        });
        model.findOne = jest.fn().mockReturnValue({
          exec: jest.fn().mockResolvedValue(answeredSurvey02),
        });

        try {
          await service.addAnswer(idOfAnsweredSurvey02.toString(), mockedAnswerForAnsweredSurveys02, secondParticipant);
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e instanceof Error && e.message).toBe(SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError);
        }

        expect(service.addAnswer).toHaveBeenCalledWith(
          idOfAnsweredSurvey02.toString(),
          mockedAnswerForAnsweredSurveys02,
          secondParticipant,
        );
      },
    );

    it('should update the former answer of the user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answeredSurvey03),
      });

      model.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(surveyAnswerAnsweredSurvey03),
      });
      model.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      const result = await service.addAnswer(
        idOfAnsweredSurvey03.toString(),
        updatedMockedAnswerForAnsweredSurveys03,
        firstParticipant,
      );
      expect(result).toEqual(updatedSurveyAnswerAnsweredSurvey03);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey03.toString(),
        updatedMockedAnswerForAnsweredSurveys03,
        firstParticipant,
      );
    });

    it('should create an answer object if there is none for the survey submitted by the given user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answeredSurvey04),
      });
      model.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      model.create = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey04);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey04,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey04],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey04.toString(),
        mockedAnswerForAnsweredSurveys04,
        firstParticipant,
      );
      expect(result).toEqual(surveyAnswerAnsweredSurvey04);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey04.toString(),
        mockedAnswerForAnsweredSurveys04,
        firstParticipant,
      );
    });

    it('should also create an answer object if the users can submit multiple answers', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answeredSurvey05),
      });
      model.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(surveyAnswerAnsweredSurvey05),
      });
      model.create = jest.fn().mockReturnValue(newSurveyAnswerAnsweredSurvey05);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey05,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey05],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey05.toString(),
        newMockedAnswerForAnsweredSurveys05,
        firstParticipant,
      );
      expect(result).toEqual(newSurveyAnswerAnsweredSurvey05);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey05.toString(),
        newMockedAnswerForAnsweredSurveys05,
        firstParticipant,
      );
    });
  });

  describe('getPrivateAnswer', () => {
    // it('should return the submitted answer of a given user', async () => {
    //   jest.spyOn(service, 'getPrivateAnswer');
    //
    //   model.findOne = jest.fn().mockReturnValue(secondUsersSurveyAnswerAnsweredSurvey01);
    //
    //   const result = await service.getPrivateAnswer(idOfAnsweredSurvey01.toString(), secondUsername);
    //   expect(result).toEqual(secondUsersSurveyAnswerAnsweredSurvey01);
    //
    //   expect(service.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, secondUsername);
    // });
  });

  describe('getPublicAnswers', () => {
    // it('should return the public answers the users submitted', async () => {
    //   jest.spyOn(service, 'getPublicAnswers');
    //
    //   model.find = jest
    //     .fn()
    //     .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);
    //
    //   const result = await service.getPublicAnswers(idOfAnsweredSurvey01.toString());
    //   expect(result).toEqual([
    //     firstUsersSurveyAnswerAnsweredSurvey01.answer,
    //     secondUsersSurveyAnswerAnsweredSurvey01.answer,
    //   ]);
    //
    //   expect(service.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString());
    // });
  });

  describe('onSurveyRemoval', () => {
    // it('should also remove the survey answers that are stored', async () => {
    //   jest.spyOn(service, 'onSurveyRemoval');
    //
    //   model.deleteMany = jest.fn().mockResolvedValueOnce(true);
    //
    //   await service.onSurveyRemoval([idOfAnsweredSurvey01.toString()]);
    //
    //   expect(service.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01]);
    //   expect(model.deleteMany).toHaveBeenCalledWith({ surveyId: { $in: [idOfAnsweredSurvey01] } }, { ordered: false });
    // });
  });
});
