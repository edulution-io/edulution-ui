import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus, Logger } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import {
  idOfPublicSurvey01,
  publicSurvey01,
  surveyUpdateInitialSurvey,
  surveyUpdateSurveyId,
  surveyUpdateUpdatedSurvey,
  unknownSurveyId,
} from './mocks';
import { surveyUpdateInitialSurveyDto, surveyUpdateUpdatedSurveyDto } from './mocks/surveys/updated-survey';
import UserConnections from '../types/userConnections';
import cacheManagerMock from '../common/mocks/cacheManagerMock';

const mockSseConnections: UserConnections = new Map();

describe('SurveyService', () => {
  let service: SurveysService;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    Logger.error = jest.fn();
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        {
          provide: CACHE_MANAGER,
          useValue: cacheManagerMock,
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

  describe('findPublicSurvey', () => {
    it('should search for public survey given an id', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(publicSurvey01),
      });

      const result = await service.findPublicSurvey(idOfPublicSurvey01);
      expect(result).toEqual(publicSurvey01);

      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    });

    it('should throw an error if the database access fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(
            new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });

      try {
        await service.findPublicSurvey(idOfPublicSurvey01);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
      }
      expect(surveyModel.findOne).toHaveBeenCalledWith({ id: idOfPublicSurvey01, isPublic: true });
    });
  });

  describe('deleteSurveys', () => {
    it('should delete a survey', async () => {
      surveyModel.deleteMany = jest.fn();

      const surveyIds = [surveyUpdateSurveyId];
      await service.deleteSurveys(surveyIds, mockSseConnections);
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    });

    it('should throw an error if the survey deletion fails', async () => {
      surveyModel.deleteMany = jest
        .fn()
        .mockRejectedValueOnce(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));

      const surveyIds = [unknownSurveyId];
      try {
        await service.deleteSurveys(surveyIds, mockSseConnections);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toEqual(SurveyErrorMessages.DeleteError);
      }
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    });
  });

  describe('createSurvey', () => {
    it('should create a survey', async () => {
      surveyModel.create = jest.fn().mockReturnValueOnce(surveyUpdateInitialSurvey);

      await service
        .createSurvey(surveyUpdateInitialSurvey, mockSseConnections)
        .then((data) => expect(data).toStrictEqual(surveyUpdateInitialSurvey))
        .catch(() => {});

      expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurvey);
    });

    it('should throw an error if the survey creation fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockResolvedValue(null);
      surveyModel.create = jest
        .fn()
        .mockRejectedValueOnce(
          new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      try {
        await service.createSurvey(surveyUpdateInitialSurvey, mockSseConnections);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toEqual(CommonErrorMessages.DBAccessFailed);
      }
      expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurvey);
    });
  });

  describe('updateSurvey', () => {
    it('should update a survey', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
      });
      const result = await service.updateSurvey(surveyUpdateUpdatedSurvey, mockSseConnections);

      expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: surveyUpdateSurveyId },
        surveyUpdateUpdatedSurvey,
      );
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockRejectedValue(
            new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });
      try {
        await service.updateSurvey(surveyUpdateUpdatedSurvey, mockSseConnections);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toBe(CommonErrorMessages.DBAccessFailed);
      }
    });

    // TODO: NIEDUUI-405: Survey: Update backendLimiters on question removal or name change of a question
  });

  describe('updateOrCreateSurvey', () => {
    it('should create a survey if it does not exist', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValue(surveyUpdateInitialSurvey);

      const result = await service.updateOrCreateSurvey(surveyUpdateInitialSurveyDto, mockSseConnections);
      expect(result).toStrictEqual(surveyUpdateInitialSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: surveyUpdateSurveyId },
        surveyUpdateInitialSurveyDto,
      );
      expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurveyDto);
    });

    it('should update a survey', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(surveyUpdateUpdatedSurvey),
      });

      const result = await service.updateOrCreateSurvey(surveyUpdateUpdatedSurveyDto, mockSseConnections);
      expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
        { id: surveyUpdateSurveyId },
        surveyUpdateUpdatedSurveyDto,
      );
    });

    it('should throw an error if the survey update and the creation of the survey failed', async () => {
      jest.spyOn(service, 'updateSurvey').mockResolvedValue(null);
      jest.spyOn(service, 'createSurvey').mockResolvedValue(null);

      try {
        await service.updateOrCreateSurvey(surveyUpdateInitialSurveyDto, mockSseConnections);
      } catch (e) {
        const error = e as Error;
        expect(error.message).toBe(SurveyErrorMessages.UpdateOrCreateError);
      }
    });
  });
});
