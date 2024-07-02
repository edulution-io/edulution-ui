import { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { SurveyModel, SurveyDocument } from './survey.schema';
import {
  newObjectId,
  firstMockSurveyId,
  secondMockSurveyId,
  thirdMockSurveyId,
  fourthMockSurveyId,
  firstMockSurvey,
  secondMockSurvey,
  thirdMockSurvey,
  fourthMockSurvey,
  mockSurveys,
  firstUsername,
  secondUsername,
  thirdUsername,
  mockedParticipants,
  firstMockSurveyAfterAddedNewAnswer,
  secondMockSurveyAfterAddedNewAnswer,
  thirdMockSurveyAfterAddedNewAnswer,
  publicAnswerForFirstMockSurvey,
  addNewPublicAnswerToFirstMockSurvey,
  addNewPublicAnswerToSecondMockSurvey,
  addNewPublicAnswerToSecondMockSurveyFromThirdUser,
  thirdMockSurveyAddNewPublicAnswer,
  partialUpdateOnFirstMockSurveyAfterAddedNewAnswer,
  partialUpdateOnSecondMockSurveyAfterAddedNewAnswer,
} from './surveys.service.mock';
import { mockedAnswer } from './users-surveys.service.mock';
import { User, UserDocument } from '../users/user.schema';

const firstUser = {
  email: 'first@example.com',
  username: firstUsername,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [thirdMockSurveyId],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [{ surveyId: firstMockSurveyId, answer: mockedAnswer }],
  },
};

const firstUserAfterDeletingFirstSurvey = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [thirdMockSurveyId],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [],
  },
};

const firstUserAfterDeletingRemaining = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [],
    answeredSurveys: [],
  },
};

