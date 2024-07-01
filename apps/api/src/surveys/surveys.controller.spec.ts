/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { SurveyModel, SurveyDocument } from './survey.schema';
import {
  first_username,
  second_username,
  third_username,
  id_FirstMockSurvey,
  id_SecondMockSurvey,
  id_ThirdMockSurvey,
  id_FourthMockSurvey,
  newObjectId,
  firstMockSurvey,
  secondMockSurvey,
  thirdMockSurvey,
  fourthMockSurvey,
  mockSurveys,
  mocked_participants,
  firstMockSurvey_afterAddedNewAnswer,
  secondMockSurvey_afterAddedNewAnswer,
  thirdMockSurvey_afterAddedNewAnswer,
  publicAnswer_FirstMockSurvey,
  addNewPublicAnswer_FirstMockSurvey,
  addNewPublicAnswer_SecondMockSurvey,
  addNewPublicAnswer_SecondMockSurvey_thirdUser,
  addNewPublicAnswer_ThirdMockSurvey,
  partial_firstMockSurvey_afterAddedNewAnswer,
  partial_secondMockSurvey_afterAddedNewAnswer,
} from './surveys.service.mock';
import { mockedAnswer } from './users-surveys.service.mock';
import { User, UserDocument } from '../users/user.schema';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import { HttpStatus } from '@nestjs/common';

const firstUser = {
  email: 'first@example.com',
  username: first_username,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [id_ThirdMockSurvey],
    createdSurveys: [id_SecondMockSurvey],
    answeredSurveys: [{ surveyId: id_FirstMockSurvey, answer: mockedAnswer }],
  },
};

const firstUser_afterDeletingFirstSurvey = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [id_ThirdMockSurvey],
    createdSurveys: [id_SecondMockSurvey],
    answeredSurveys: [],
  },
};

const firstUser_afterDeletingRemaining = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};

