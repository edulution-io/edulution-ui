import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/user-error-messages';
import { HttpStatus } from '@nestjs/common';
import UsersSurveysService from './users-surveys.service';
import { User, UserDocument } from '../users/user.schema';
import {
  unknownSurvey,
  newObjectId,
  answeredSurvey,
  answeredSurveyIds,
  createdSurvey,
  createdSurveys,
  distributedSurvey,
  mockedAnswer,
  openSurvey,
  openSurveys,
  firstMockUser,
  secondMockUser,
  userSurveys,
  userSurveysAfterAddOpenUnknownSurvey,
  userSurveysAfterAddAnswerForOpenSurvey,
  userSurveysAfterAddCreatedUnknownSurvey,
  userSurveysAfterRemoveOpenSurvey,
  userSurveysAfterRemoveAnsweredSurvey,
  userSurveysAfterRemoveCreatedSurvey,
  userSurveysAfterRemoveDistributedSurvey,
} from './users-surveys.service.mock';
import { firstUsername, firstParticipant, secondUsername, secondParticipant } from './surveys.service.mock';

describe('UsersSurveysService', () => {
  let service: UsersSurveysService;
  let userModel: Model<UserDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<UsersSurveysService>(UsersSurveysService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
  });

  afterEach(() => {
    // userModel.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getExistingUser', () => {
    it('should return a user', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.getExistingUser(firstUsername);
      expect(result).toStrictEqual(firstMockUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.getExistingUser('not-existing-user');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
      }
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveys }),
      });

      const result = await service.updateUser(firstUsername, { usersSurveys: userSurveys });
      expect(result).toStrictEqual({ usersSurveys: userSurveys });

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveys },
        { new: true },
      );
    });
  });

  describe('getOpenSurveyIds', () => {
    it('should return open survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.getOpenSurveyIds(firstUsername);
      expect(result).toEqual(openSurveys);
    });
  });

  describe('getCreatedSurveyIds', () => {
    it('should return created survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.getCreatedSurveyIds(firstUsername);
      expect(result).toEqual(createdSurveys);
    });
  });

  describe('getAnsweredSurveyIds', () => {
    it('should return answered survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.getAnsweredSurveyIds(firstUsername);
      expect(result).toEqual(answeredSurveyIds);
    });
  });

  describe('onRemoveSurvey', () => {
    it('should remove survey from list of openSurveys if survey gets deleted and is open', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveysAfterRemoveOpenSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurveys([openSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveOpenSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(secondUsername, {
        usersSurveys: userSurveysAfterRemoveOpenSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of createdSurveys if survey gets deleted and is in the created list', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveysAfterRemoveCreatedSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurveys([createdSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveCreatedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(secondUsername, {
        usersSurveys: userSurveysAfterRemoveCreatedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of answeredSurveys if survey gets deleted was already answered', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveysAfterRemoveAnsweredSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurveys([answeredSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveAnsweredSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(secondUsername, {
        usersSurveys: userSurveysAfterRemoveAnsweredSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveysAfterRemoveDistributedSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurveys([distributedSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveDistributedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(secondUsername, {
        usersSurveys: userSurveysAfterRemoveDistributedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should not remove any surveyId if the deleted id is not included in any of the lists', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurveys([unknownSurvey]);

      expect(service.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.onRemoveSurveys([unknownSurvey])).rejects.toThrow(
        new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('addToCreatedSurveys', () => {
    it('should add a survey to the list of created surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({
          username: firstUsername,
          usersSurveys: userSurveysAfterAddCreatedUnknownSurvey,
        }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToCreatedSurveys(firstUsername, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        username: firstUsername,
        usersSurveys: userSurveysAfterAddCreatedUnknownSurvey,
      });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.addToCreatedSurveys('not-found', unknownSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
      }
    });
  });

  describe('addAnswer', () => {
    it('should remove the survey from open surveys and move it to answered together with the answer', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ username: firstUsername, usersSurveys: userSurveys }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addAnswer(firstUsername, openSurvey, mockedAnswer, false);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        username: firstUsername,
        usersSurveys: userSurveysAfterAddAnswerForOpenSurvey,
      });
    });
  });

  describe('addToOpenSurveys', () => {
    it('should add a survey to open surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddOpenUnknownSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToOpenSurveys(firstUsername, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        username: firstUsername,
        usersSurveys: userSurveysAfterAddOpenUnknownSurvey,
      });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        expect(await service.addToCreatedSurveys('not-found', unknownSurvey)).toThrow(
          new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND),
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
      }
    });
  });

  describe('populateSurvey', () => {
    it('should populate survey to first participant', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([firstParticipant], newObjectId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(firstParticipant.value, newObjectId);
    });

    it('should populate survey to second participant', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(secondMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: secondUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([secondParticipant], newObjectId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(secondParticipant.value, newObjectId);
    });
  });

  describe('getCommitedAnswer', () => {
    it('should return the previously commited answer for the survey with props.surveyId from user with props.username', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
      });

      jest.spyOn(service, 'getCommitedAnswer');

      const result = await service.getCommitedAnswer(firstUsername, openSurvey);
      expect(result).toStrictEqual(mockedAnswer);
    });
  });
});
