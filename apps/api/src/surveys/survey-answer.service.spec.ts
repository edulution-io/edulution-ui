import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import SurveyAnswerService from './survey-answer.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import UsersSurveysService from './users-surveys.service';
import { User, UserDocument } from '../users/user.schema';
import {
  firstUsername,
  secondUsername,
  firstMockUser,
  secondMockUser,
  answerFromFirstUserToAnswerTheOpenSurvey,
  idOfTheOpenSurvey,
  mockedAnswerForOpenSurvey,
  theOpenSurvey,
  unknownId,
  userSurveysAfterAnsweringOpenSurveyFirstUser,
} from './mocks';

describe('SurveyService', () => {
  let service: SurveyAnswerService;
  let model: Model<SurveyAnswerDocument>;
  let surveysService: SurveysService;
  let surveyModel: Model<SurveyDocument>;
  let usersSurveysService: UsersSurveysService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveyAnswerService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
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
      ],
    }).compile();

    service = module.get<SurveyAnswerService>(SurveyAnswerService);
    model = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
    surveysService = module.get<SurveysService>(SurveysService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    usersSurveysService = module.get<UsersSurveysService>(UsersSurveysService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getAllSurveys', () => {
    it('should return all surveys', async () => {
      surveyModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([theOpenSurvey]),
      });
      surveysService.getAllSurveys = jest.fn().mockReturnValueOnce([theOpenSurvey]);

      jest.spyOn(surveyModel, 'find');

      const result = await service.getAllSurveys();
      expect(result).toStrictEqual([theOpenSurvey]);
      expect(surveyModel.find).toHaveBeenCalled();
    });
  });

  describe('addAnswer', () => {
    it('should remove the survey from open surveys and move it to answered together with the answer', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(theOpenSurvey),
      });
      usersSurveysService.getOpenSurveyIds = jest.fn().mockReturnValueOnce([idOfTheOpenSurvey]);
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ firstMockUser }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterAnsweringOpenSurveyFirstUser,
        }),
      });
      model.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      model.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      await service.addAnswer(idOfTheOpenSurvey, mockedAnswerForOpenSurvey, firstUsername);
    });

    it('throw an error if the survey with the surveyId was not found', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      try {
        await service.addAnswer(unknownId, mockedAnswerForOpenSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToFindSurveyError);
      }
    });

    it('throw an error if a user adds an answer that is not marked as participating user', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ secondMockUser }),
      });
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(theOpenSurvey),
      });
      model.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      model.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      try {
        await service.addAnswer(idOfTheOpenSurvey, mockedAnswerForOpenSurvey, secondUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ firstMockUser }),
      });
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(theOpenSurvey),
      });
      model.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });
      model.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      try {
        await service.addAnswer(idOfTheOpenSurvey, mockedAnswerForOpenSurvey, firstUsername);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });
  });

  describe('getPublicAnswer', () => {
    it('should return the public answers of a survey given the Id', async () => {
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(theOpenSurvey),
      });
      model.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([answerFromFirstUserToAnswerTheOpenSurvey]),
      });

      jest.spyOn(service, 'getPublicAnswers');

      await service
        .getPublicAnswers(idOfTheOpenSurvey)
        .then((result) => expect(result).toEqual([mockedAnswerForOpenSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(service.getPublicAnswers).toHaveBeenCalledWith(idOfTheOpenSurvey);
    });
  });

  describe('getPrivateAnswer', () => {
    it('should return the previously commited answer for the survey with props.surveyId from user with props.username', async () => {
      model.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(answerFromFirstUserToAnswerTheOpenSurvey),
      });

      jest.spyOn(service, 'getPrivateAnswer');

      await service
        .getPrivateAnswer(idOfTheOpenSurvey, firstUsername)
        .then((result) => expect(result).toEqual(answerFromFirstUserToAnswerTheOpenSurvey))
        .catch((error) => expect(error).toBeUndefined());
    });
  });
});
