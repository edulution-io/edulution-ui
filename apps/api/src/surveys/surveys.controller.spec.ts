/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
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
  firstUsername,
  firstUsersMockedAnswerForAnsweredSurveys01,
  firstUsersSurveyAnswerAnsweredSurvey01,
  idOfAnsweredSurvey01,
  openSurvey01,
  openSurvey02,
  saveNoAnsweredSurvey01,
  secondUsername,
  secondUsersSurveyAnswerAnsweredSurvey01,
  surveyAnswerAnsweredSurvey02,
  surveyAnswerAnsweredSurvey03,
  surveyUpdateInitialSurvey,
  surveyUpdateUpdatedSurvey,
  updatedSurveyAnswerAnsweredSurvey03,
} from './mocks';
import { surveyUpdateUpdatedSurveyDto } from './mocks/surveys/updated-survey';
import UserConnections from '../types/userConnections';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

const mockSseConnections: UserConnections = new Map();

describe(SurveysController.name, () => {
  let controller: SurveysController;
  let surveysService: SurveysService;
  let surveyAnswerService: SurveyAnswersService;
  let surveyModel: Model<SurveyDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [SurveysController],
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveyAnswersService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
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

  describe('find', () => {
    it('[OPEN] should return a list of surveys for the requesting user filtered for the survey status (eq. OPEN)', async () => {
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getOpenSurveys');

      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const result = await controller.find(SurveyStatus.OPEN, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstMockJWTUser);
      expect(surveyAnswerService.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser);
    });

    it('[CREATED] should return a list of surveys for the requesting user filtered for the survey status (eq. CREATED)', async () => {
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await controller.find(SurveyStatus.CREATED, firstMockJWTUser);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstMockJWTUser);
      expect(surveyAnswerService.getCreatedSurveys).toHaveBeenCalledWith(firstMockJWTUser.name);
    });

    it('[ANSWERED] should return a list of surveys for the requesting user filtered for the survey status (eq. ANSWERED)', async () => {
      jest.spyOn(surveyAnswerService, 'findUserSurveys');
      jest.spyOn(surveyAnswerService, 'getAnsweredSurveys');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);

      surveyModel.find = jest.fn().mockReturnValue([answeredSurvey01, answeredSurvey02]);

      const result = await controller.find(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(result).toEqual([answeredSurvey01, answeredSurvey02]);

      expect(surveyAnswerService.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(surveyAnswerService.getAnsweredSurveys).toHaveBeenCalledWith(firstMockJWTUser.name);
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of the participants', async () => {
      jest.spyOn(surveyAnswerService, 'getPublicAnswers');

      surveyAnswerModel.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);

      const result = await controller.getSurveyResult(idOfAnsweredSurvey01);
      expect(result).toEqual([
        firstUsersSurveyAnswerAnsweredSurvey01.answer,
        secondUsersSurveyAnswerAnsweredSurvey01.answer,
      ]);

      expect(surveyAnswerService.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01);
    });
  });

  describe('getSubmittedSurveyAnswers', () => {
    it('should return the submitted answer of the current user', async () => {
      jest.spyOn(surveyAnswerService, 'getPrivateAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswers(
        { surveyId: idOfAnsweredSurvey01, attendee: undefined },
        firstUsername,
      );
      expect(result).toEqual(firstUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswerService.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, firstUsername);
    });

    it('should return the submitted answer of a given user', async () => {
      jest.spyOn(surveyAnswerService, 'getPrivateAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue(secondUsersSurveyAnswerAnsweredSurvey01);

      const result = await controller.getSubmittedSurveyAnswers(
        { surveyId: idOfAnsweredSurvey01, attendee: secondUsername },
        firstUsername,
      );
      expect(result).toEqual(secondUsersSurveyAnswerAnsweredSurvey01);

      expect(surveyAnswerService.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, secondUsername);
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should call the updateOrCreateSurvey() function of the surveyService', async () => {
      jest.spyOn(surveysService, 'updateOrCreateSurvey');
      surveyModel.findOne = jest
        .fn()
        .mockReturnValue({
          exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
        })
        .mockReturnValueOnce({
          exec: jest.fn().mockReturnValue(surveyUpdateInitialSurvey),
        });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
      });

      await controller.updateOrCreateSurvey(surveyUpdateUpdatedSurveyDto, firstMockJWTUser);
      expect(surveysService.updateOrCreateSurvey).toHaveBeenCalledWith(
        surveyUpdateUpdatedSurveyDto,
        firstMockJWTUser,
        mockSseConnections,
      );
    });
  });

  describe('deleteSurvey', () => {
    it('should also remove the survey answers that are stored', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(surveyAnswerService, 'onSurveyRemoval');

      surveyModel.deleteMany = jest.fn().mockResolvedValueOnce(true);
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue(true);

      await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01], mockSseConnections);
      expect(surveyAnswerService.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01]);
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: [idOfAnsweredSurvey01] } });
      expect(surveyAnswerModel.deleteMany).toHaveBeenCalledWith(
        { surveyId: { $in: [idOfAnsweredSurvey01] } },
        { ordered: false },
      );
    });

    it('it should not remove the survey answers if the survey deletion failed', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(surveyAnswerService, 'onSurveyRemoval');

      surveyModel.deleteMany = jest
        .fn()
        .mockRejectedValue(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));
      surveyAnswerModel.deleteMany = jest.fn();

      try {
        await controller.deleteSurvey({ surveyIds: [idOfAnsweredSurvey01] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrorMessages.DeleteError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([idOfAnsweredSurvey01], mockSseConnections);
      expect(surveyAnswerService.onSurveyRemoval).toHaveBeenCalledTimes(0);
    });
  });

  describe('answerSurvey', () => {
    it('should call the addAnswer() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswerService, 'addAnswer');

      surveyModel.findById = jest.fn().mockResolvedValueOnce(answeredSurvey03);
      surveyAnswerModel.findOne = jest.fn().mockResolvedValueOnce(surveyAnswerAnsweredSurvey03);
      surveyAnswerModel.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      await controller.answerSurvey(
        {
          surveyId: idOfAnsweredSurvey01,
          saveNo: saveNoAnsweredSurvey01,
          answer: firstUsersMockedAnswerForAnsweredSurveys01,
        },
        firstMockJWTUser,
      );

      expect(surveyAnswerService.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01,
        saveNoAnsweredSurvey01,
        firstMockJWTUser,
        firstUsersMockedAnswerForAnsweredSurveys01,
      );
    });
  });
});
