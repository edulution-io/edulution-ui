/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrorMessages from '@libs/survey/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import {
  mockedSurveyIds,
  mockedSurveys,
  distributedSurvey,
  idOfDistributedSurvey,
  theCreatedSurvey,
  theUpdatedCreatedSurvey,
} from './mocks';

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
        exec: jest.fn().mockResolvedValue(mockedSurveys),
      });

      jest.spyOn(surveyModel, 'find');

      const result = await service.getAllSurveys();
      expect(result).toStrictEqual(mockedSurveys);
      expect(surveyModel.find).toHaveBeenCalled();
    });
  });

  describe('findSurvey', () => {
    it('should return a single survey by ID', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(distributedSurvey),
      });

      jest.spyOn(surveyModel, 'findOne');

      const result = await service.findOneSurvey(idOfDistributedSurvey);
      expect(result).toStrictEqual(distributedSurvey);
      expect(surveyModel.findOne).toHaveBeenCalled();
    });
  });

  describe('findSurveys', () => {
    it('should return multiple surveys by ID', async () => {
      surveyModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(mockedSurveys),
      });

      jest.spyOn(surveyModel, 'find');

      const result = await service.findSurveys(mockedSurveyIds);
      expect(result).toStrictEqual(mockedSurveys);
      expect(surveyModel.find).toHaveBeenCalled();
    });
  });

  describe('updateSurvey', () => {
    it('should update a survey', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(theUpdatedCreatedSurvey),
      });

      const result = await service.updateSurvey(theUpdatedCreatedSurvey);
      expect(result).toStrictEqual(theUpdatedCreatedSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: theCreatedSurvey.id }, theUpdatedCreatedSurvey);
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
        await service.updateSurvey(theUpdatedCreatedSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotAbleToUpdateSurveyError);
      }
    });
  });

  describe('createSurvey', () => {
    it('should create a survey', async () => {
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValueOnce(theCreatedSurvey),
      });

      await service
        .createSurvey(theCreatedSurvey)
        .then((data) => expect(data).toStrictEqual(theCreatedSurvey))
        .catch(() => {});

      expect(surveyModel.create).toHaveBeenCalledWith(theCreatedSurvey);
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
        await service.createSurvey(theCreatedSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrorMessages.NotAbleToCreateSurveyError);
      }
      expect(surveyModel.create).toHaveBeenCalledWith(theCreatedSurvey);
    });
  });
});
