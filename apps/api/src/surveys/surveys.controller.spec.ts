/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import NeitherAbleToUpdateNorToCreateSurveyError from '@libs/survey/errors/neither-able-to-update-nor-to-create-survey-error';
import NotAbleToDeleteSurveyError from '@libs/survey/errors/not-able-to-delete-survey-error';
import { unknownSurvey } from './users-surveys.service.mock';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { SurveyModel, SurveyDocument } from './survey.schema';
import {
  first_username,
  // second_username,
  mocked_participants,
  id_FirstMockSurvey,
  id_SecondMockSurvey,
  firstMockSurvey,
  secondMockSurvey,
  mockSurveys,
  // secondMockSurveyDocument,
  privateAnswer_FirstMockSurvey,
} from './surveys.service.mock';
import { User, UserDocument } from '../users/user.schema';

const firstUser = {
  email: 'first@example.com',
  username: first_username,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};

describe('SurveysController', () => {
  let controller: SurveysController;
  let surveysService: SurveysService;
  let usersSurveysService: UsersSurveysService;
  let userModel: Model<UserDocument>;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        SurveysService,
        {
          provide: getModelToken(SurveyModel.name),
          useValue: jest.fn(),
        },
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
    usersSurveysService = module.get<UsersSurveysService>(UsersSurveysService);

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(SurveyModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should return the list of open (not jet participated) surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      usersSurveysService.getOpenSurveyIds = jest.fn().mockResolvedValueOnce([id_FirstMockSurvey]);
      surveysService.findSurveys = jest.fn().mockResolvedValueOnce([firstMockSurvey]);

      const result = await controller.getOpenSurveys('testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the list of surveys that the user created', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      usersSurveysService.getCreatedSurveyIds = jest.fn().mockResolvedValueOnce([id_FirstMockSurvey]);
      surveysService.findSurveys = jest.fn().mockResolvedValueOnce([firstMockSurvey]);

      const result = await controller.getCreatedSurveys('testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the list of surveys the user has participated (answered) already', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      usersSurveysService.getAnsweredSurveyIds = jest.fn().mockResolvedValueOnce([id_FirstMockSurvey]);
      surveysService.findSurveys = jest.fn().mockResolvedValueOnce([firstMockSurvey]);

      const result = await controller.getAnsweredSurveys('testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the list of public answers appended to the survey', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.findOneSurvey = jest.fn().mockResolvedValueOnce(firstMockSurvey);
      const result = await controller.getCommittedSurveyAnswers({ surveyId: id_FirstMockSurvey }, 'testUser');
      expect(result).toEqual(firstMockSurvey.publicAnswers);
    });

    it('should return the commited answer for a survey from user document', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      usersSurveysService.getCommitedAnswer = jest.fn().mockResolvedValueOnce(privateAnswer_FirstMockSurvey);
      const result = await controller.getCommittedSurveyAnswers(
        { surveyId: id_FirstMockSurvey, participant: first_username },
        'testUser',
      );
      expect(result).toEqual(privateAnswer_FirstMockSurvey);
    });

    it('should return the complete list of surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.getAllSurveys = jest.fn().mockReturnValue(mockSurveys);
      const result = await controller.getAllSurveys();
      expect(result).toEqual(mockSurveys);
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should create a survey', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      const createDto = { ...secondMockSurvey };
      surveysService.updateOrCreateSurvey = jest.fn().mockResolvedValueOnce(secondMockSurvey);
      jest.spyOn(usersSurveysService, 'addToCreatedSurveys');
      jest.spyOn(usersSurveysService, 'populateSurvey');

      const result = await controller.updateOrCreateSurvey({ ...secondMockSurvey }, 'testUser');
      expect(result).toBe(secondMockSurvey);
      expect(surveysService.updateOrCreateSurvey).toHaveBeenCalledWith(createDto);

      expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith('testUser', id_SecondMockSurvey);
      expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith(mocked_participants, id_SecondMockSurvey);
    });

    it('should throw an error if the survey creation or update fails', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });
      surveysService.updateOrCreateSurvey = jest.fn().mockRejectedValueOnce(NeitherAbleToUpdateNorToCreateSurveyError);

      const createDto = { ...secondMockSurvey };
      await expect(controller.updateOrCreateSurvey(createDto, 'testUser')).rejects.toThrow(
        NeitherAbleToUpdateNorToCreateSurveyError,
      );
    });
  });

  describe('deleteSurvey', () => {
    it('should remove a survey', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.deleteSurveys = jest.fn().mockResolvedValueOnce(true);

      const result = await controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey] });

      expect(result).toBe(true);
      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_SecondMockSurvey]);
    });

    it('should throw an error if the survey removal fails', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.deleteSurveys = jest.fn().mockRejectedValueOnce(NotAbleToDeleteSurveyError);
      await expect(controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey] })).rejects.toThrow(
        NotAbleToDeleteSurveyError,
      );
    });

    it('should return false if the survey was not found', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.deleteSurveys = jest.fn().mockResolvedValueOnce(false);
      const result = await controller.deleteSurvey({ surveyIds: [unknownSurvey] });
      expect(result).toBe(false);
    });
  });

  describe('answerSurvey', () => {
    it('should add an answer to a survey', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.addPublicAnswer = jest.fn().mockResolvedValueOnce(undefined);
      usersSurveysService.addAnswer = jest.fn().mockResolvedValueOnce(null);
      const result = await controller.answerSurvey(
        { surveyId: id_FirstMockSurvey, answer: privateAnswer_FirstMockSurvey },
        'testUser',
      );
      expect(result).toBe(true);
      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(
        id_FirstMockSurvey,
        privateAnswer_FirstMockSurvey,
        'testUser',
      );
      expect(usersSurveysService.addAnswer).toHaveBeenCalledWith(
        'testUser',
        id_FirstMockSurvey,
        privateAnswer_FirstMockSurvey,
      );
    });

    it('should throw an error if adding an answer fails', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      surveysService.addPublicAnswer = jest.fn().mockRejectedValueOnce(new Error('Survey Error (Adding Answer)'));
      await expect(
        controller.answerSurvey({ surveyId: id_FirstMockSurvey, answer: privateAnswer_FirstMockSurvey }, 'testUser'),
      ).rejects.toThrow('Survey Error (Adding Answer)');
    });
  });
});
