// import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
// import { HttpStatus } from '@nestjs/common';
// import CustomHttpException from '@libs/error/CustomHttpException';
// import UserErrorMessages from '@libs/user/user-error-messages';
import { User, UserDocument } from '../users/user.schema';
import UsersSurveysService from './users-surveys.service';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import SurveysAnswerService from './survey-answer.service';
// import {
//   firstUsername,
//   secondUsername,
//   firstParticipant,
//   secondParticipant,
//   firstMockUser,
//   secondMockUser,
//   basicUserSurveysFirstUser,
//   userSurveysAfterAddingNewOpenSurveyFirstUser,
//   userSurveysAfterCreatingNewOpenSurveyFirstUser,
//   userSurveysAfterCreatingNewSurveyFirstUser,
//   userSurveysAfterRemoveAnsweredSurveyFirstUser,
//   userSurveysAfterRemoveCreatedSurveyFirstUser,
//   userSurveysAfterRemoveDistributedSurveyFirstUser,
//   userSurveysAfterRemoveOpenSurveyFirstUser,
//   userSurveysAfterAddingNewOpenSurveySecondUser,
//   userSurveysAfterRemoveMultipleSurveysFirstUser,
//   idOfTheOpenSurvey,
//   idOfCreateNewOpenSurvey,
//   idOfOpenSurvey01,
//   answerFromFirstUserForDistributedSurvey,
//   distributedSurvey,
//   idOfDistributedSurvey,
//   idOfTheCreatedSurvey,
//   idOfCreatedSurvey01,
//   idOfCreateNewCreatedSurvey,
//   answerFromFirstUserForAnsweredSurvey01,
//   answerFromFirstUserForAnsweredSurvey02,
//   idOfAnsweredSurvey01,
//   idOfAnsweredSurvey02,
//   idOfAnswerFromFirstUserForAnsweredSurvey01,
//   newId,
//   unknownId,
// } from './mocks';

