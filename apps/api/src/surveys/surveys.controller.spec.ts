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

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CustomHttpException from '../common/CustomHttpException';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import SurveyAnswersService from './survey-answer.service';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
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
  saveNoAnsweredSurvey01,
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

describe(SurveysController.name, () => {
  let controller: SurveysController;
  let surveyService: SurveysService;
  let surveyAnswerService: SurveyAnswersService;
  let surveyModel: Model<SurveyDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [SurveysController],
      providers: [
        SurveysService,
        SseService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        { provide: GroupsService, useValue: mockGroupsService },
        SurveyAnswersService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: {
            find: jest.fn().mockReturnThis(),
            sort: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValueOnce([firstUsersSurveyAnswerAnsweredSurvey01]),
          },
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveyService = module.get<SurveysService>(SurveysService);
    surveyAnswerService = module.get<SurveyAnswersService>(SurveyAnswersService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
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
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getOpenSurveys');

      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const result = await controller.findByStatus(SurveyStatus.OPEN, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstMockJWTUser);
      expect(surveyAnswerService.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser);
    });

    it('[CREATED] should return a list of surveys for the requesting user filtered for the survey status (eq. CREATED)', async () => {
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await controller.findByStatus(SurveyStatus.CREATED, firstMockJWTUser);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstMockJWTUser);
      expect(surveyAnswerService.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('[ANSWERED] should return a list of surveys for the requesting user filtered for the survey status (eq. ANSWERED)', async () => {
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getAnsweredSurveys');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);

      surveyModel.find = jest.fn().mockReturnValue([answeredSurvey01, answeredSurvey02]);

      const result = await controller.findByStatus(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(result).toEqual([answeredSurvey01, answeredSurvey02]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(surveyAnswerService.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of the participants', async () => {
      jest.spyOn(surveyAnswerService, 'getPublicAnswers');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);

      const result = await controller.getSurveyResult({ surveyId: idOfAnsweredSurvey01.toString() });
      expect(result).toEqual([
        firstUsersSurveyAnswerAnsweredSurvey01.answer,
        secondUsersSurveyAnswerAnsweredSurvey01.answer,
      ]);

      expect(surveyAnswerService.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString());
    });
  });

  describe('getSubmittedSurveyAnswers', () => {
    it('should return the submitted answer of the current user', async () => {
      jest.spyOn(surveyAnswerService, 'getAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswerCurrentUser(
        { surveyId: idOfAnsweredSurvey01.toString() },
        firstUsername,
      );
      expect(result).toEqual(firstUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswerService.getAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString(), firstUsername);
    });

    it('should return the submitted answer of a given user', async () => {
      jest.spyOn(surveyAnswerService, 'getAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswers(
        {
          surveyId: idOfAnsweredSurvey01.toString(),
          username: firstUsername,
        },
        secondUsername,
      );
      expect(result).toEqual(firstUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswerService.getAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString(), firstUsername);
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
      jest.spyOn(surveyAnswerService, 'onSurveyRemoval');

      surveyService.onSurveyRemoval = jest.fn().mockImplementation(() => {});
      surveyModel.deleteMany = jest.fn().mockResolvedValueOnce(true);
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue(true);

      await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01.toString()] });

      expect(surveyService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyAnswerService.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: [idOfAnsweredSurvey01] } });
      expect(surveyAnswerModel.deleteMany).toHaveBeenCalledWith(
        { surveyId: { $in: [idOfAnsweredSurvey01] } },
        { ordered: false },
      );
    });

    it('it should not remove the survey answers if the survey deletion failed', async () => {
      jest.spyOn(surveyService, 'deleteSurveys');
      jest.spyOn(surveyAnswerService, 'onSurveyRemoval');

      surveyModel.deleteMany = jest
        .fn()
        .mockRejectedValue(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));
      surveyAnswerModel.deleteMany = jest.fn();

      try {
        await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01.toString()] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrorMessages.DeleteError);
      }

      expect(surveyService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01.toString()]);
      expect(surveyAnswerService.onSurveyRemoval).toHaveBeenCalledTimes(0);
    });
  });

  describe('answerSurvey', () => {
    beforeEach(() => {
      jest
        .spyOn(mockGroupsService, 'getInvitedMembers')
        .mockResolvedValue([firstMockUser.username, secondMockUser.username]);
    });

    it('should call the addAnswer() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswerService, 'addAnswer');

      surveyModel.findById = jest.fn().mockResolvedValueOnce(answeredSurvey03);
      surveyAnswerModel.findOne = jest.fn().mockResolvedValueOnce(surveyAnswerAnsweredSurvey03);
      surveyAnswerModel.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      const attendee = {
        username: firstMockJWTUser.preferred_username,
        firstName: firstMockJWTUser.given_name,
        lastName: firstMockJWTUser.family_name,
      } as AttendeeDto;

      await controller.answerSurvey(
        {
          surveyId: idOfAnsweredSurvey01.toString(),
          saveNo: saveNoAnsweredSurvey01,
          answer: firstUsersMockedAnswerForAnsweredSurveys01,
          attendee,
        },
        firstMockJWTUser,
      );

      expect(surveyAnswerService.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01.toString(),
        saveNoAnsweredSurvey01,
        firstUsersMockedAnswerForAnsweredSurveys01,
        attendee,
      );
    });
  });
});
