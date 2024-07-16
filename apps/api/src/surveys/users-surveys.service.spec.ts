/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { HttpStatus } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import UserErrorMessages from '@libs/user/user-error-messages';
import { User, UserDocument } from '../users/user.schema';
import UsersSurveysService from './users-surveys.service';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import SurveysAnswerService from './survey-answer.service';
import {
  firstUsername,
  secondUsername,
  firstParticipant,
  secondParticipant,
  firstMockUser,
  secondMockUser,
  basicUserSurveysFirstUser,
  userSurveysAfterAddingNewOpenSurveyFirstUser,
  userSurveysAfterCreatingNewOpenSurveyFirstUser,
  userSurveysAfterCreatingNewSurveyFirstUser,
  userSurveysAfterRemoveAnsweredSurveyFirstUser,
  userSurveysAfterRemoveCreatedSurveyFirstUser,
  userSurveysAfterRemoveDistributedSurveyFirstUser,
  userSurveysAfterRemoveOpenSurveyFirstUser,
  userSurveysAfterAddingNewOpenSurveySecondUser,
  userSurveysAfterRemoveMultipleSurveysFirstUser,
  idOfTheOpenSurvey,
  idOfCreateNewOpenSurvey,
  idOfOpenSurvey01,
  answerFromFirstUserForDistributedSurvey,
  distributedSurvey,
  idOfDistributedSurvey,
  idOfTheCreatedSurvey,
  idOfCreatedSurvey01,
  idOfCreateNewCreatedSurvey,
  answerFromFirstUserForAnsweredSurvey01,
  answerFromFirstUserForAnsweredSurvey02,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfAnswerFromFirstUserForAnsweredSurvey01,
  newId,
  unknownId,
} from './mocks';

