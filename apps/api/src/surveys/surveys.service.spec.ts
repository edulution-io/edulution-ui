import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import {
  mockSurveyIds,
  mockSurveys,
  firstMockSurvey,
  firstMockSurveyId,
  secondMockSurvey,
} from './surveys.service.mock';

describe('SurveyService', () => {
  let service: SurveysService;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
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

      const result = await service.findOneSurvey(firstMockSurveyId);
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

      const result = await service.findSurveys(mockSurveyIds);
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

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ id: secondMockSurvey.id }, secondMockSurvey);
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
});