const firstUserAfterAddedAnswer = {
  ...firstUser,
  usersSurveys: {
    openSurveys: [],
    createdSurveys: [secondMockSurveyId],
    answeredSurveys: [
      { surveyId: firstMockSurveyId, answer: mockedAnswer },
      { surveyId: thirdMockSurveyId, answer: thirdMockSurveyAddNewPublicAnswer },
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
        .findSurveys({ surveyId: firstMockSurveyId })
        .then((result): void => expect(result).toEqual(firstMockSurvey))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findOneSurvey).toHaveBeenCalledWith(firstMockSurveyId);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: firstMockSurveyId });
    });

    it('should return multiple surveys given the ids', async () => {
      jest.spyOn(surveysService, 'findSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([firstMockSurvey, secondMockSurvey]),
      });

      await controller
        .findSurveys({ surveyIds: [firstMockSurveyId, secondMockSurveyId] })
        .then((result) => expect(result).toEqual([firstMockSurvey, secondMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findSurveys).toHaveBeenCalledWith([firstMockSurveyId, secondMockSurveyId]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [firstMockSurveyId, secondMockSurveyId] } });
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of a survey given the Id', async () => {
      jest.spyOn(surveysService, 'getPublicAnswers');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      await controller
        .getSurveyResult(firstMockSurveyId)
        .then((result) => expect(result).toEqual([publicAnswerForFirstMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.getPublicAnswers).toHaveBeenCalledWith(firstMockSurveyId);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: firstMockSurveyId });
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

      const result = await controller.getOpenSurveys(firstUsername);
      expect(result).toEqual([thirdMockSurvey]);

      expect(usersSurveysService.getOpenSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([thirdMockSurveyId]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [thirdMockSurveyId] } });
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

      const result = await controller.getCreatedSurveys(firstUsername);
      expect(result).toEqual([secondMockSurvey]);

      expect(usersSurveysService.getCreatedSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([secondMockSurveyId]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [secondMockSurveyId] } });
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

      const result = await controller.getAnsweredSurveys(firstUsername);
      expect(result).toEqual([firstMockSurvey]);

      expect(usersSurveysService.getAnsweredSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([firstMockSurveyId]);
      expect(surveyModel.find).toHaveBeenCalledWith({ id: { $in: [firstMockSurveyId] } });
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
        { surveyId: firstMockSurveyId, participant: firstUsername },
        firstUsername,
      );
      expect(result).toEqual(mockedAnswer);

      expect(usersSurveysService.getCommitedAnswer).toHaveBeenCalledWith(firstUsername, firstMockSurveyId);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should update a survey if it exists already', async () => {
      jest.spyOn(surveysService, 'updateSurvey');

      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });

      const result = await controller.updateOrCreateSurvey(secondMockSurvey, firstUsername);
      expect(result).toEqual(secondMockSurvey);

      expect(surveysService.updateSurvey).toHaveBeenCalledWith(secondMockSurvey);
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ id: secondMockSurveyId }, secondMockSurvey);
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

      await controller.updateOrCreateSurvey(fourthMockSurvey, firstUsername);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ id: fourthMockSurveyId }, fourthMockSurvey);
      expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith(firstUsername, fourthMockSurveyId);
      expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith(mockedParticipants, fourthMockSurveyId);
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
        await controller.updateOrCreateSurvey(secondMockSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
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
        exec: jest.fn().mockResolvedValue([firstUserAfterDeletingFirstSurvey]),
      });

      await controller.deleteSurvey({ surveyIds: [firstMockSurveyId] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([firstMockSurveyId]);
      expect(usersSurveysService.onRemoveSurveys).toHaveBeenCalledWith([firstMockSurveyId]);
    });

    it('should remove multiple surveys', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(usersSurveysService, 'onRemoveSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUserAfterDeletingFirstSurvey]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstUserAfterDeletingRemaining]),
      });

      await controller.deleteSurvey({ surveyIds: [secondMockSurveyId, thirdMockSurveyId] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([secondMockSurveyId, thirdMockSurveyId]);
      expect(usersSurveysService.onRemoveSurveys).toHaveBeenCalledWith([secondMockSurveyId, thirdMockSurveyId]);
    });

    it('should throw an error if the survey removal fails', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(false),
      });

      try {
        await controller.deleteSurvey({ surveyIds: [secondMockSurveyId, thirdMockSurveyId] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([secondMockSurveyId, thirdMockSurveyId]);
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
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
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
        exec: jest.fn().mockReturnValue(thirdMockSurveyAfterAddedNewAnswer),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUserAfterAddedAnswer),
      });

      try {
        await controller.answerSurvey(
          {
            surveyId: thirdMockSurveyId,
            answer: thirdMockSurveyAddNewPublicAnswer,
            canSubmitMultipleAnswers: false,
          },
          firstUsername,
        );
      } catch (e) {
        expect(e).toBeUndefined();
      }

      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(thirdMockSurveyId, thirdMockSurveyAddNewPublicAnswer);
      expect(usersSurveysService.addAnswer).toHaveBeenCalledWith(
        firstUsername,
        thirdMockSurveyId,
        thirdMockSurveyAddNewPublicAnswer,
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
        exec: jest.fn().mockResolvedValueOnce(firstUserAfterAddedAnswer),
      });

      try {
        await controller.answerSurvey(
          {
            surveyId: thirdMockSurveyId,
            answer: thirdMockSurveyAddNewPublicAnswer,
            canSubmitMultipleAnswers: false,
          },
          firstUsername,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }

      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(thirdMockSurveyId, thirdMockSurveyAddNewPublicAnswer);
      expect(usersSurveysService.addAnswer).toHaveBeenCalledTimes(0);
    });

    it('in order to add an public answer it has to update the survey (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurveyAfterAddedNewAnswer),
      });

      const result = await surveysService.addPublicAnswer(
        firstMockSurvey.id,
        addNewPublicAnswerToFirstMockSurvey,
        secondUsername,
        true,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: firstMockSurvey.id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: firstMockSurvey.id },
        { ...partialUpdateOnFirstMockSurveyAfterAddedNewAnswer },
      );

      expect(result).toStrictEqual(firstMockSurveyAfterAddedNewAnswer);
    });

    it('in order to add an public answer it has to update the survey (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(secondMockSurveyAfterAddedNewAnswer),
      });

      const result = await surveysService.addPublicAnswer(
        secondMockSurvey.id,
        addNewPublicAnswerToSecondMockSurveyFromThirdUser,
        thirdUsername,
        false,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: secondMockSurvey.id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: secondMockSurvey.id },
        { ...partialUpdateOnSecondMockSurveyAfterAddedNewAnswer },
      );

      expect(result).toStrictEqual(secondMockSurveyAfterAddedNewAnswer);
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
        await surveysService.addPublicAnswer(newObjectId, addNewPublicAnswerToFirstMockSurvey, secondUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToFindSurveyError);
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
          addNewPublicAnswerToFirstMockSurvey,
          'NOT_EXISTING_USER_NAME',
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurveyAfterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(firstMockSurvey.id, addNewPublicAnswerToFirstMockSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(secondMockSurveyAfterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await surveysService.addPublicAnswer(secondMockSurvey.id, addNewPublicAnswerToSecondMockSurvey, secondUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
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
          publicAnswerForFirstMockSurvey,
          'NOT_EXISTING_USER_NAME',
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
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
        await surveysService.addPublicAnswer(secondMockSurvey.id, publicAnswerForFirstMockSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });
  });
});