describe('UsersSurveysService', () => {
  let service: UsersSurveysService;
  let userModel: Model<UserDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(),
        },
        SurveysService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveysAnswerService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    service = module.get<UsersSurveysService>(UsersSurveysService);
    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
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
        exec: jest.fn().mockResolvedValue({ ...firstMockUser, usersSurveys: basicUserSurveysFirstUser }),
      });

      const result = await service.updateUser(firstUsername, { usersSurveys: basicUserSurveysFirstUser });
      expect(result).toStrictEqual({ ...firstMockUser, usersSurveys: basicUserSurveysFirstUser });

      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: basicUserSurveysFirstUser },
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
      expect(result).toEqual([idOfTheOpenSurvey, idOfOpenSurvey01, idOfDistributedSurvey]);
    });
  });

  describe('getCreatedSurveyIds', () => {
    it('should return created survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.getCreatedSurveyIds(firstUsername);
      expect(result).toEqual([idOfTheCreatedSurvey, idOfCreatedSurvey01, idOfDistributedSurvey]);
    });
  });

  describe('getAnsweredSurveyIds', () => {
    it('should return answered survey ids', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue([
            answerFromFirstUserForAnsweredSurvey01,
            answerFromFirstUserForAnsweredSurvey02,
            answerFromFirstUserForDistributedSurvey,
          ]),
      });

      const result = await service.getAnsweredSurveyIds(firstUsername);
      expect(result).toEqual([idOfAnsweredSurvey01, idOfAnsweredSurvey02, distributedSurvey]);
    });
  });

  describe('updateUserIfSurveyWasAssigned', () => {
    it('should remove survey from users survey list of openSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUser');

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
      });

      await service.saveUserWithUpdatedUsersSurveys(
        firstMockUser,
        userSurveysAfterRemoveOpenSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveOpenSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveOpenSurveyFirstUser.answeredSurveys,
      );
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser,
      });
      expect(service.updateUser).toHaveReturned();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser },
        { new: true },
      );
      expect(userModel.findOneAndUpdate).toHaveReturned();
    });

    it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUser');

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
      });

      await service.saveUserWithUpdatedUsersSurveys(
        firstMockUser,
        userSurveysAfterRemoveCreatedSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveCreatedSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveCreatedSurveyFirstUser.answeredSurveys,
      );
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser,
      });
      expect(service.updateUser).toHaveReturned();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser },
        { new: true },
      );
      expect(userModel.findOneAndUpdate).toHaveReturned();
    });

    it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUser');

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
      });

      await service.saveUserWithUpdatedUsersSurveys(
        firstMockUser,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.answeredSurveys,
      );
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser,
      });
      expect(service.updateUser).toHaveReturned();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser },
        { new: true },
      );
      expect(userModel.findOneAndUpdate).toHaveReturned();
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      jest.spyOn(service, 'updateUser');

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
      });

      await service.saveUserWithUpdatedUsersSurveys(
        firstMockUser,
        userSurveysAfterRemoveDistributedSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveDistributedSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveDistributedSurveyFirstUser.answeredSurveys,
      );
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser,
      });
      expect(service.updateUser).toHaveReturned();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser },
        { new: true },
      );
      expect(userModel.findOneAndUpdate).toHaveReturned();
    });

    it('should remove multiple surveys from the list of open-, created-, and answeredSurveys', async () => {
      jest.spyOn(service, 'updateUser');

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser }),
      });

      await service.saveUserWithUpdatedUsersSurveys(
        firstMockUser,
        userSurveysAfterRemoveMultipleSurveysFirstUser.createdSurveys,
        userSurveysAfterRemoveMultipleSurveysFirstUser.openSurveys,
        userSurveysAfterRemoveMultipleSurveysFirstUser.answeredSurveys,
      );
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser,
      });
      expect(service.updateUser).toHaveReturned();
      expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
        { username: firstUsername },
        { usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser },
        { new: true },
      );
      expect(userModel.findOneAndUpdate).toHaveReturned();
    });
  });

  describe('updateUserIfSurveyWasAssigned', () => {
    it('should return null if the users survey list does not have to be updated', async () => {
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            answerFromFirstUserForAnsweredSurvey01,
            answerFromFirstUserForAnsweredSurvey02,
            answerFromFirstUserForDistributedSurvey,
          ]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(firstMockUser),
      });

      const result = await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [unknownId]);
      expect(result).toEqual(firstMockUser);
    });

    it('should remove survey from users survey list of openSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');
      jest.spyOn(UsersSurveysService, 'filterOutSurveyIds');

      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            answerFromFirstUserForAnsweredSurvey01,
            answerFromFirstUserForAnsweredSurvey02,
            answerFromFirstUserForDistributedSurvey,
          ]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
      });

      await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [idOfTheOpenSurvey]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveReturned();

      expect(UsersSurveysService.filterOutSurveyIds).toHaveBeenCalledTimes(2);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledWith(
        firstMockUser,
        userSurveysAfterRemoveOpenSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveOpenSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveOpenSurveyFirstUser.answeredSurveys,
      );
    });

    it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');
      jest.spyOn(UsersSurveysService, 'filterOutSurveyIds');

      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([
            answerFromFirstUserForAnsweredSurvey01,
            answerFromFirstUserForAnsweredSurvey02,
            answerFromFirstUserForDistributedSurvey,
          ]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
      });

      await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [idOfTheCreatedSurvey]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveReturned();

      expect(UsersSurveysService.filterOutSurveyIds).toHaveBeenCalledTimes(2);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledWith(
        firstMockUser,
        userSurveysAfterRemoveCreatedSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveCreatedSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveCreatedSurveyFirstUser.answeredSurveys,
      );
    });

    it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');
      jest.spyOn(UsersSurveysService, 'filterOutSurveyIds');

      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([answerFromFirstUserForAnsweredSurvey02, answerFromFirstUserForDistributedSurvey]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
      });

      await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [idOfAnsweredSurvey01]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveReturned();

      expect(UsersSurveysService.filterOutSurveyIds).toHaveBeenCalledTimes(2);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledWith(
        firstMockUser,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveAnsweredSurveyFirstUser.answeredSurveys,
      );
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');
      jest.spyOn(UsersSurveysService, 'filterOutSurveyIds');

      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue([answerFromFirstUserForAnsweredSurvey01, answerFromFirstUserForAnsweredSurvey02]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
      });

      await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [idOfDistributedSurvey]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveReturned();

      expect(UsersSurveysService.filterOutSurveyIds).toHaveBeenCalledTimes(2);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledWith(
        firstMockUser,
        userSurveysAfterRemoveDistributedSurveyFirstUser.createdSurveys,
        userSurveysAfterRemoveDistributedSurveyFirstUser.openSurveys,
        userSurveysAfterRemoveDistributedSurveyFirstUser.answeredSurveys,
      );
    });

    it('should remove multiple surveys from the list of open-, created-, and answeredSurveys', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');
      jest.spyOn(UsersSurveysService, 'filterOutSurveyIds');

      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue([answerFromFirstUserForAnsweredSurvey02, answerFromFirstUserForDistributedSurvey]),
      });

      service.saveUserWithUpdatedUsersSurveys = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser }),
      });

      await service.updateUsersUsersSurveysOnSurveyRemoval(firstMockUser, [
        idOfOpenSurvey01,
        idOfCreatedSurvey01,
        idOfAnsweredSurvey01,
      ]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveReturned();

      expect(UsersSurveysService.filterOutSurveyIds).toHaveBeenCalledTimes(2);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledWith(
        firstMockUser,
        userSurveysAfterRemoveMultipleSurveysFirstUser.createdSurveys,
        userSurveysAfterRemoveMultipleSurveysFirstUser.openSurveys,
        userSurveysAfterRemoveMultipleSurveysFirstUser.answeredSurveys,
      );
    });
  });

  describe('updateUsersOnSurveyRemoval', () => {
    it('should not call saveUserWithUpdatedUsersSurveys() if the survey was not assigned to the users surveys', async () => {
      jest.spyOn(service, 'updateUsersUsersSurveysOnSurveyRemoval');

      jest.spyOn(service, 'saveUserWithUpdatedUsersSurveys');

      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser]),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(firstMockUser.usersSurveys.answeredSurveys),
      });

      await service.updateUsersOnSurveyRemoval([unknownId]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveBeenCalledTimes(1);
      expect(service.saveUserWithUpdatedUsersSurveys).toHaveBeenCalledTimes(0);
    });

    it('should remove survey from list of openSurveys if survey gets deleted and is open', async () => {
      userModel.find = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
      });
      service.updateUsersUsersSurveysOnSurveyRemoval = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
      });

      await service.updateUsersOnSurveyRemoval([idOfTheOpenSurvey]);
      expect(service.updateUsersUsersSurveysOnSurveyRemoval).toHaveBeenCalledTimes(2);
    });

    it('should remove survey from list of createdSurveys if survey gets deleted and is in the created list', async () => {
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue([firstMockUser]),
      });
      service.updateUsersUsersSurveysOnSurveyRemoval = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
      });
      service.updateUser = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
      });

      jest.spyOn(service, 'updateUser');

      await service.updateUsersOnSurveyRemoval([idOfTheCreatedSurvey]);
      expect(service.updateUser).toHaveBeenCalledTimes(0);
    });

    it('should remove survey from list of answeredSurveys if survey gets deleted was already answered', async () => {
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockUser]),
      });
      service.updateUsersUsersSurveysOnSurveyRemoval = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
      });
      service.updateUser = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
      });

      await service.updateUsersOnSurveyRemoval([idOfAnswerFromFirstUserForAnsweredSurvey01]);
      expect(service.updateUser).toHaveBeenCalledTimes(0);
    });

    it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockUser]),
      });
      service.updateUsersUsersSurveysOnSurveyRemoval = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
      });
      service.updateUser = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
      });

      await service.updateUsersOnSurveyRemoval([idOfDistributedSurvey]);
      expect(service.updateUser).toHaveBeenCalledTimes(0);
    });

    it('should throw an error if the user is not found', async () => {
      userModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(null),
      });
      surveyAnswerModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([]),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest
          .fn()
          .mockReturnValue(new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND)),
      });

      await expect(service.updateUsersOnSurveyRemoval([idOfDistributedSurvey])).rejects.toThrow(
        new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND),
      );
    });
  });

  describe('addToCreatedSurveys', () => {
    it('should add a survey to the list of created surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterCreatingNewSurveyFirstUser,
        }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToCreatedSurveys(firstUsername, idOfCreateNewCreatedSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        ...firstMockUser,
        usersSurveys: userSurveysAfterCreatingNewSurveyFirstUser,
      });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(null),
      });

      try {
        await service.addToCreatedSurveys('not-found', idOfDistributedSurvey);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
      }
    });
  });

  describe('addToOpenSurveys', () => {
    it('should add a survey to open surveys', async () => {
      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(firstMockUser),
      });

      userModel.findOneAndUpdate = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue({
          ...firstMockUser,
          usersSurveys: userSurveysAfterCreatingNewOpenSurveyFirstUser,
        }),
      });

      jest.spyOn(service, 'updateUser');

      await service.addToOpenSurveys(firstUsername, idOfCreateNewOpenSurvey);
      expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
        ...firstMockUser,
        usersSurveys: userSurveysAfterCreatingNewOpenSurveyFirstUser,
      });
    });

    it('should throw an error if the user is not found', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(null),
      });

      try {
        expect(await service.addToCreatedSurveys('not-found', idOfDistributedSurvey)).toThrow(
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
          .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddingNewOpenSurveyFirstUser }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([firstParticipant], newId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(firstUsername, newId);
    });

    it('should populate survey to second participant', async () => {
      userModel.findOne = jest.fn().mockReturnValueOnce({
        exec: jest.fn().mockResolvedValue(secondMockUser),
      });
      userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
        exec: jest
          .fn()
          .mockResolvedValue({ username: secondUsername, usersSurveys: userSurveysAfterAddingNewOpenSurveySecondUser }),
      });

      jest.spyOn(service, 'addToOpenSurveys');

      await service.populateSurvey([secondParticipant], newId);
      expect(service.addToOpenSurveys).toHaveBeenCalledWith(secondUsername, newId);
    });
  });
});
