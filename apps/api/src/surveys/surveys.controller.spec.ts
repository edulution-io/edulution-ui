/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/survey-answer-error-messages';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyAnswersService from './survey-answer.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import UsersSurveysService from './users-surveys.service';
import { User, UserDocument } from '../users/user.schema';
import {
  idOfAnsweredSurvey01,
  answeredSurvey01,
  idOfAnswerFromFirstUserForAnsweredSurvey01,
  answerFromFirstUserForAnsweredSurvey01,
  idOfAnsweredSurvey02,
  answeredSurvey02,
  answerFromFirstUserForAnsweredSurvey02,
} from './mocks/answered-surveys';
import { firstUsername } from './mocks/usernames';
import {
  idOfTheOpenSurvey,
  theOpenSurvey,
  mockedAnswerForOpenSurvey,
  answerFromFirstUserToAnswerTheOpenSurvey,
} from './mocks/answer-the-open-survey';
import { firstMockUser, thirdMockUser } from './mocks/users';
import { newId, unknownId } from './mocks/unknown-survey-id';
import { idOfOpenSurvey01, openSurvey01 } from './mocks/open-surveys';
import { idOfCreatedSurvey01, createdSurvey01 } from './mocks/created-surveys';
import {
  idOfDistributedSurvey,
  distributedSurvey,
  idOfAnswerFromFirstUserForDistributedSurvey,
} from './mocks/distributed-survey';
import {
  idOfTheCreatedSurvey,
  theCreatedSurvey,
  theCreatedSurveyDto,
  theUpdatedCreatedSurvey,
  theUpdatedCreatedSurveyDto,
} from './mocks/update-the-created-survey';
import { mockedParticipants } from './mocks/participants';
import { mockedSurveys } from './mocks/surveys';
import {
  userSurveysAfterAnsweringOpenSurveyFirstUser,
  userSurveysAfterCreatingNewSurveyFirstUser,
  userSurveysAfterRemoveDistributedSurveyFirstUser,
  userSurveysAfterRemoveMultipleSurveysFirstUser,
  userSurveysAfterRemoveOpenSurveyFirstUser,
} from './mocks/users-surveys';

