/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyStatus from '@libs/survey/survey-status-enum';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyAnswersService from './survey-answer.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import {
  idOfAnsweredSurvey01,
  answeredSurvey01,
  idOfAnsweredSurvey02,
  answeredSurvey02,
  firstUsersSurveyAnswerAnsweredSurvey01,
  surveyAnswerAnsweredSurvey02,
  secondUsersSurveyAnswerAnsweredSurvey01,
  saveNoAnsweredSurvey01,
  saveNoAnsweredSurvey02,
  mockedAnswerForAnsweredSurveys02,
  saveNoAnsweredSurvey03,
  idOfAnsweredSurvey03,
  answeredSurvey03,
  surveyAnswerAnsweredSurvey03,
  answeredSurvey05,
  firstUsersMockedAnswerForAnsweredSurveys01,
  surveyAnswerAnsweredSurvey05,
  idOfAnsweredSurvey05,
  saveNoAnsweredSurvey05,
  idOfAnsweredSurvey04,
  saveNoAnsweredSurvey04,
  surveyAnswerAnsweredSurvey04,
  answeredSurvey04,
  mockedAnswerForAnsweredSurveys04,
  newSurveyAnswerAnsweredSurvey05,
  newMockedAnswerForAnsweredSurveys05,
  idOfTheSurveyAnswerForTheAnsweredSurvey04,
  idOfTheSurveyAnswerForTheAnsweredSurvey05,
  updatedSurveyAnswerAnsweredSurvey03,
  updatedMockedAnswerForAnsweredSurveys03,
  firstUsername,
  openSurvey01,
  secondUsername,
  firstMockJWTUser,
  firstMockUser,
  secondMockJWTUser,
  unknownSurveyId,
  openSurvey02,
  createdSurvey01,
  surveyUpdateInitialSurvey,
  idOfPublicSurvey01,
  publicSurvey01,
  idOfPublicSurvey02,
  publicSurvey02,
  publicSurvey02QuestionIdWithLimiters,
  filteredChoices,
  publicSurvey02AfterAddingValidAnswer,
  filteredChoicesAfterAddingValidAnswer,
} from './mocks';
import SurveysService from './surveys.service';

