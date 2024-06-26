/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysService from './surveys.service';
import { SurveyModel, SurveyDocument } from './survey.schema';
import {
  firstMockSurvey,
  // firstMockSurveyDocument,
  id_FirstMockSurvey,
  ids_MockSurveys,
  first_username,
  mockSurveys,
  publicAnswer_FirstMockSurvey,
  secondMockSurvey,
  // secondMockSurveyDocument,
  second_username,
  firstMockSurvey_afterAddedNewAnswer,
  secondMockSurvey_afterAddedNewAnswer,
  addNewPublicAnswer_SecondMockSurvey,
  addNewPublicAnswer_FirstMockSurvey,
  partial_firstMockSurvey_afterAddedNewAnswer,
  partial_secondMockSurvey_afterAddedNewAnswer,
  newObjectId,
  addNewPublicAnswer_SecondMockSurvey_thirdUser,
  third_username,
} from './surveys.service.mock';
import SurveyErrors from '@libs/survey/survey-errors';
import NotAbleToParticipateAlreadyParticipatedError from '@libs/survey/errors/not-able-to-participate-already-participated-error';
import NotAbleToParticipateNotAnParticipantError from '@libs/survey/errors/not-able-to-participate-not-an-participant-error';
import NotAbleToCreateSurveyError from '@libs/survey/errors/not-able-to-create-survey-error';
import NotAbleToUpdateSurveyError from '@libs/survey/errors/not-able-to-update-survey-error';

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

  describe('updateOrCreateSurvey', () => {
    it('should update a survey', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(secondMockSurvey),
      });

      const result = await service.updateOrCreateSurvey(secondMockSurvey);
      expect(result).toStrictEqual(secondMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: secondMockSurvey._id }, secondMockSurvey);
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(NotAbleToUpdateSurveyError),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.updateOrCreateSurvey(secondMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrors.NotAbleToUpdateSurveyError);
      }
    });

    // if 'findOneAndUpdate()' did not found a survey to update it will create one
    it('should create a survey (first)', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValueOnce(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValueOnce(firstMockSurvey),
      });

      await service
        .updateOrCreateSurvey(firstMockSurvey)
        .then((data) => expect(data).toStrictEqual(firstMockSurvey))
        .catch(() => {});

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: firstMockSurvey._id }, { ...firstMockSurvey });
      expect(surveyModel.create).toHaveBeenCalledWith(firstMockSurvey);
    });

    it('should create a survey (second)', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValueOnce(secondMockSurvey),
      });

      await service
        .updateOrCreateSurvey(secondMockSurvey)
        .then((data) => expect(data).toStrictEqual(secondMockSurvey))
        .catch(() => {});

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: secondMockSurvey._id }, { ...secondMockSurvey });
      expect(surveyModel.create).toHaveBeenCalledWith(secondMockSurvey);
    });

    it('should throw an error if the survey creation fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(NotAbleToCreateSurveyError),
      });

      jest.spyOn(surveyModel, 'create');

      try {
        await service.updateOrCreateSurvey(firstMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(SurveyErrors.NotAbleToCreateSurveyError);
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
        expect(e.message).toBe(SurveyErrors.NotAbleToFindSurveyError);
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
        expect(e.message).toBe(SurveyErrors.NotAbleToParticipateNotAnParticipantError);
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
        expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
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
        expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
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

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(NotAbleToParticipateNotAnParticipantError),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(secondMockSurvey._id, publicAnswer_FirstMockSurvey, 'NOT_EXISTING_USER_NAME');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrors.NotAbleToParticipateNotAnParticipantError);
      }
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(NotAbleToParticipateAlreadyParticipatedError),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(secondMockSurvey._id, publicAnswer_FirstMockSurvey, first_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
      }
    });
  });
});