describe('SurveysController', () => {
  let controller: SurveysController;
  let surveysService: SurveysService;
  let usersSurveysService: UsersSurveysService;
  let surveyAnswersService: SurveyAnswersService;
  let userModel: Model<UserDocument>;
  let surveyModel: Model<SurveyDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(),
        },
        SurveyAnswersService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
    usersSurveysService = module.get<UsersSurveysService>(UsersSurveysService);
    surveyAnswersService = module.get<SurveyAnswersService>(SurveyAnswersService);

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
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
        exec: jest.fn().mockResolvedValueOnce(distributedSurvey),
      });

      await controller
        .findSurveys({ surveyId: idOfDistributedSurvey })
        .then((result): void => expect(result).toEqual(distributedSurvey))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findOneSurvey).toHaveBeenCalledWith(idOfDistributedSurvey);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: idOfDistributedSurvey });
    });

    it('should return multiple surveys given the ids', async () => {
      jest.spyOn(surveysService, 'findSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([theOpenSurvey, theCreatedSurvey, distributedSurvey]),
      });

      await controller
        .findSurveys({ surveyIds: [idOfTheOpenSurvey, idOfTheCreatedSurvey, idOfDistributedSurvey] })
        .then((result) => expect(result).toEqual([theOpenSurvey, theCreatedSurvey, distributedSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findSurveys).toHaveBeenCalledWith([
        idOfTheOpenSurvey,
        idOfTheCreatedSurvey,
        idOfDistributedSurvey,
      ]);
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: { $in: [idOfTheOpenSurvey, idOfTheCreatedSurvey, idOfDistributedSurvey] },
      });
    });
  });

  describe('getOpenSurveys', () => {
    it('should return the list of open (not jet participated) surveys', async () => {
      jest.spyOn(usersSurveysService, 'getOpenSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([theOpenSurvey, openSurvey01, distributedSurvey]),
      });

      const result = await controller.getOpenSurveys(firstUsername);
      expect(result).toEqual([theOpenSurvey, openSurvey01, distributedSurvey]);

      expect(usersSurveysService.getOpenSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([
        idOfTheOpenSurvey,
        idOfOpenSurvey01,
        idOfDistributedSurvey,
      ]);
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: { $in: [idOfTheOpenSurvey, idOfOpenSurvey01, idOfDistributedSurvey] },
      });
    });
  });

  describe('getCreatedSurveys', () => {
    it('should return the list of surveys that the user created', async () => {
      jest.spyOn(usersSurveysService, 'getCreatedSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([theCreatedSurvey, createdSurvey01, distributedSurvey]),
      });

      const result = await controller.getCreatedSurveys(firstUsername);
      expect(result).toEqual([theCreatedSurvey, createdSurvey01, distributedSurvey]);

      expect(usersSurveysService.getCreatedSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([
        idOfTheCreatedSurvey,
        idOfCreatedSurvey01,
        idOfDistributedSurvey,
      ]);
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: { $in: [idOfTheCreatedSurvey, idOfCreatedSurvey01, idOfDistributedSurvey] },
      });
    });
  });

  describe('getAnsweredSurveys', () => {
    it('should return the list of surveys the user has participated (answered) already', async () => {
      jest.spyOn(usersSurveysService, 'getAnsweredSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([theOpenSurvey, answeredSurvey01, answeredSurvey02]),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValueOnce([
            answerFromFirstUserToAnswerTheOpenSurvey,
            answerFromFirstUserForAnsweredSurvey01,
            answerFromFirstUserForAnsweredSurvey02,
          ]),
      });

      const result = await controller.getAnsweredSurveys(firstUsername);
      expect(result).toEqual([theOpenSurvey, answeredSurvey01, answeredSurvey02]);

      expect(usersSurveysService.getAnsweredSurveyIds).toHaveBeenCalledWith(firstUsername);
      expect(surveysService.findSurveys).toHaveBeenCalledWith([
        idOfTheOpenSurvey,
        idOfAnsweredSurvey01,
        idOfAnsweredSurvey02,
      ]);
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: { $in: [idOfTheOpenSurvey, idOfAnsweredSurvey01, idOfAnsweredSurvey02] },
      });
    });
  });

  describe('getAllSurveys', () => {
    it('should return the full list of surveys', async () => {
      jest.spyOn(surveysService, 'getAllSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(mockedSurveys),
      });

      const result = await controller.getAllSurveys();
      expect(result).toEqual(mockedSurveys);

      expect(surveysService.getAllSurveys).toHaveBeenCalledWith();
      expect(surveyModel.find).toHaveBeenCalledWith();
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should update a survey if it exists already', async () => {
      jest.spyOn(surveysService, 'updateSurvey');

      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(theUpdatedCreatedSurvey),
      });

      const result = await controller.updateOrCreateSurvey(theUpdatedCreatedSurveyDto, firstUsername);
      expect(result).toEqual(theUpdatedCreatedSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: idOfTheCreatedSurvey }, theUpdatedCreatedSurvey);
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
        exec: jest.fn().mockResolvedValue(theCreatedSurvey),
      });

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterCreatingNewSurveyFirstUser,
        }),
      });

      await controller.updateOrCreateSurvey(theCreatedSurveyDto, firstUsername);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: idOfTheCreatedSurvey }, theCreatedSurvey);
      expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith(firstUsername, idOfTheCreatedSurvey);
      expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith(mockedParticipants, idOfTheCreatedSurvey);
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
        await controller.updateOrCreateSurvey(theUpdatedCreatedSurveyDto, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }
    });
  });

  describe('deleteSurvey', () => {
    it('should remove a survey', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(surveyAnswersService, 'onSurveyRemoval');
      jest.spyOn(usersSurveysService, 'updateUsersOnSurveyRemoval');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([
          {
            ...firstMockUser,
            usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser,
          },
        ]),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([answerFromFirstUserForAnsweredSurvey01]),
      });
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });

      await controller.deleteSurvey({ surveyIds: [idOfTheOpenSurvey] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([idOfTheOpenSurvey]);
      expect(usersSurveysService.updateUsersOnSurveyRemoval).toHaveBeenCalledWith([idOfTheOpenSurvey]);
    });

    it('should remove multiple surveys', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(surveyAnswersService, 'onSurveyRemoval');
      jest.spyOn(usersSurveysService, 'updateUsersOnSurveyRemoval');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser,
        }),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([idOfAnswerFromFirstUserForAnsweredSurvey01]),
      });
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });

      await controller.deleteSurvey({ surveyIds: [idOfOpenSurvey01, idOfCreatedSurvey01, idOfAnsweredSurvey01] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([
        idOfOpenSurvey01,
        idOfCreatedSurvey01,
        idOfAnsweredSurvey01,
      ]);
      expect(usersSurveysService.updateUsersOnSurveyRemoval).toHaveBeenCalledWith([
        idOfOpenSurvey01,
        idOfCreatedSurvey01,
        idOfAnsweredSurvey01,
      ]);
    });

    it('should remove one survey from multiple survey lists', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');
      jest.spyOn(surveyAnswersService, 'onSurveyRemoval');
      jest.spyOn(usersSurveysService, 'updateUsersOnSurveyRemoval');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser,
        }),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([idOfAnswerFromFirstUserForDistributedSurvey]),
      });
      surveyAnswerModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(true),
      });

      await controller.deleteSurvey({ surveyIds: [idOfDistributedSurvey] });

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([idOfDistributedSurvey]);
      expect(usersSurveysService.updateUsersOnSurveyRemoval).toHaveBeenCalledWith([idOfDistributedSurvey]);
    });

    it('should throw an error if the survey removal fails', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(false),
      });

      try {
        await controller.deleteSurvey({ surveyIds: [idOfOpenSurvey01, idOfCreatedSurvey01, idOfAnsweredSurvey01] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([
        idOfOpenSurvey01,
        idOfCreatedSurvey01,
        idOfAnsweredSurvey01,
      ]);
    });

    it('should return false if the survey was not found', async () => {
      jest.spyOn(surveysService, 'deleteSurveys');

      surveyModel.deleteMany = jest.fn().mockReturnValue({
        exec: jest.fn().mockRejectedValueOnce(false),
      });

      try {
        await controller.deleteSurvey({ surveyIds: [newId] });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToDeleteSurveyError);
      }

      expect(surveysService.deleteSurveys).toHaveBeenCalledWith([newId]);
    });
  });

  describe('answerSurvey', () => {
    it('should add an answer to a survey', async () => {
      jest.spyOn(surveyAnswersService, 'addAnswer');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(theOpenSurvey),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...firstMockUser,
          usersSurveys: userSurveysAfterAnsweringOpenSurveyFirstUser,
        }),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      surveyAnswerModel.create = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      try {
        await controller.answerSurvey(
          { surveyId: idOfTheOpenSurvey, answer: mockedAnswerForOpenSurvey },
          firstUsername,
        );
      } catch (e) {
        expect(e).toBeUndefined();
      }

      expect(surveyAnswersService.addAnswer).toHaveBeenCalledWith(
        idOfTheOpenSurvey,
        mockedAnswerForOpenSurvey,
        firstUsername,
      );
    });

    it('should throw an error if adding an answer fails', async () => {
      jest.spyOn(surveyAnswersService, 'addAnswer');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(theOpenSurvey),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce({
          ...firstMockUser,
          usersSurveys: userSurveysAfterAnsweringOpenSurveyFirstUser,
        }),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      try {
        await controller.answerSurvey(
          {
            surveyId: idOfTheOpenSurvey,
            answer: mockedAnswerForOpenSurvey,
          },
          firstUsername,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }

      expect(surveyAnswersService.addAnswer).toHaveBeenCalledTimes(1);
    });

    it('throw an error if the survey with the surveyId was not found', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      jest.spyOn(surveyModel, 'findOne');

      try {
        await surveyAnswersService.addAnswer(unknownId, mockedAnswerForOpenSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToFindSurveyError);
      }
    });

    it('throw an error if a user adds an answer that is not marked as participating user', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(idOfTheOpenSurvey),
      });
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(thirdMockUser),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      try {
        await surveyAnswersService.addAnswer(idOfTheOpenSurvey, mockedAnswerForOpenSurvey, 'NOT_EXISTING_USER_NAME');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(theOpenSurvey),
      });

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockUser),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockRejectedValueOnce(
            new CustomHttpException(
              SurveyAnswerErrorMessages.NotAbleToUpdateSurveyAnswerError,
              HttpStatus.INTERNAL_SERVER_ERROR,
            ),
          ),
      });

      try {
        await surveyAnswersService.addAnswer(idOfTheOpenSurvey, mockedAnswerForOpenSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect((e as Error).message).toBe(SurveyAnswerErrorMessages.NotAbleToUpdateSurveyAnswerError);
      }
    });
  });

  describe('getPrivateAnswer', () => {
    it('should return the commited answer for a survey from user document', async () => {
      jest.spyOn(surveyAnswersService, 'getPrivateAnswer');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([answeredSurvey01]),
      });
      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(answerFromFirstUserForAnsweredSurvey01),
      });

      const result = await controller.getCommittedSurveyAnswers(
        { surveyId: idOfAnsweredSurvey01, participant: firstUsername },
        firstUsername,
      );
      expect(result).toEqual(answerFromFirstUserForAnsweredSurvey01);

      expect(surveyAnswersService.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, firstUsername);
    });
  });
});
