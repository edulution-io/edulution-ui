import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './types/survey.schema';
import {
  firstMockSurvey,
  firstMockSurveyDocument,
  id_FirstMockSurvey,
  ids_MockSurveys,
  first_username,
  mockSurveys,
  publicAnswer_FirstMockSurvey,
  secondMockSurvey,
  secondMockSurveyDocument,
  second_username,
  firstMockSurvey_afterAddedNewAnswer,
  secondMockSurvey_afterAddedNewAnswer,
  addNewPublicAnswer_SecondMockSurvey,
  addNewPublicAnswer_FirstMockSurvey,
  partial_firstMockSurvey_afterAddedNewAnswer,
  partial_secondMockSurvey_afterAddedNewAnswer
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

      const result = await service.findAllSurveys();
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

      const result = await service.findSurvey(id_FirstMockSurvey);
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

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      const result = await service.updateOrCreateSurvey({...secondMockSurvey});
      expect(result).toStrictEqual(secondMockSurvey);
      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(secondMockSurvey);
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValue(new Error('Failed to update survey')),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.updateOrCreateSurvey(secondMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Failed to update survey');
      }
    });

    // if 'findOneAndUpdate()' did not found a survey to update it will create one
    it('should create a survey (first)', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockSurveyDocument),
      });

      jest.spyOn(surveyModel, 'create');

      await service.updateOrCreateSurvey(firstMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(firstMockSurvey);
      expect(surveyModel.findOneAndUpdate).toHaveReturnedWith(null);

      expect(surveyModel.create).toHaveBeenCalledWith(firstMockSurvey);
      expect(surveyModel.create).toHaveReturnedWith(firstMockSurveyDocument);
    });

    it('should create a survey (second)', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(secondMockSurveyDocument),
      });

      jest.spyOn(surveyModel, 'create');

      await service.updateOrCreateSurvey(secondMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(secondMockSurvey);
      expect(surveyModel.findOneAndUpdate).toHaveReturnedWith(null);

      expect(surveyModel.create).toHaveBeenCalledWith(secondMockSurvey);
      expect(surveyModel.create).toHaveReturnedWith(secondMockSurveyDocument);
    });

    it('should throw an error if the survey creation fails', async () => {
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.create = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('Failed to create survey')),
      });

      jest.spyOn(surveyModel, 'create');

      try {
        await service.updateOrCreateSurvey(firstMockSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual('Failed to create survey');
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
        await service.addPublicAnswer(52653415245934, addNewPublicAnswer_FirstMockSurvey, second_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('Survey not found');
      }
    });

    it('throw an error if a user adds an answer that is not marked as participating user', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(firstMockSurvey.id, addNewPublicAnswer_FirstMockSurvey, 'NOT_EXISTING_USER_NAME');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User is no participant of the survey');
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(firstMockSurvey.id, addNewPublicAnswer_FirstMockSurvey, second_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User has already participated in the survey');
      }
    });

    it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(secondMockSurvey.id, addNewPublicAnswer_SecondMockSurvey, first_username);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User has already participated in the survey');
      }
    });


    it('in order to add an public answer it has to update the survey (first)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(firstMockSurvey_afterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOne');
      jest.spyOn(surveyModel, 'findOneAndUpdate');

      await service.addPublicAnswer(firstMockSurvey.id, addNewPublicAnswer_FirstMockSurvey, second_username);

      expect(surveyModel.findOne).toHaveBeenCalledWith(firstMockSurvey.id);
      expect(surveyModel.findOne).toHaveReturnedWith(firstMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(firstMockSurvey.id, partial_firstMockSurvey_afterAddedNewAnswer);
      expect(surveyModel.findOneAndUpdate).toHaveReturnedWith(firstMockSurvey_afterAddedNewAnswer);
    });

    it('in order to add an public answer it has to update the survey (second)', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey_afterAddedNewAnswer),
      });

      jest.spyOn(surveyModel, 'findOne');
      jest.spyOn(surveyModel, 'findOneAndUpdate');

      await service.addPublicAnswer(secondMockSurvey.id, addNewPublicAnswer_SecondMockSurvey, first_username);

      expect(surveyModel.findOne).toHaveBeenCalledWith(secondMockSurvey.id);
      expect(surveyModel.findOne).toHaveReturnedWith(secondMockSurvey);

      expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(secondMockSurvey.id, partial_secondMockSurvey_afterAddedNewAnswer);
      expect(surveyModel.findOneAndUpdate).toHaveReturnedWith(secondMockSurvey_afterAddedNewAnswer);
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('User is no participant of the survey')),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, 'NOT_EXISTING_USER_NAME');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User is no participant of the survey');
      }
    });

    it('should throw an error if the survey update fails', async () => {
      surveyModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockReturnValue(secondMockSurvey),
      });
      surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockRejectedValueOnce(new Error('User has already participated in the survey')),
      });

      jest.spyOn(surveyModel, 'findOneAndUpdate');

      try {
        await service.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, first_username)
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe('User has already participated in the survey');
      }
    });
  });
});
