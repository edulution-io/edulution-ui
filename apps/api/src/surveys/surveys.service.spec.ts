import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysService from './surveys.service';
import { Survey, SurveyDocument } from './types/survey.schema';
import CreateSurveyDto from './dto/create-survey.dto';
import {
  firstMockSurvey,
  firstMockSurveyDocument,
  id_FirstMockSurvey,
  ids_MockSurveys, first_username,
  mockSurveys, publicAnswer_FirstMockSurvey,
  secondMockSurvey,
  secondMockSurveyDocument, second_username
} from './surveys.service.mock';

describe('SurveyService', () => {
  let service: SurveysService;
  let model: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: {
            create: jest.fn(),
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<SurveysService>(SurveysService);
    model = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllSurveys', () => {
    it('should return all surveys', async () => {
      const result = mockSurveys;
      jest.spyOn(model, 'find').mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(result),
      } as any);
      expect(await service.findAllSurveys()).toBe(result);
    });
  });

  describe('findSurvey', () => {
    it('should return a single survey by ID', async () => {
      jest.spyOn(model, 'findOne').mockResolvedValueOnce(firstMockSurvey);
      expect(await service.findSurvey(id_FirstMockSurvey)).toBe(firstMockSurvey);
    });
  });

  describe('findSurveys', () => {
    it('should return multiple surveys by ID', async () => {
      jest.spyOn(model, 'find').mockResolvedValueOnce(mockSurveys);
      expect(await service.findSurveys(ids_MockSurveys)).toBe(mockSurveys);
    });
  });

  describe('updateOrCreateSurvey', () => {
    it('should update a survey', async () => {
      const updateDto = { ...secondMockSurvey };
      jest.spyOn(model, 'findOneAndUpdate').mockResolvedValueOnce(secondMockSurveyDocument);
      const result = await service.updateOrCreateSurvey(updateDto);
      expect(result).toBe(secondMockSurveyDocument);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(updateDto);
    });

    it('should throw an error if the survey update fails', async () => {
      const updateDto = { ...secondMockSurvey };
      jest.spyOn(model, 'findOneAndUpdate').mockRejectedValueOnce(new Error('Failed to update survey'));
      await expect(service.updateOrCreateSurvey(updateDto)).rejects.toThrow('Failed to update survey');
    });

    it('should return the updated survey', async () => {
      const updateDto = { ...secondMockSurvey };
      jest.spyOn(model, 'findOneAndUpdate').mockResolvedValueOnce(secondMockSurveyDocument);
      const result = await service.updateOrCreateSurvey(updateDto);
      expect(result).toBe(secondMockSurveyDocument);
    });

    // if 'findOneAndUpdate()' did not found a survey to update it will create one
    it('should create a survey', async () => {
      const createDto: CreateSurveyDto = { ...firstMockSurvey };
      // @ts-ignore: 'secondMockSurveyDocument' has the right type
      jest.spyOn(model, 'create').mockResolvedValueOnce(firstMockSurveyDocument);
      const result = await service.updateOrCreateSurvey(createDto);
      expect(result).toBe(firstMockSurveyDocument);
      expect(model.create).toHaveBeenCalledWith(createDto);
    });

    it('should throw an error if the survey creation fails', async () => {
      const createDto = { ...firstMockSurvey };
      jest.spyOn(model, 'create').mockRejectedValueOnce(new Error('Failed to create survey'));
      await expect(service.updateOrCreateSurvey(createDto)).rejects.toThrow('Failed to create survey');
    });

    it('should return the created survey', async () => {
      const createDto = { ...firstMockSurvey };
      // @ts-ignore: 'secondMockSurveyDocument' has the right type
      jest.spyOn(model, 'create').mockResolvedValueOnce(firstMockSurveyDocument);
      const result = await service.updateOrCreateSurvey(createDto);
      expect(result).toBe(firstMockSurveyDocument);
    });
  });

  describe('addPublicAnswer', () => {
    it('in order to add an public answer it has to update the survey', async () => {
      jest.spyOn(model, 'findOneAndUpdate').mockResolvedValueOnce(secondMockSurveyDocument);
      const result = await service.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, second_username);
      expect(result).toBe(secondMockSurveyDocument);
      expect(model.findOneAndUpdate).toHaveBeenCalledWith(secondMockSurvey.id, publicAnswer_FirstMockSurvey, second_username);
    });

    it('should throw an error if the survey update fails', async () => {
      jest.spyOn(model, 'findOneAndUpdate').mockRejectedValueOnce(new Error('User is no participant of the survey'));
      await expect(
        service.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, 'NOT_EXISTING_USER_NAME')
      ).rejects.toThrow('User is no participant of the survey');
    });

    it('should throw an error if the survey update fails', async () => {
      jest.spyOn(model, 'findOneAndUpdate').mockRejectedValueOnce(new Error('User has already participated in the survey'));
      await expect(
        service.addPublicAnswer(secondMockSurvey.id, publicAnswer_FirstMockSurvey, first_username)
      ).rejects.toThrow('User has already participated in the survey');
    });
  });
});