describe('UsersSurveysService', () => {
  let service: UsersSurveysService;
  // let userModel: Model<UserDocument>;
  // let surveyAnswerModel: Model<SurveyAnswerDocument>;

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
    // userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    // surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
  });

  afterEach(() => {
    // userModel.
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // describe('getExistingUser', () => {
  //   it('should return a user', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(firstMockUser),
  //     });
  //
  //     const result = await service.getExistingUser(firstUsername);
  //     expect(result).toStrictEqual(firstMockUser);
  //     expect(userModel.findOne).toHaveBeenCalledWith({ username: firstUsername });
  //   });
  //
  //   it('should throw an error if the user is not found', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(null),
  //     });
  //
  //     try {
  //       await service.getExistingUser('not-existing-user');
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
  //     }
  //   });
  // });
  //
  // describe('updateUser', () => {
  //   it('should update a user', async () => {
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue({ ...firstMockUser, usersSurveys: basicUserSurveysFirstUser }),
  //     });
  //
  //     const result = await service.updateUser(firstUsername, { usersSurveys: basicUserSurveysFirstUser });
  //     expect(result).toStrictEqual({ ...firstMockUser, usersSurveys: basicUserSurveysFirstUser });
  //
  //     expect(userModel.findOneAndUpdate).toHaveBeenCalledWith(
  //       { username: firstUsername },
  //       { usersSurveys: basicUserSurveysFirstUser },
  //       { new: true },
  //     );
  //   });
  // });
  //
  // describe('getOpenSurveyIds', () => {
  //   it('should return open survey ids', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(firstMockUser),
  //     });
  //
  //     const result = await service.getOpenSurveyIds(firstUsername);
  //     expect(result).toEqual([idOfTheOpenSurvey, idOfOpenSurvey01, idOfDistributedSurvey]);
  //   });
  // });
  //
  // describe('getCreatedSurveyIds', () => {
  //   it('should return created survey ids', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(firstMockUser),
  //     });
  //
  //     const result = await service.getCreatedSurveyIds(firstUsername);
  //     expect(result).toEqual([idOfTheCreatedSurvey, idOfCreatedSurvey01, idOfDistributedSurvey]);
  //   });
  // });
  //
  // describe('getAnsweredSurveyIds', () => {
  //   it('should return answered survey ids', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(firstMockUser),
  //     });
  //     surveyAnswerModel.find = jest.fn().mockReturnValueOnce({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([
  //           answerFromFirstUserForAnsweredSurvey01,
  //           answerFromFirstUserForAnsweredSurvey02,
  //           answerFromFirstUserForDistributedSurvey,
  //         ]),
  //     });
  //
  //     const result = await service.getAnsweredSurveyIds(firstUsername);
  //     expect(result).toEqual([idOfAnsweredSurvey01, idOfAnsweredSurvey02, distributedSurvey]);
  //   });
  // });
  //
  // describe('updateUserOnRemovalOfSurvey', () => {
  //   it('should return null if the users survey list does not have to be updated', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([
  //           answerFromFirstUserForAnsweredSurvey01,
  //           answerFromFirstUserForAnsweredSurvey02,
  //           answerFromFirstUserForDistributedSurvey,
  //         ]),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue(firstMockUser),
  //       then: jest
  //         .fn()
  //         .mockResolvedValue(firstMockUser),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue(firstMockUser),
  //     });
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [unknownId]);
  //     expect(result).toEqual(firstMockUser);
  //   });
  //
  //   it('should remove survey from users survey list of openSurveys if assigned survey gets deleted', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([
  //           answerFromFirstUserForAnsweredSurvey01,
  //           answerFromFirstUserForAnsweredSurvey02,
  //           answerFromFirstUserForDistributedSurvey,
  //         ]),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
  //       then: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
  //     });
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [idOfTheOpenSurvey]);
  //     expect(result).toEqual({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser });
  //   });
  //
  //   it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([
  //           answerFromFirstUserForAnsweredSurvey01,
  //           answerFromFirstUserForAnsweredSurvey02,
  //           answerFromFirstUserForDistributedSurvey,
  //         ]),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //       then: jest
  //         .fn()
  //         .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //     });
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [idOfTheCreatedSurvey]);
  //     expect(result).toEqual({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser });
  //   });
  //
  //   it('should remove survey from users survey list of createdSurveys if assigned survey gets deleted', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([answerFromFirstUserForAnsweredSurvey02, answerFromFirstUserForDistributedSurvey]),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //       then: jest
  //         .fn()
  //         .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //     });
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [idOfAnsweredSurvey01]);
  //     expect(result).toEqual({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser });
  //   });
  //
  //   it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([answerFromFirstUserForAnsweredSurvey01, answerFromFirstUserForAnsweredSurvey02]),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //       then: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //     });
  //
  //     jest.spyOn(service, 'filterOutSurveyIds');
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [idOfDistributedSurvey]);
  //     expect(result).toEqual({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser });
  //
  //     expect(service.filterOutSurveyIds).toHaveBeenCalledTimes(2);
  //   });
  //
  //   it('should remove multiple surveys from the list of open-, created-, and answeredSurveys', async () => {
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue([answerFromFirstUserForAnsweredSurvey02, answerFromFirstUserForDistributedSurvey]),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser }),
  //       then: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser }),
  //     });
  //
  //     const result = await service.updateUserOnRemovalOfSurvey(firstMockUser, [
  //       idOfOpenSurvey01,
  //       idOfCreatedSurvey01,
  //       idOfAnsweredSurvey01,
  //     ]);
  //     expect(result).toEqual({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveMultipleSurveysFirstUser });
  //   });
  // });
  //
  // describe('onRemoveSurvey', () => {
  //   it('should remove survey from list of openSurveys if survey gets deleted and is open', async () => {
  //     userModel.find = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue([firstMockUser, secondMockUser]),
  //     });
  //     service.updateUserOnRemovalOfSurvey = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveOpenSurveyFirstUser }),
  //     });
  //
  //     await service.onRemoveSurveys([idOfTheOpenSurvey]);
  //     expect(service.updateUserOnRemovalOfSurvey).toHaveBeenCalledTimes(2);
  //   });
  //
  //   it('should remove survey from list of createdSurveys if survey gets deleted and is in the created list', async () => {
  //     userModel.find = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockResolvedValue([firstMockUser]),
  //     });
  //     service.updateUserOnRemovalOfSurvey = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveCreatedSurveyFirstUser }),
  //     });
  //
  //     jest.spyOn(service, 'updateUser');
  //
  //     await service.onRemoveSurveys([idOfTheCreatedSurvey])
  //     expect(service.updateUser).toHaveBeenCalledTimes(0);
  //   });
  //
  //   it('should remove survey from list of answeredSurveys if survey gets deleted was already answered', async () => {
  //     userModel.find = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue([firstMockUser]),
  //     });
  //     service.updateUserOnRemovalOfSurvey = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockReturnValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveAnsweredSurveyFirstUser }),
  //     });
  //
  //     await service.onRemoveSurveys([idOfAnswerFromFirstUserForAnsweredSurvey01])
  //     expect(service.updateUser).toHaveBeenCalledTimes(0);
  //   });
  //
  //   it('should remove survey from list of open-, created-, and answeredSurveys list if survey gets deleted and is included in all 3 (somehow)', async () => {
  //     userModel.find = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue([firstMockUser]),
  //     });
  //     service.updateUserOnRemovalOfSurvey = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //     });
  //     service.updateUser = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ ...firstMockUser, usersSurveys: userSurveysAfterRemoveDistributedSurveyFirstUser }),
  //     });
  //
  //     await service.onRemoveSurveys([idOfDistributedSurvey])
  //     expect(service.updateUser).toHaveBeenCalledTimes(0);
  //   });
  //
  //   it('should throw an error if the user is not found', async () => {
  //     userModel.find = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(null),
  //     });
  //     surveyAnswerModel.find = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue([]),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest
  //         .fn()
  //         .mockReturnValue(new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND)),
  //     });
  //
  //     await expect(service.onRemoveSurveys([idOfDistributedSurvey])).rejects.toThrow(
  //       new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND),
  //     );
  //   });
  // });
  //
  // describe('addToCreatedSurveys', () => {
  //   it('should add a survey to the list of created surveys', async () => {
  //     userModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(firstMockUser),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue({
  //         ...firstMockUser,
  //         usersSurveys: userSurveysAfterCreatingNewSurveyFirstUser,
  //       }),
  //     });
  //
  //     jest.spyOn(service, 'updateUser');
  //
  //     await service.addToCreatedSurveys(firstUsername, idOfCreateNewCreatedSurvey);
  //     expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
  //       ...firstMockUser,
  //       usersSurveys: userSurveysAfterCreatingNewSurveyFirstUser,
  //     });
  //   });
  //
  //   it('should throw an error if the user is not found', async () => {
  //     userModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(null),
  //     });
  //
  //     try {
  //       await service.addToCreatedSurveys('not-found', idOfDistributedSurvey);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
  //     }
  //   });
  // });
  //
  // describe('addToOpenSurveys', () => {
  //   it('should add a survey to open surveys', async () => {
  //     userModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(firstMockUser),
  //     });
  //
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue({
  //         ...firstMockUser,
  //         usersSurveys: userSurveysAfterCreatingNewOpenSurveyFirstUser,
  //       }),
  //     });
  //
  //     jest.spyOn(service, 'updateUser');
  //
  //     await service.addToOpenSurveys(firstUsername, idOfCreateNewOpenSurvey);
  //     expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
  //       ...firstMockUser,
  //       usersSurveys: userSurveysAfterCreatingNewOpenSurveyFirstUser,
  //     });
  //   });
  //
  //   it('should throw an error if the user is not found', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(null),
  //     });
  //
  //     try {
  //       expect(await service.addToCreatedSurveys('not-found', idOfDistributedSurvey)).toThrow(
  //         new CustomHttpException(UserErrorMessages.NotAbleToFindUserError, HttpStatus.NOT_FOUND),
  //       );
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(UserErrorMessages.NotAbleToFindUserError);
  //     }
  //   });
  // });
  //
  // describe('populateSurvey', () => {
  //   it('should populate survey to first participant', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(firstMockUser),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddingNewOpenSurveyFirstUser }),
  //     });
  //
  //     jest.spyOn(service, 'addToOpenSurveys');
  //
  //     await service.populateSurvey([firstParticipant], newId);
  //     expect(service.addToOpenSurveys).toHaveBeenCalledWith(firstUsername, newId);
  //   });
  //
  //   it('should populate survey to second participant', async () => {
  //     userModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValue(secondMockUser),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest
  //         .fn()
  //         .mockResolvedValue({ username: secondUsername, usersSurveys: userSurveysAfterAddingNewOpenSurveySecondUser }),
  //     });
  //
  //     jest.spyOn(service, 'addToOpenSurveys');
  //
  //     await service.populateSurvey([secondParticipant], newId);
  //     expect(service.addToOpenSurveys).toHaveBeenCalledWith(secondUsername, newId);
  //   });
  // });
});
