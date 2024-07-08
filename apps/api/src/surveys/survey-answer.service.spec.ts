// import { Model } from 'mongoose';
// import { Test, TestingModule } from '@nestjs/testing';
// import { getModelToken } from '@nestjs/mongoose';
// import SurveyErrorMessages from '@libs/survey/survey-error-messages';
// import SurveyAnswerService from './survey-answer.service';
// import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
// import {
//   newObjectId,
//   firstUsername,
//   firstMockSurvey,
//   firstMockSurveyAfterAddedNewAnswer,
//   secondUsername,
//   addNewPublicAnswerToFirstMockSurvey, firstMockSurveyId, publicAnswerForFirstMockSurvey,
// } from './surveys.service.mock';
// import {
//   mockedAnswer,
//   openSurvey,
//   userSurveys,
//   userSurveysAfterAddAnswerForOpenSurvey
// } from './users-surveys.service.mock';
//
// describe('SurveyService', () => {
//   let surveyAnswersService: SurveyAnswerService;
//   let surveyAnswerModel: Model<SurveyAnswerDocument>;
//
//   beforeEach(async () => {
//     const module: TestingModule = await Test.createTestingModule({
//       providers: [
//         SurveyAnswerService,
//         {
//           provide: getModelToken(SurveyAnswer.name),
//           useValue: jest.fn(),
//         },
//       ],
//     }).compile();
//
//     surveyAnswersService = module.get<SurveyAnswerService>(SurveyAnswerService);
//     surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
//   });
//
//   afterEach(() => {
//     jest.clearAllMocks();
//   });
//
//   it('should be defined', () => {
//     expect(surveyAnswersService).toBeDefined();
//   });
//
//   describe('addAnswer', () => {
//     it('should remove the survey from open surveys and move it to answered together with the answer', async () => {
//       userModel.findOne = jest.fn().mockReturnValue({
//         exec: jest.fn().mockResolvedValue({ username: firstUsername, usersSurveys: userSurveys }),
//       });
//       userModel.findOneAndUpdate = jest.fn().mockReturnValue({
//         exec: jest
//           .fn()
//           .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
//       });
//
//       jest.spyOn(service, 'updateUser');
//
//       await service.addAnswer(firstUsername, openSurvey, mockedAnswer, false);
//       expect(service.updateUser).toHaveBeenCalledWith(firstUsername, {
//         username: firstUsername,
//         usersSurveys: userSurveysAfterAddAnswerForOpenSurvey,
//       });
//     });
//   });
//
//   describe('addAnswer', () => {
//     it('throw an error if the survey with the surveyId was not found', async () => {
//       surveyAnswerModel.findOne = jest.fn().mockReturnValueOnce({
//         exec: jest.fn().mockReturnValue(null),
//       });
//       surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });
//
//       jest.spyOn(surveyAnswerModel, 'findOne');
//
//       try {
//         await surveyAnswersService.addAnswer(newObjectId, addNewPublicAnswerToFirstMockSurvey, secondUsername);
//       } catch (e) {
//         expect(e).toBeInstanceOf(Error);
//         expect(e.message).toBe(SurveyErrorMessages.NotAbleToFindSurveyError);
//       }
//     });
//
//     it('throw an error if a user adds an answer that is not marked as participating user', async () => {
//       surveyAnswerModel.findOne = jest.fn().mockReturnValueOnce({
//         exec: jest.fn().mockReturnValue(firstMockSurvey),
//       });
//       surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });
//
//       jest.spyOn(surveyAnswerModel, 'findOneAndUpdate');
//
//       try {
//         await surveyAnswersService.addAnswer(
//           firstMockSurvey.id,
//           addNewPublicAnswerToFirstMockSurvey,
//           'NOT_EXISTING_USER_NAME',
//         );
//       } catch (e) {
//         expect(e).toBeInstanceOf(Error);
//         expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateNotAnParticipantError);
//       }
//     });
//
//     it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers', async () => {
//       surveyAnswerModel.findOne = jest.fn().mockReturnValueOnce({
//         exec: jest.fn().mockReturnValue(firstMockSurvey),
//       });
//       surveyAnswerModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
//         exec: jest.fn().mockResolvedValueOnce(firstMockSurveyAfterAddedNewAnswer),
//       });
//
//       jest.spyOn(surveyAnswerModel, 'findOneAndUpdate');
//
//       try {
//         await surveyAnswersService.addAnswer(firstMockSurvey.id, addNewPublicAnswerToFirstMockSurvey, firstUsername);
//       } catch (e) {
//         expect(e).toBeInstanceOf(Error);
//         expect(e.message).toBe(SurveyErrorMessages.NotAbleToParticipateAlreadyParticipatedError);
//       }
//     });
//   });
//
//
//   describe('getPublicAnswer', () => {
//     it('should return the public answers of a survey given the Id', async () => {
//       jest.spyOn(surveyAnswerModel, 'getPublicAnswers');
//
//       surveyAnswerModel.findOne = jest.fn().mockReturnValue({
//         exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
//       });
//
//       await controller
//         .getSurveyResult(firstMockSurveyId)
//         .then((result) => expect(result).toEqual([publicAnswerForFirstMockSurvey]))
//         .catch((error) => expect(error).toBeUndefined());
//
//       expect(surveyAnswersService.getPublicAnswers).toHaveBeenCalledWith(firstMockSurveyId);
//       expect(surveyAnswerModel.findOne).toHaveBeenCalledWith({ id: firstMockSurveyId });
//     });
//   });
//
//   describe('getPrivateAnswer', () => {
//     it('should return the previously commited answer for the survey with props.surveyId from user with props.username', async () => {
//       surveyAnswerModel.findOne = jest.fn().mockReturnValueOnce({
//         exec: jest
//           .fn()
//           .mockResolvedValue({ username: firstUsername, usersSurveys: userSurveysAfterAddAnswerForOpenSurvey }),
//       });
//
//       jest.spyOn(surveyAnswersService, 'getPrivateAnswer');
//
//       const result = await surveyAnswersService.getPrivateAnswer(openSurvey, firstUsername);
//       expect(result).toStrictEqual(mockedAnswer);
//     });
//   });
// });