const firstUser_afterAddedAnswer = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [id_SecondMockSurvey],
    answeredSurveys: [
      { surveyId: id_FirstMockSurvey, answer: mockedAnswer },
      { surveyId: id_ThirdMockSurvey, answer: addNewPublicAnswer_ThirdMockSurvey },
    ],
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

  describe('findSurveys', () => {
    it('should return a survey given the id', async () => {
      jest.spyOn(surveysService, 'findOneSurvey');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      await controller
        .findSurveys({ surveyId: id_FirstMockSurvey })
        .then((result) => expect(result).toEqual(firstMockSurvey))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findOneSurvey).toHaveBeenCalledWith(id_FirstMockSurvey);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: id_FirstMockSurvey });
    });

    it('should return multiple surveys given the ids', async () => {
      jest.spyOn(surveysService, 'findSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([firstMockSurvey, secondMockSurvey]),
      });

      await controller
        .findSurveys({ surveyIds: [id_FirstMockSurvey, id_SecondMockSurvey] })
        .then((result) => expect(result).toEqual([firstMockSurvey, secondMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_FirstMockSurvey, id_SecondMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [id_FirstMockSurvey, id_SecondMockSurvey] } });
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of a survey given the Id', async () => {
      jest.spyOn(surveysService, 'getPublicAnswers');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      await controller
        .getSurveyResult(id_FirstMockSurvey)
        .then((result) => expect(result).toEqual([publicAnswer_FirstMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.getPublicAnswers).toHaveBeenCalledWith(id_FirstMockSurvey);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: id_FirstMockSurvey });
    });
  });

  describe('getOpenSurveys', () => {
    it('should return the list of open (not jet participated) surveys', async () => {
      jest.spyOn(usersSurveysService, 'getOpenSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([thirdMockSurvey]),
      });

      const result = await controller.getOpenSurveys(first_username);
      expect(result).toEqual([thirdMockSurvey]);

      expect(usersSurveysService.getOpenSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_ThirdMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [id_ThirdMockSurvey] } });
    });
  });

  describe('getCreatedSurveys', () => {
    it('should return the list of surveys that the user created', async () => {
      jest.spyOn(usersSurveysService, 'getCreatedSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([secondMockSurvey]),
      });

      const result = await controller.getCreatedSurveys(first_username);
      expect(result).toEqual([secondMockSurvey]);

      expect(usersSurveysService.getCreatedSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_SecondMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [id_SecondMockSurvey] } });
    });
  });

  describe('getAnsweredSurveys', () => {
    it('should return the list of surveys the user has participated (answered) already', async () => {
      jest.spyOn(usersSurveysService, 'getAnsweredSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockSurvey]),
      });

      const result = await controller.getAnsweredSurveys(first_username);
      expect(result).toEqual([firstMockSurvey]);

      expect(usersSurveysService.getAnsweredSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_FirstMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [id_FirstMockSurvey] } });
    });
  });

  describe('getAllSurveys', () => {
    it('should return the full list of surveys', async () => {
      jest.spyOn(surveysService, 'getAllSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(mockSurveys),
      });

      const result = await controller.getAllSurveys();
      expect(result).toEqual(mockSurveys);

      expect(surveysService.getAllSurveys).toHaveBeenCalledWith();
      expect(surveyModel.find).toHaveBeenCalledWith();
    });
  });

  describe('getCommittedSurveyAnswers', () => {
    it('should return the commited answer for a survey from user document', async () => {
      jest.spyOn(usersSurveysService, 'getCommitedAnswer');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockSurvey]),
      });

      const result = await controller.getCommittedSurveyAnswers(
        { surveyId: id_FirstMockSurvey, participant: first_username },
        first_username,
      );
      expect(result).toEqual(mockedAnswer);

      expect(usersSurveysService.getCommitedAnswer).toHaveBeenCalledWith(first_username, id_FirstMockSurvey);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should update a survey if it exists already', async () => {
      jest.spyOn(surveysService, 'updateSurvey');

      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });

      const result = await controller.updateOrCreateSurvey(secondMockSurvey, first_username);
      expect(result).toEqual(secondMockSurvey);

      expect(surveysService.updateSurvey).toHaveBeenCalledWith(secondMockSurvey);
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ id: id_SecondMockSurvey }, secondMockSurvey);
    });

    it('should create a survey if it does not exists already', async () => {
      jest.spyOn(surveysService, 'updateSurvey');
      jest.spyOn(surveysService, 'createSurvey');
      jest.spyOn(usersSurveysService, 'addToCreatedSurveys');
      jest.spyOn(usersSurveysService, 'populateSurvey');

      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(fourthMockSurvey),
      });

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(firstUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(firstUser),
      });

      await controller.updateOrCreateSurvey(fourthMockSurvey, first_username);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ id: id_FourthMockSurvey }, fourthMockSurvey);
      expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith(first_username, id_FourthMockSurvey);
      expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith(mocked_participants, id_FourthMockSurvey);
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockRejectedValue(
            new CustomHttpException(SurveyErrorMessages.NotAbleToUpdateSurveyError, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await controller.updateOrCreateSurvey(secondMockSurvey, first_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }
    });
  });

  describe('deleteSurvey', () => {
    it('should remove a survey', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(usersSurveysService, 'onRemoveSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUser_afterDeletingFirstSurvey]),
      });

      await controller.deleteSurvey({ surveyIds: [id_FirstMockSurvey] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_FirstMockSurvey]);
      expect(usersSurveysService.onRemoveSurveys).toHaveBeenCalledWith([id_FirstMockSurvey]);
    });

    it('should remove multiple surveys', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(usersSurveysService, 'onRemoveSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUser_afterDeletingFirstSurvey]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUser_afterDeletingRemaining]),
      });

      await controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey, id_ThirdMockSurvey] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_SecondMockSurvey, id_ThirdMockSurvey]);
      expect(usersSurveysService.onRemoveSurveys).toHaveBeenCalledWith([id_SecondMockSurvey, id_ThirdMockSurvey]);
    });

    it('should throw an error if the survey removal fails', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(false),
      });

      try {
        await controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey, id_ThirdMockSurvey] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_SecondMockSurvey, id_ThirdMockSurvey]);
    });

    it('should return false if the survey was not found', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(false),
      });

      try {
        await controller.deleteSurvey({ surveyIds: [newObjectId] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([newObjectId]);
    });
  });

  describe('answerSurvey', () => {
    it('should add an answer to a survey', async () => {
      jest.spyOn(surveysService, 'addPublicAnswer');
      jest.spyOn(usersSurveysService, 'addAnswer');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(thirdMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(thirdMockSurvey_afterAddedNewAnswer),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser_afterAddedAnswer),
      });

      try {
        await controller.answerSurvey(
          {
            surveyId: id_ThirdMockSurvey,
            answer: addNewPublicAnswer_ThirdMockSurvey,
            canSubmitMultipleAnswers: false,
          },
          first_username,
        );
      } catch (e) {
        expect(e).toBeUndefined();
      }

      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(
        id_ThirdMockSurvey,
        addNewPublicAnswer_ThirdMockSurvey,
      );
      expect(usersSurveysService.addAnswer).toHaveBeenCalledWith(
        first_username,
        id_ThirdMockSurvey,
        addNewPublicAnswer_ThirdMockSurvey,
      );
    });

    it('should throw an error if adding an answer fails', async () => {
      jest.spyOn(surveysService, 'addPublicAnswer');
      jest.spyOn(usersSurveysService, 'addAnswer');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(thirdMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValueOnce(
            new CustomHttpException(SurveyErrorMessages.NotAbleToUpdateSurveyError, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser_afterAddedAnswer),
      });

      try {
        await controller.answerSurvey(
          {
            surveyId: id_ThirdMockSurvey,
            answer: addNewPublicAnswer_ThirdMockSurvey,
            canSubmitMultipleAnswers: false,
          },
          first_username,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }

      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(
        id_ThirdMockSurvey,
        addNewPublicAnswer_ThirdMockSurvey,
      );
      expect(usersSurveysService.addAnswer).toHaveBeenCalledTimes(0);
    });

    it('in order to add an public answer it has to update the survey (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurvey_afterAddedNewAnswer),
      });

      const result = await surveysService.addPublicAnswer(
        firstMockSurvey.id,
        addNewPublicAnswer_FirstMockSurvey,
        second_username,
        true,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: firstMockSurvey.id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: firstMockSurvey.id },
        { ...partial_firstMockSurvey_afterAddedNewAnswer },
      );

      expect(result).toStrictEqual(firstMockSurvey_afterAddedNewAnswer);
    });

    it('in order to add an public answer it has to update the survey (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurvey_afterAddedNewAnswer),
      });

      const result = await surveysService.addPublicAnswer(
        secondMockSurvey.id,
        addNewPublicAnswer_SecondMockSurvey_thirdUser,
        third_username,
        false,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: secondMockSurvey.id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: secondMockSurvey.id },
        { ...partial_secondMockSurvey_afterAddedNewAnswer },
      );

      expect(result).toStrictEqual(secondMockSurvey_afterAddedNewAnswer);
    });
  });

  describe('addPublicAnswer', () => {
    it('throw an error if the survey with the surveyId was not found', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      jest.spyOn(surveyModel, 'findOne');

      try {
        await surveysService.addPublicAnswer(newObjectId, addNewPublicAnswer_FirstMockSurvey, second_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToFindSurveyError);
      }
    });

    it('throw an error if a user adds an answer that is not marked as participating user', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(
          firstMockSurvey.id,
          addNewPublicAnswer_FirstMockSurvey,
          'NOT_EXISTING_USER_NAME',
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey_afterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(firstMockSurvey.id, addNewPublicAnswer_FirstMockSurvey, first_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(secondMockSurvey_afterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(secondMockSurvey.id, addNewPublicAnswer_SecondMockSurvey, second_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockRejectedValueOnce(
            new CustomHttpException(
              SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError,
              HttpStatus.FORBIDDEN,
            ),
          ),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(
          secondMockSurvey.id,
          publicAnswer_FirstMockSurvey,
          'NOT_EXISTING_USER_NAME',
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockRejectedValueOnce(
            new CustomHttpException(
              SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError,
              HttpStatus.FORBIDDEN,
            ),
          ),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, first_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });
  });
});
