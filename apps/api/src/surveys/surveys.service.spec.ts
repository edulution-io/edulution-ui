/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveysService from './surveys.service';
import { SurveyDocument, SurveyModel } from './survey.schema';
import {
  addNewPublicAnswer_FirstMockSurvey,
  addNewPublicAnswer_SecondMockSurvey,
  addNewPublicAnswer_SecondMockSurvey_thirdUser,
  first_username,
  firstMockSurvey,
  firstMockSurvey_afterAddedNewAnswer,
  id_FirstMockSurvey,
  ids_MockSurveys,
  mockSurveys,
  newObjectId,
  partial_firstMockSurvey_afterAddedNewAnswer,
  partial_secondMockSurvey_afterAddedNewAnswer,
  // publicAnswer_FirstMockSurvey,
  second_username,
  secondMockSurvey,
  secondMockSurvey_afterAddedNewAnswer,
  third_username,
} from './surveys.service.mock';

describe('SurveyService', () => {
  let service: SurveysService;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: getModelToken(SurveyModel.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(SurveyModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllSurveys', () => {
    it('should return all surveys', async () => {
      surveyModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockSurveys),
      });

      jest.spyOn(surveyModel, 'find');

      const result = await service.getAllSurveys();
      expect(result).toStrictEqual(mockSurveys);
      expect(surveyModel.find).toHaveBeenCalled();
    });
  });

  describe('findSurvey', () => {
    it('should return a single survey by ID', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockSurvey),
      });

      jest.spyOn(surveyModel, 'findOne');

      const result = await service.findOneSurvey(id_FirstMockSurvey);
      expect(result).toStrictEqual(firstMockSurvey);
      expect(surveyModel.findOne).toHaveBeenCalled();
    });
  });

  describe('findSurveys', () => {
    it('should return multiple surveys by ID', async () => {
      surveyModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockSurveys),
      });

      jest.spyOn(surveyModel, 'find');

      const result = await service.findSurveys(ids_MockSurveys);
      expect(result).toStrictEqual(mockSurveys);
      expect(surveyModel.find).toHaveBeenCalled();
    });
  });

  describe('updateSurvey', () => {
    it('should update a survey', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(secondMockSurvey),
      });

      const result = await service.updateSurvey(secondMockSurvey);
      expect(result).toStrictEqual(secondMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: secondMockSurvey._id }, secondMockSurvey);
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
        await service.updateSurvey(secondMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }
    });
  });

  describe('createSurvey', () => {
    it('should create a survey', async () => {
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValueOnce(firstMockSurvey),
      });

      await service
        .createSurvey(firstMockSurvey)
        .then((data) => expect(data).toStrictEqual(firstMockSurvey))
        .catch(() => {});

      expect(surveyModel.create).toHaveBeenCalledWith(firstMockSurvey);
    });

    it('should throw an error if the survey creation fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockRejectedValueOnce(
            new CustomHttpException(SurveyErrorMessages.NotAbleToCreateSurveyError, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });

      jest.spyOn(surveyModel, 'create');

      try {
        await service.createSurvey(firstMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrorMessages.NotAbleToCreateSurveyError);
      }
      expect(surveyModel.create).toHaveBeenCalledWith(firstMockSurvey);
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
        await service.addPublicAnswer(newObjectId, addNewPublicAnswer_FirstMockSurvey, second_username);
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
        await service.addPublicAnswer(
          firstMockSurvey._id,
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
        await service.addPublicAnswer(firstMockSurvey._id, addNewPublicAnswer_FirstMockSurvey, first_username);
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
        await service.addPublicAnswer(secondMockSurvey._id, addNewPublicAnswer_SecondMockSurvey, second_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
      }
    });

    it('in order to add an public answer it has to update the survey (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockSurvey_afterAddedNewAnswer),
      });

      const result = await service.addPublicAnswer(
        firstMockSurvey._id,
        addNewPublicAnswer_FirstMockSurvey,
        second_username,
        true,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: firstMockSurvey._id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: firstMockSurvey._id },
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

      const result = await service.addPublicAnswer(
        secondMockSurvey._id,
        addNewPublicAnswer_SecondMockSurvey_thirdUser,
        third_username,
        false,
      );

      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: secondMockSurvey._id });
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { _id: secondMockSurvey._id },
        { ...partial_secondMockSurvey_afterAddedNewAnswer },
      );

      expect(result).toStrictEqual(secondMockSurvey_afterAddedNewAnswer);
    });
  });
});
