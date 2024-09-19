/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { HttpStatus } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/contants/common-error-messages';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './survey.schema';
import {
  surveyUpdateInitialSurvey,
  surveyUpdateUpdatedSurvey,
  surveyUpdateSurveyId,
  createdSurvey02,
  unknownSurveyId,
  idOfPublicSurvey01,
  publicSurvey01,
} from './mocks';

describe('SurveyService', () => {
  let service: SurveysService;
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
        lean: jest.fn().mockReturnValue(publicSurvey01),
      });

      const result = await service.findPublicSurvey(idOfPublicSurvey01);
      expect(result).toEqual(publicSurvey01);

      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: idOfPublicSurvey01, isPublic: true });
    });

    it('should throw an error if the database access fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValue({
        lean: jest
          .fn()
          .mockRejectedValue(
            new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
          ),
      });

      try {
        await service.findPublicSurvey(idOfPublicSurvey01);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(CommonErrorMessages.DBAccessFailed);
      }
      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: idOfPublicSurvey01, isPublic: true });
    });
  });

  describe('deleteSurveys', () => {
    it('should delete a survey', async () => {
      surveyModel.deleteMany = jest.fn();

      const surveyIds = [surveyUpdateSurveyId];
      await service.deleteSurveys(surveyIds);
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    });

    it('should throw an error if the survey deletion fails', async () => {
      surveyModel.deleteMany = jest
        .fn()
        .mockRejectedValueOnce(new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED));

      const surveyIds = [unknownSurveyId];
      try {
        await service.deleteSurveys(surveyIds);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrorMessages.DeleteError);
      }
      expect(surveyModel.deleteMany).toHaveBeenCalledWith({ _id: { $in: surveyIds } });
    });
  });

  describe('createSurvey', () => {
    it('should create a survey', async () => {
      surveyModel.create = jest.fn().mockReturnValueOnce(surveyUpdateInitialSurvey);

      await service
        .createSurvey(surveyUpdateInitialSurvey)
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
        await service.createSurvey(surveyUpdateInitialSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(CommonErrorMessages.DBAccessFailed);
      }
      expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurvey);
    });
  });

  describe('updateSurvey', () => {
    it('should update a survey', async () => {
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue(surveyUpdateUpdatedSurvey);

      const result = await service.updateSurvey(surveyUpdateUpdatedSurvey);
      expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);

      expect(surveyModel.findByIdAndUpdate).toHaveBeenCalledWith(surveyUpdateSurveyId, surveyUpdateUpdatedSurvey);
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findByIdAndUpdate = jest
        .fn()
        .mockRejectedValue(
          new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR),
        );

      try {
        await service.updateSurvey(surveyUpdateUpdatedSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(CommonErrorMessages.DBAccessFailed);
      }
    });

    // TODO: NIEDUUI-405: Survey: Update backendLimiters on question removal or name change of a question
  });

  describe('updateOrCreateSurvey', () => {
    it('should create a survey if it does not exist', async () => {
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(null);

      surveyModel.create = jest.fn().mockReturnValue(surveyUpdateInitialSurvey);

      const result = await service.updateOrCreateSurvey(surveyUpdateInitialSurvey);
      expect(result).toStrictEqual(surveyUpdateInitialSurvey);

      expect(surveyModel.findByIdAndUpdate).toHaveBeenCalledWith(surveyUpdateSurveyId, surveyUpdateInitialSurvey);
      expect(surveyModel.create).toHaveBeenCalledWith(surveyUpdateInitialSurvey);
    });

    it('should update a survey', async () => {
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue(surveyUpdateUpdatedSurvey);

      const result = await service.updateOrCreateSurvey(surveyUpdateUpdatedSurvey);
      expect(result).toStrictEqual(surveyUpdateUpdatedSurvey);

      expect(surveyModel.findByIdAndUpdate).toHaveBeenCalledWith(surveyUpdateSurveyId, surveyUpdateUpdatedSurvey);
    });

    it('should throw an error if the survey update and the creation of the survey failed', async () => {
      jest.spyOn(service, 'updateSurvey').mockResolvedValue(null);
      jest.spyOn(service, 'createSurvey').mockResolvedValue(null);

      try {
        await service.updateOrCreateSurvey(createdSurvey02);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.UpdateOrCreateError);
      }

      expect(service.updateSurvey).toHaveBeenCalledWith(createdSurvey02);
      expect(service.createSurvey).toHaveBeenCalledWith(createdSurvey02);
    });
  });
});
