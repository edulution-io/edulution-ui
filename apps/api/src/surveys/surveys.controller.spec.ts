import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { Survey } from './types/survey.schema';
import {
  first_username,
  mocked_participants,
  id_FirstMockSurvey,
  id_SecondMockSurvey,
  firstMockSurvey,
  secondMockSurvey,
  mockSurveys,
  secondMockSurveyDocument,
  privateAnswer_FirstMockSurvey,
} from './surveys.service.mock';
import UserSurveySearchTypes from './types/user-survey-search-types-enum';
import { User } from '../users/user.schema';

describe('SurveysController', () => {
  let controller: SurveysController;
  let surveysService: SurveysService;
  let usersSurveysService: UsersSurveysService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: {
            new: jest.fn().mockResolvedValue(firstMockSurvey),
            constructor: jest.fn().mockResolvedValue(firstMockSurvey),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            create: jest.fn(),
            delete: jest.fn(),
            remove: jest.fn(),
            exec: jest.fn(),
          },
        },
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: {
            findOne: jest.fn(),
            findOneAndUpdate: jest.fn(),
            find: jest.fn(),
            exec: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
    usersSurveysService = module.get<UsersSurveysService>(UsersSurveysService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('should return the list of open (not jet participated) surveys', async () => {
      jest.spyOn(usersSurveysService, 'getOpenSurveyIds').mockResolvedValueOnce([id_FirstMockSurvey]);
      jest.spyOn(surveysService, 'findSurveys').mockResolvedValueOnce([firstMockSurvey]);
      const result = await controller.find({}, { search: UserSurveySearchTypes.OPEN }, 'testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the list of surveys that the user created', async () => {
      jest.spyOn(usersSurveysService, 'getCreatedSurveyIds').mockResolvedValueOnce([id_FirstMockSurvey]);
      jest.spyOn(surveysService, 'findSurveys').mockResolvedValueOnce([firstMockSurvey]);
      const result = await controller.find({}, { search: UserSurveySearchTypes.CREATED }, 'testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the list of public answers appended to the survey', async () => {
      jest.spyOn(surveysService, 'findSurvey').mockResolvedValueOnce(firstMockSurvey);
      const result = await controller.find({}, { search: UserSurveySearchTypes.ANSWERS, surveyId: id_FirstMockSurvey }, 'testUser');
      expect(result).toEqual(firstMockSurvey.publicAnswers);
    });

    it('should return the commited answer for a survey from user document', async () => {
      jest.spyOn(usersSurveysService, 'getCommitedAnswer').mockResolvedValueOnce(privateAnswer_FirstMockSurvey);
      const result = await controller.find({ participants: [first_username] }, { search: UserSurveySearchTypes.ANSWERS, surveyId: id_FirstMockSurvey }, 'testUser');
      expect(result).toEqual(privateAnswer_FirstMockSurvey);
    });

    it('should return the list of surveys the user has participated already', async () => {
      jest.spyOn(usersSurveysService, 'getAnsweredSurveyIds').mockResolvedValueOnce([id_FirstMockSurvey]);
      jest.spyOn(surveysService, 'findSurveys').mockResolvedValueOnce([firstMockSurvey]);
      const result = await controller.find({}, { search: UserSurveySearchTypes.ANSWERED }, 'testUser');
      expect(result).toEqual([firstMockSurvey]);
    });

    it('should return the complete list of surveys', async () => {
      jest.spyOn(surveysService, 'findAllSurveys').mockResolvedValueOnce(mockSurveys);
      const result = await controller.find({}, { search: UserSurveySearchTypes.ALL }, 'testUser');
      expect(result).toEqual(mockSurveys);
    });
  });

  describe('createOrUpdate', () => {
    it('should create a survey', async () => {
      const createDto = { ...secondMockSurvey };
      jest.spyOn(surveysService, 'updateOrCreateSurvey').mockResolvedValueOnce(secondMockSurveyDocument);
      jest.spyOn(usersSurveysService, 'addToCreatedSurveys');
      jest.spyOn(usersSurveysService, 'populateSurvey');


      const result = await controller.createOrUpdate({ ...secondMockSurvey }, 'testUser');
      expect(result).toBe(secondMockSurveyDocument);
      expect(surveysService.updateOrCreateSurvey).toHaveBeenCalledWith(createDto);

      expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith('testUser', id_SecondMockSurvey );
      expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith( mocked_participants, id_SecondMockSurvey);
    });

    it('should throw an error if the survey creation or update fails', async () => {
      const createDto = { ...secondMockSurvey };
      jest.spyOn(surveysService, 'updateOrCreateSurvey').mockRejectedValueOnce(new Error('Failed to create or update survey'));
      await expect(controller.createOrUpdate(createDto, 'testUser')).rejects.toThrow('Failed to create or update survey');
    });
  });

  describe('remove', () => {
    const newSurveyId = 23523412341;

    it('should remove a survey', async () => {
      jest.spyOn(surveysService, 'removeSurvey').mockResolvedValueOnce(true);
      const result = await controller.remove({ surveyId: id_SecondMockSurvey });
      expect(result).toBe(true);
      expect(surveysService.removeSurvey).toHaveBeenCalledWith(id_SecondMockSurvey);
    });

    it('should throw an error if the survey removal fails', async () => {
      jest.spyOn(surveysService, 'removeSurvey').mockRejectedValueOnce(new Error('Failed to remove survey'));
      await expect(controller.remove({ surveyId: id_SecondMockSurvey })).rejects.toThrow('Failed to remove survey');
    });

    it('should return false if the survey was not found', async () => {
      jest.spyOn(surveysService, 'removeSurvey').mockResolvedValueOnce(false);
      const result = await controller.remove({ surveyId: newSurveyId });
      expect(result).toBe(false);
    });
  });

  describe('manageUsersSurveys', () => {
    it('should add an answer to a survey', async () => {
      jest.spyOn(surveysService, 'addPublicAnswer').mockResolvedValueOnce(undefined);
      jest.spyOn(usersSurveysService, 'addAnswer').mockResolvedValueOnce(null);
      const result = await controller.manageUsersSurveys({ surveyId: id_FirstMockSurvey, answer: privateAnswer_FirstMockSurvey }, 'testUser');
      expect(result).toBe(true);
      expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(id_FirstMockSurvey, privateAnswer_FirstMockSurvey, 'testUser');
      expect(usersSurveysService.addAnswer).toHaveBeenCalledWith('testUser', id_FirstMockSurvey, privateAnswer_FirstMockSurvey);
    });

    it('should throw an error if adding an answer fails', async () => {
      jest.spyOn(surveysService, 'addPublicAnswer').mockRejectedValueOnce(new Error('Survey Error (Adding Answer)'));
      await expect(controller.manageUsersSurveys({ surveyId: id_FirstMockSurvey, answer: privateAnswer_FirstMockSurvey }, 'testUser')).rejects.toThrow('Survey Error (Adding Answer)');
    });
  });
});