describe('SurveyAnswerService', () => {
  let service: SurveyAnswersService;
  let model: Model<SurveyAnswerDocument>;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
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
      jest.spyOn(service, 'countChoiceSelections');

      model.countDocuments = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02);

      const result = await service.getSelectableChoices(idOfPublicSurvey02, publicSurvey02QuestionIdWithLimiters);
      expect(result).toEqual(filteredChoices);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02,
        publicSurvey02QuestionIdWithLimiters,
      );
      expect(model.countDocuments).toHaveBeenCalledTimes(4); // once for each possible choice
    });

    it('Should return those choices that are still selectable even after adding a new answer (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');
      jest.spyOn(service, 'countChoiceSelections');

      model.countDocuments = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02AfterAddingValidAnswer);

      const result = await service.getSelectableChoices(idOfPublicSurvey02, publicSurvey02QuestionIdWithLimiters);
      expect(result).toEqual(filteredChoicesAfterAddingValidAnswer);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02,
        publicSurvey02QuestionIdWithLimiters,
      );
      expect(model.countDocuments).toHaveBeenCalledTimes(4); // once for each possible choice
    });

    it('Throw error when the backendLimit is not set', async () => {
      jest.spyOn(service, 'getSelectableChoices');
      jest.spyOn(service, 'countChoiceSelections');

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey01);

      try {
        await service.getSelectableChoices(idOfPublicSurvey01, publicSurvey02QuestionIdWithLimiters);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NoBackendLimiters);
      }

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey01,
        publicSurvey02QuestionIdWithLimiters,
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

      const result = await service.getOpenSurveys(firstUsername);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstUsername);
      expect(surveyModel.find).toHaveBeenCalledWith({
        $or: [
          { isPublic: true },
          {
            $and: [
              { 'invitedAttendees.username': firstUsername },
              {
                $or: [
                  { $nor: [{ participatedAttendees: { $elemMatch: { username: firstUsername } } }] },
                  { canSubmitMultipleAnswers: true },
                ],
              },
            ],
          },
        ],
      });
    });
  });

  describe('getAnswers', () => {
    it('should return a list with the answers the user has submitted', async () => {
      jest.spyOn(service, 'getAnswers');

      model.find = jest
        .fn()
        .mockReturnValue([
          firstUsersSurveyAnswerAnsweredSurvey01,
          surveyAnswerAnsweredSurvey02,
          surveyAnswerAnsweredSurvey05,
          surveyAnswerAnsweredSurvey04,
        ]);

      const result = await service.getAnswers(firstUsername);
      expect(result).toEqual([
        firstUsersSurveyAnswerAnsweredSurvey01,
        surveyAnswerAnsweredSurvey02,
        surveyAnswerAnsweredSurvey05,
        surveyAnswerAnsweredSurvey04,
      ]);

      expect(service.getAnswers).toHaveBeenCalledWith(firstUsername);
      expect(model.find).toHaveBeenCalledWith({ 'attendee.username': firstUsername });
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

      const result = await service.findUserSurveys(SurveyStatus.OPEN, firstUsername);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstUsername);
      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('return surveys with status CREATED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await service.findUserSurveys(SurveyStatus.CREATED, firstUsername);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstUsername);
      expect(service.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('return surveys with status ANSWERED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getAnsweredSurveys');

      model.find = jest.fn().mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);
      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, answeredSurvey01, answeredSurvey02]);

      const result = await service.findUserSurveys(SurveyStatus.ANSWERED, firstUsername);
      expect(result).toEqual([openSurvey01, answeredSurvey01, answeredSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstUsername);
      expect(service.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
    });
  });

  describe('addAnswer', () => {
    it('should return an error if the survey was not found', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(null);

      try {
        await service.addAnswer(unknownSurveyId, 1, firstMockJWTUser, {} as JSON);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotFoundError);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(unknownSurveyId, 1, firstMockJWTUser, {} as JSON);
    });

    it('should return an error if the survey has already expired', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey01);
      model.findOne = jest.fn().mockReturnValue(null);
      model.create = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      model.findByIdAndUpdate = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(answeredSurvey01);

      try {
        await service.addAnswer(
          idOfAnsweredSurvey01,
          saveNoAnsweredSurvey01,
          firstMockJWTUser,
          firstUsersMockedAnswerForAnsweredSurveys01,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorSurveyExpired);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01,
        saveNoAnsweredSurvey01,
        firstMockJWTUser,
        firstUsersMockedAnswerForAnsweredSurveys01,
      );
    });

    it('should return an error if the user is no participant (or creator)', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey02);

      try {
        await service.addAnswer(
          idOfAnsweredSurvey02,
          saveNoAnsweredSurvey02,
          firstMockJWTUser,
          mockedAnswerForAnsweredSurveys02,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorUserNotAssigned);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey02,
        saveNoAnsweredSurvey02,
        firstMockJWTUser,
        mockedAnswerForAnsweredSurveys02,
      );
    });

    it(
      'should return an error if the has already participated and can not' +
        ' update the answer or commit multiple answers',
      async () => {
        jest.spyOn(service, 'addAnswer');

        surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey02);

        try {
          await service.addAnswer(
            idOfAnsweredSurvey02,
            saveNoAnsweredSurvey02,
            secondMockJWTUser,
            mockedAnswerForAnsweredSurveys02,
          );
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorAlreadyParticipated);
        }

        expect(service.addAnswer).toHaveBeenCalledWith(
          idOfAnsweredSurvey02,
          saveNoAnsweredSurvey02,
          secondMockJWTUser,
          mockedAnswerForAnsweredSurveys02,
        );
      },
    );

    it('should update the former answer of the user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey03);
      model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey03);
      model.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      const result = await service.addAnswer(
        idOfAnsweredSurvey03,
        saveNoAnsweredSurvey03,
        firstMockJWTUser,
        updatedMockedAnswerForAnsweredSurveys03,
      );
      expect(result).toEqual(updatedSurveyAnswerAnsweredSurvey03);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey03,
        saveNoAnsweredSurvey03,
        firstMockJWTUser,
        updatedMockedAnswerForAnsweredSurveys03,
      );
    });

    it('should create an answer object if there is none for the survey commited by the given user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey04);
      model.findOne = jest.fn().mockReturnValue(null);
      model.create = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey04);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey04,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey04],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey04,
        saveNoAnsweredSurvey04,
        firstMockJWTUser,
        mockedAnswerForAnsweredSurveys04,
      );
      expect(result).toEqual(surveyAnswerAnsweredSurvey04);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey04,
        saveNoAnsweredSurvey04,
        firstMockJWTUser,
        mockedAnswerForAnsweredSurveys04,
      );
    });

    it('should also create an answer object if the users can submit multiple answers', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey05);
      model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey05);
      model.create = jest.fn().mockReturnValue(newSurveyAnswerAnsweredSurvey05);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey05,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey05],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey05,
        saveNoAnsweredSurvey05,
        firstMockJWTUser,
        newMockedAnswerForAnsweredSurveys05,
      );
      expect(result).toEqual(newSurveyAnswerAnsweredSurvey05);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey05,
        saveNoAnsweredSurvey05,
        firstMockJWTUser,
        newMockedAnswerForAnsweredSurveys05,
      );
    });
  });

  describe('getPrivateAnswer', () => {
    it('should return the commited answer of a given user', async () => {
      jest.spyOn(service, 'getPrivateAnswer');

      model.findOne = jest.fn().mockReturnValue(secondUsersSurveyAnswerAnsweredSurvey01);

      const result = await service.getPrivateAnswer(idOfAnsweredSurvey01, secondUsername);
      expect(result).toEqual(secondUsersSurveyAnswerAnsweredSurvey01);

      expect(service.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, secondUsername);
    });
  });

  describe('getPublicAnswers', () => {
    it('should return the public answers the users submitted', async () => {
      jest.spyOn(service, 'getPublicAnswers');

      model.find = jest
        .fn()
        .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);

      const result = await service.getPublicAnswers(idOfAnsweredSurvey01);
      expect(result).toEqual([
        firstUsersSurveyAnswerAnsweredSurvey01.answer,
        secondUsersSurveyAnswerAnsweredSurvey01.answer,
      ]);

      expect(service.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01);
    });
  });

  describe('onSurveyRemoval', () => {
    it('should also remove the survey answers that are stored', async () => {
      jest.spyOn(service, 'onSurveyRemoval');

      model.deleteMany = jest.fn().mockResolvedValueOnce(true);

      await service.onSurveyRemoval([idOfAnsweredSurvey01]);

      expect(service.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01]);
      expect(model.deleteMany).toHaveBeenCalledWith({ surveyId: { $in: [idOfAnsweredSurvey01] } }, { ordered: false });
    });
  });
});
