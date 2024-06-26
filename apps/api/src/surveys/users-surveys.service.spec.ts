/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
// import { CacheModule } from '@nestjs/cache-manager';
import { getModelToken } from '@nestjs/mongoose';
import SurveyErrors from '@libs/survey/survey-errors';
import UsersSurveysService from './users-surveys.service';
import { User, UserDocument } from '../users/user.schema';
import {
  answeredSurvey,
  answeredSurveyIds,
  createdSurvey,
  createdSurveys,
  distributedSurvey,
  first_mockedUser,
  first_participant,
  first_username,
  mockedAnswer,
  newObjectId,
  openSurvey,
  openSurveys,
  second_mockedUser,
  second_participant,
  second_username,
  unknownSurvey,
  Users_UserSurveys_afterAddAnswer_openSurvey,
  Users_UserSurveys_afterAddCreated_unknownSurvey,
  Users_UserSurveys_afterAddOpen_unknownSurvey,
  Users_UserSurveys_afterRemove_answeredSurvey,
  Users_UserSurveys_afterRemove_createdSurvey,
  Users_UserSurveys_afterRemove_distributedSurvey,
  Users_UserSurveys_afterRemove_openSurvey,
  userSurveys,
} from './users-surveys.service.mock';
import NotAbleToFindUsersError from '@libs/survey/errors/not-able-to-find-users-error';

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
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });

      const result = await service.getExistingUser(first_username);
      expect(result).toStrictEqual(first_mockedUser);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        await service.getExistingUser('not-existing-user');
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrors.NotAbleToFindUserError);
      }
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue({ usersSurveys: userSurveys }),
      });

      const result = await service.updateUser(first_username, { usersSurveys: userSurveys });
      expect(result).toStrictEqual({ usersSurveys: userSurveys });

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: first_username },
        { usersSurveys: userSurveys },
        { new: true },
      );
    });
  });

  describe('getOpenSurveyIds', () => {
    it('should return open survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });

      const result = await service.getOpenSurveyIds(first_username);
      expect(result).toEqual(openSurveys);
    });
  });

  describe('getCreatedSurveyIds', () => {
    it('should return open survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });

      const result = await service.getCreatedSurveyIds(first_username);
      expect(result).toEqual(createdSurveys);
    });
  });

  describe('getAnsweredSurveyIds', () => {
    it('should return open survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });

      const result = await service.getAnsweredSurveyIds(first_username);
      expect(result).toEqual(answeredSurveyIds);
    });
  });

  describe('onRemoveSurvey', () => {
    it('should remove survey from list of openSurveys if survey gets deleted and is open', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([first_mockedUser, second_mockedUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: Users_UserSurveys_afterRemove_openSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey([openSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        usersSurveys: Users_UserSurveys_afterRemove_openSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {
        usersSurveys: Users_UserSurveys_afterRemove_openSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of createdSurveys if survey gets deleted and is in the created list', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([first_mockedUser, second_mockedUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: Users_UserSurveys_afterRemove_createdSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey([createdSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        usersSurveys: Users_UserSurveys_afterRemove_createdSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {
        usersSurveys: Users_UserSurveys_afterRemove_createdSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of answeredSurveys if survey gets deleted was already answered', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([first_mockedUser, second_mockedUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey([answeredSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {
        usersSurveys: Users_UserSurveys_afterRemove_answeredSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([first_mockedUser, second_mockedUser]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey([distributedSurvey]);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledWith(second_username, {
        usersSurveys: Users_UserSurveys_afterRemove_distributedSurvey,
      });
      expect(service.updateUser).toHaveBeenCalledTimes(2);
    });

    it('should not remove any surveyId if the deleted id is not included in any of the lists', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([first_mockedUser, second_mockedUser]),
      });

      jest.spyOn(service, 'updateUser');

      await service.onRemoveSurvey([unknownSurvey]);

      expect(service.updateUser).not.toHaveBeenCalled();
    });

    it('should throw an error if the user is not found', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      await expect(service.onRemoveSurvey([unknownSurvey])).rejects.toThrow(NotAbleToFindUsersError);
    });
  });

  describe('addToCreatedSurveys', () => {
    it('should add a survey to the list of created surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({
            username: first_username,
            usersSurveys: Users_UserSurveys_afterAddCreated_unknownSurvey,
          }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToCreatedSurveys(first_username, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        username: first_username,
        usersSurveys: Users_UserSurveys_afterAddCreated_unknownSurvey,
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
        expect(e.message).toBe(SurveyErrors.NotAbleToFindUserError);
      }
    });
  });

  describe('addAnswer', () => {
    it('should remove the survey from open surveys and move it to answered together with the answer', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue({ username: first_username, usersSurveys: userSurveys }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ username: first_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addAnswer(first_username, openSurvey, mockedAnswer, false);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        username: first_username,
        usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey,
      });
    });
  });

  describe('addToOpenSurveys', () => {
    it('should add a survey to open surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });

      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: first_username, usersSurveys: Users_UserSurveys_afterAddOpen_unknownSurvey }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToOpenSurveys(first_username, unknownSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(first_username, {
        username: first_username,
        usersSurveys: Users_UserSurveys_afterAddOpen_unknownSurvey,
      });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        expect(await service.addToCreatedSurveys('not-found', unknownSurvey)).toThrow(
          SurveyErrors.NotAbleToFindUserError,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrors.NotAbleToFindUserError);
      }
    });
  });

  describe('populateSurvey', () => {
    it('should populate survey to first participant', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(first_mockedUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: first_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([first_participant], newObjectId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(first_participant.value, newObjectId);
    });

    it('should populate survey to second participant', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(second_mockedUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: second_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([second_participant], newObjectId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(second_participant.value, newObjectId);
    });
  });

  describe('getCommitedAnswer', () => {
    it('should return the previously commited answer for the survey with props.surveyId from user with props.username', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: first_username, usersSurveys: Users_UserSurveys_afterAddAnswer_openSurvey }),
      });

      jest.spyOn(service, 'getCommitedAnswer');

      const result = await service.getCommitedAnswer(first_username, openSurvey);
      expect(result).toStrictEqual(mockedAnswer);
    });
  });
});
