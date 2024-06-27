/* eslint-disable */

import { Model } from 'mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import SurveysController from './surveys.controller';
import SurveysService from './surveys.service';
import UsersSurveysService from './users-surveys.service';
import { SurveyModel, SurveyDocument } from './survey.schema';
import {
  first_username,
  id_FirstMockSurvey,
  id_SecondMockSurvey,
  id_ThirdMockSurvey,
  firstMockSurvey,
  secondMockSurvey,
  thirdMockSurvey,
  mockSurveys,
  publicAnswer_FirstMockSurvey,
  // fourthMockSurvey,
  // id_FourthMockSurvey,
  // mocked_participants,
  // newObjectId,
  // second_username,
  // addNewPublicAnswer_ThirdMockSurvey,
  // thirdMockSurvey_afterAddedNewAnswer,
} from './surveys.service.mock';
import { mockedAnswer } from './users-surveys.service.mock';
import { User, UserDocument } from '../users/user.schema';
// import NotAbleToUpdateSurveyError from "@libs/survey/errors/not-able-to-update-survey-error";
// import SurveyErrors from "@libs/survey/survey-errors";
// import NotAbleToDeleteSurveyError from "@libs/survey/errors/not-able-to-delete-survey-error";

const firstUser = {
  email: 'first@example.com',
  username: first_username,
  roles: ['user'],
  mfaEnabled: false,
  isTotpSet: false,
  usersSurveys: {
    openSurveys: [id_ThirdMockSurvey],
    createdSurveys: [id_SecondMockSurvey],
    answeredSurveys: [{ surveyId: id_FirstMockSurvey, answer: mockedAnswer }],
  },
};

// const firstUser_afterAddedAnswer = {
//   email: 'first@example.com',
//   username: first_username,
//   roles: ['user'],
//   mfaEnabled: false,
//   isTotpSet: false,
//   usersSurveys: {
//     openSurveys: [],
//     createdSurveys: [id_SecondMockSurvey],
//     answeredSurveys: [
//       { surveyId: id_FirstMockSurvey, answer: mockedAnswer },
//       { surveyId: id_ThirdMockSurvey, answer: addNewPublicAnswer_ThirdMockSurvey },
//     ],
//   },
// };

describe('SurveysController', () => {
  let controller: SurveysController;
  let surveysService: SurveysService;
  let usersSurveysService: UsersSurveysService;
  let userModel: Model<UserDocument>;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SurveysController],
      providers: [
        SurveysService,
        {
          provide: getModelToken(SurveyModel.name),
          useValue: jest.fn(),
        },
        UsersSurveysService,
        {
          provide: getModelToken(User.name),
          useValue: jest.fn(),
        },
      ],
    }).compile();

    controller = module.get<SurveysController>(SurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
    usersSurveysService = module.get<UsersSurveysService>(UsersSurveysService);

    userModel = module.get<Model<UserDocument>>(getModelToken(User.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(SurveyModel.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findOneSurvey', () => {
    it('should return a survey given the id', async () => {
      jest.spyOn(surveysService, 'findOneSurvey');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      await controller
        .findOneSurvey(id_FirstMockSurvey)
        .then((result) => expect(result).toEqual(firstMockSurvey))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findOneSurvey).toHaveBeenCalledWith(id_FirstMockSurvey);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: id_FirstMockSurvey });
    });
  });

  describe('findSurveys', () => {
    it('should return multiple surveys given the ids', async () => {
      jest.spyOn(surveysService, 'findSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce([firstMockSurvey, secondMockSurvey]),
      });

      await controller
        .findSurveys({ surveyIds: [id_FirstMockSurvey, id_SecondMockSurvey] })
        .then((result) => expect(result).toEqual([firstMockSurvey, secondMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_FirstMockSurvey, id_SecondMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ _id: { $in: [id_FirstMockSurvey, id_SecondMockSurvey] } });
    });
  });

  describe('getSurveyResult', () => {
    it('should return the public answers of a survey given the Id', async () => {
      jest.spyOn(surveysService, 'getPublicAnswers');

      surveyModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstMockSurvey),
      });

      await controller
        .getSurveyResult(id_FirstMockSurvey)
        .then((result) => expect(result).toEqual([publicAnswer_FirstMockSurvey]))
        .catch((error) => expect(error).toBeUndefined());

      expect(surveysService.getPublicAnswers).toHaveBeenCalledWith(id_FirstMockSurvey);
      expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: id_FirstMockSurvey });
    });
  });

  describe('getOpenSurveys', () => {
    it('should return the list of open (not jet participated) surveys', async () => {
      jest.spyOn(usersSurveysService, 'getOpenSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([thirdMockSurvey]),
      });

      const result = await controller.getOpenSurveys(first_username);
      expect(result).toEqual([thirdMockSurvey]);

      expect(usersSurveysService.getOpenSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_ThirdMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ _id: { $in: [id_ThirdMockSurvey] } });
    });
  });

  describe('getCreatedSurveys', () => {
    it('should return the list of surveys that the user created', async () => {
      jest.spyOn(usersSurveysService, 'getCreatedSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([secondMockSurvey]),
      });

      const result = await controller.getCreatedSurveys(first_username);
      expect(result).toEqual([secondMockSurvey]);

      expect(usersSurveysService.getCreatedSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_SecondMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ _id: { $in: [id_SecondMockSurvey] } });
    });
  });

  describe('getAnsweredSurveys', () => {
    it('should return the list of surveys the user has participated (answered) already', async () => {
      jest.spyOn(usersSurveysService, 'getAnsweredSurveyIds');
      jest.spyOn(surveysService, 'findSurveys');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockSurvey]),
      });

      const result = await controller.getAnsweredSurveys(first_username);
      expect(result).toEqual([firstMockSurvey]);

      expect(usersSurveysService.getAnsweredSurveyIds).toHaveBeenCalledWith(first_username);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
      expect(surveysService.findSurveys).toHaveBeenCalledWith([id_FirstMockSurvey]);
      expect(surveyModel.find).toHaveBeenCalledWith({ _id: { $in: [id_FirstMockSurvey] } });
    });
  });

  describe('getAllSurveys', () => {
    it('should return the full list of surveys', async () => {
      jest.spyOn(surveysService, 'getAllSurveys');

      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue(mockSurveys),
      });

      const result = await controller.getAllSurveys();
      expect(result).toEqual(mockSurveys);

      expect(surveysService.getAllSurveys).toHaveBeenCalledWith();
      expect(surveyModel.find).toHaveBeenCalledWith();
    });
  });

  describe('getCommittedSurveyAnswers', () => {
    it('should return the commited answer for a survey from user document', async () => {
      jest.spyOn(usersSurveysService, 'getCommitedAnswer');

      userModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValueOnce(firstUser),
      });
      surveyModel.find = jest.fn().mockReturnValue({
        exec: jest.fn().mockReturnValue([firstMockSurvey]),
      });

      const result = await controller.getCommittedSurveyAnswers(
        { surveyId: id_FirstMockSurvey, participant: first_username },
        first_username,
      );
      expect(result).toEqual(mockedAnswer);

      expect(usersSurveysService.getCommitedAnswer).toHaveBeenCalledWith(first_username, id_FirstMockSurvey);
      expect(userModel.findOne).toHaveBeenCalledWith({ username: first_username });
    });
  });

  // describe('updateOrCreateSurvey', () => {
  //   it('should update a survey if it exists already', async () => {
  //     jest.spyOn(surveysService, 'updateOrCreateSurvey');
  //
  //     userModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(firstUser),
  //     });
  //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockResolvedValueOnce(firstUser),
  //     });
  //
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey),
  //     });
  //
  //     const result = await controller.updateOrCreateSurvey(secondMockSurvey, first_username);
  //     expect(result).toEqual(secondMockSurvey);
  //
  //     expect(surveysService.updateOrCreateSurvey).toHaveBeenCalledWith(secondMockSurvey);
  //     expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: id_SecondMockSurvey }, secondMockSurvey);
  //   });
    //
    //   it('should create a survey if it does not exists already', async () => {
    //     jest.spyOn(surveysService, 'updateOrCreateSurvey');
    //     jest.spyOn(usersSurveysService, 'addToCreatedSurveys');
    //     jest.spyOn(usersSurveysService, 'populateSurvey');
    //
    //     userModel.findOne = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(firstUser),
    //     });
    //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockReturnValue(null),
    //     });
    //     surveyModel.create = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(fourthMockSurvey),
    //     });
    //
    //     const result = await controller.updateOrCreateSurvey(fourthMockSurvey, first_username);
    //     expect(result).toEqual(fourthMockSurvey);
    //
    //     expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith({ _id: id_FourthMockSurvey }, fourthMockSurvey);
    //
    //
    //     expect(usersSurveysService.addToCreatedSurveys).toHaveBeenCalledWith(first_username, id_FourthMockSurvey);
    //     expect(usersSurveysService.populateSurvey).toHaveBeenCalledWith(mocked_participants, id_FourthMockSurvey);
    //   });
    //
    //   it('should throw an error if the survey update fails', async () => {
    //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
    //       exec: jest.fn().mockRejectedValue(NotAbleToUpdateSurveyError),
    //     });
    //
    //     jest.spyOn(surveyModel, 'findOneAndUpdate');
    //
    //     try {
    //       await controller.updateOrCreateSurvey(secondMockSurvey, first_username);
    //     } catch (e) {
    //       expect(e).toBeInstanceOf(Error);
    //       expect(e.message).toBe(SurveyErrors.NotAbleToUpdateSurveyError);
    //     }
    //   });
    // });
    //
    // describe('deleteSurvey', () => {
    //   it('should remove a survey', async () => {
    //     jest.spyOn(surveysService, 'deleteSurveys');
    //
    //     surveyModel.deleteMany = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(true),
    //     });
    //
    //     const result = await controller.deleteSurvey({ surveyIds: [id_FirstMockSurvey] });
    //     expect(result).toBe(true);
    //
    //     expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_FirstMockSurvey]);
    //   });
    //
    //   it('should remove multiple surveys', async () => {
    //     jest.spyOn(surveysService, 'deleteSurveys');
    //
    //     surveyModel.deleteMany = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(true),
    //     });
    //
    //     const result = await controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey, id_ThirdMockSurvey] });
    //     expect(result).toBe(true);
    //
    //     expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_SecondMockSurvey, id_ThirdMockSurvey]);
    //   });
    //
    //
    //   it('should throw an error if the survey removal fails', async () => {
    //     jest.spyOn(surveysService, 'deleteSurveys');
    //
    //     surveyModel.deleteMany = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockRejectedValueOnce(NotAbleToDeleteSurveyError),
    //     });
    //
    //     try {
    //       await controller.deleteSurvey({ surveyIds: [id_SecondMockSurvey, id_ThirdMockSurvey] });
    //     } catch (e) {
    //       expect(e).toBeInstanceOf(Error);
    //       expect(e.message).toBe(SurveyErrors.NotAbleToDeleteSurveyError);
    //     }
    //
    //     expect(surveysService.deleteSurveys).toHaveBeenCalledWith([id_SecondMockSurvey, id_ThirdMockSurvey]);
    //   });
    //
    //   it('should return false if the survey was not found', async () => {
    //
    //     jest.spyOn(surveysService, 'deleteSurveys');
    //
    //     surveyModel.deleteMany = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockRejectedValueOnce(false),
    //     });
    //
    //     const result = await controller.deleteSurvey({ surveyIds: [newObjectId] });
    //     expect(result).toBe(false);
    //
    //     expect(surveysService.deleteSurveys).toHaveBeenCalledWith([newObjectId]);
    //   });
    // });
    //
    // describe('answerSurvey', () => {
    //   it('should add an answer to a survey', async () => {
    //     jest.spyOn(surveysService, 'addPublicAnswer');
    //     jest.spyOn(usersSurveysService, 'addAnswer');
    //
    //     surveyModel.findOne = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockReturnValue(thirdMockSurvey),
    //     });
    //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockReturnValue(thirdMockSurvey_afterAddedNewAnswer),
    //     });
    //
    //     userModel.findOne = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(firstUser),
    //     });
    //     userModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockResolvedValueOnce(firstUser_afterAddedAnswer),
    //     });
    //
    //     const result = await controller.answerSurvey({
    //         surveyId: id_ThirdMockSurvey,
    //         answer: addNewPublicAnswer_ThirdMockSurvey,
    //         canSubmitMultipleAnswers: false,
    //       },
    //       second_username
    //     );
    //     expect(result).toHaveReturned();
    //
    //     expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(
    //       id_ThirdMockSurvey,
    //       addNewPublicAnswer_ThirdMockSurvey,
    //       first_username,
    //     );
    //     expect(surveysService.addPublicAnswer).toHaveReturnedWith(thirdMockSurvey_afterAddedNewAnswer);
    //     expect(usersSurveysService.addAnswer).toHaveBeenCalledWith(
    //       first_username,
    //       id_ThirdMockSurvey,
    //       addNewPublicAnswer_ThirdMockSurvey,
    //     );
    //     expect(usersSurveysService.addAnswer).toHaveReturnedWith(firstUser_afterAddedAnswer);
    //   });
    //
    //   it('should throw an error if adding an answer fails', async () => {
    //     jest.spyOn(surveysService, 'addPublicAnswer');
    //     jest.spyOn(usersSurveysService, 'addAnswer');
    //
    //     surveyModel.findOne = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockReturnValue(thirdMockSurvey),
    //     });
    //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
    //       exec: jest.fn().mockRejectedValueOnce(NotAbleToUpdateSurveyError),
    //     });
    //
    //     try {
    //       await controller.answerSurvey({
    //           surveyId: id_ThirdMockSurvey,
    //           answer: addNewPublicAnswer_ThirdMockSurvey,
    //           canSubmitMultipleAnswers: false,
    //         },
    //         second_username
    //       );
    //     } catch (e) {
    //       expect(e).toBeInstanceOf(Error);
    //       expect(e.message).toBe(SurveyErrors.NotAbleToUpdateSurveyError);
    //     }
    //
    //     expect(surveysService.addPublicAnswer).toHaveBeenCalledWith(
    //       id_ThirdMockSurvey,
    //       addNewPublicAnswer_ThirdMockSurvey,
    //       first_username,
    //     );
    //     expect(usersSurveysService.addAnswer).toHaveBeenCalledTimes(0);
    //   });
  // });











  //   it('in order to add an public answer it has to update the survey (first)', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(firstMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(firstMockSurvey_afterAddedNewAnswer),
  //     });
  //
  //     const result = await service.addPublicAnswer(
  //       firstMockSurvey._id,
  //       addNewPublicAnswer_FirstMockSurvey,
  //       second_username,
  //       true,
  //     );
  //
  //     expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: firstMockSurvey._id });
  //     expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
  //       { _id: firstMockSurvey._id },
  //       { ...partial_firstMockSurvey_afterAddedNewAnswer },
  //     );
  //
  //     expect(result).toStrictEqual(firstMockSurvey_afterAddedNewAnswer);
  //   });
  //
  //   it('in order to add an public answer it has to update the survey (second)', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValue({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey_afterAddedNewAnswer),
  //     });
  //
  //     const result = await service.addPublicAnswer(
  //       secondMockSurvey._id,
  //       addNewPublicAnswer_SecondMockSurvey_thirdUser,
  //       third_username,
  //       false,
  //     );
  //
  //     expect(surveyModel.findOne).toHaveBeenCalledWith({ _id: secondMockSurvey._id });
  //     expect(surveyModel.findOneAndUpdate).toHaveBeenCalledWith(
  //       { _id: secondMockSurvey._id },
  //       { ...partial_secondMockSurvey_afterAddedNewAnswer },
  //     );
  //
  //     expect(result).toStrictEqual(secondMockSurvey_afterAddedNewAnswer);
  //   });
  //

  // describe('addPublicAnswer', () => {
  //   it('throw an error if the survey with the surveyId was not found', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(null),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });
  //
  //     jest.spyOn(surveyModel, 'findOne');
  //
  //     try {
  //       await service.addPublicAnswer(newObjectId, addNewPublicAnswer_FirstMockSurvey, second_username);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToFindSurveyError);
  //     }
  //   });
  //
  //   it('throw an error if a user adds an answer that is not marked as participating user', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(firstMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({ exec: jest.fn() });
  //
  //     jest.spyOn(surveyModel, 'findOneAndUpdate');
  //
  //     try {
  //       await service.addPublicAnswer(
  //         firstMockSurvey._id,
  //         addNewPublicAnswer_FirstMockSurvey,
  //         'NOT_EXISTING_USER_NAME',
  //       );
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToParticipateNotAnParticipantError);
  //     }
  //   });
  //
  //   it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (first)', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(firstMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValueOnce(firstMockSurvey_afterAddedNewAnswer),
  //     });
  //
  //     jest.spyOn(surveyModel, 'findOneAndUpdate');
  //
  //     try {
  //       await service.addPublicAnswer(firstMockSurvey._id, addNewPublicAnswer_FirstMockSurvey, first_username);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
  //     }
  //   });
  //
  //   it('throw an error if a user adds an answer that already has participated and the survey does not accept multiple answers (second)', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockResolvedValueOnce(secondMockSurvey_afterAddedNewAnswer),
  //     });
  //
  //     jest.spyOn(surveyModel, 'findOneAndUpdate');
  //
  //     try {
  //       await service.addPublicAnswer(secondMockSurvey._id, addNewPublicAnswer_SecondMockSurvey, second_username);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
  //     }
  //   });
  //
  //   it('should throw an error if the survey update fails', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockRejectedValueOnce(NotAbleToParticipateNotAnParticipantError),
  //     });
  //
  //     jest.spyOn(surveyModel, 'findOneAndUpdate');
  //
  //     try {
  //       await service.addPublicAnswer(secondMockSurvey._id, publicAnswer_FirstMockSurvey, 'NOT_EXISTING_USER_NAME');
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToParticipateNotAnParticipantError);
  //     }
  //   });
  //
  //   it('should throw an error if the survey update fails', async () => {
  //     surveyModel.findOne = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockReturnValue(secondMockSurvey),
  //     });
  //     surveyModel.findOneAndUpdate = jest.fn().mockReturnValueOnce({
  //       exec: jest.fn().mockRejectedValueOnce(NotAbleToParticipateAlreadyParticipatedError),
  //     });
  //
  //     jest.spyOn(surveyModel, 'findOneAndUpdate');
  //
  //     try {
  //       await service.addPublicAnswer(secondMockSurvey._id, publicAnswer_FirstMockSurvey, first_username);
  //     } catch (e) {
  //       expect(e).toBeInstanceOf(Error);
  //       expect(e.message).toBe(SurveyErrors.NotAbleToParticipateAlreadyParticipatedError);
  //     }
  //   });
  // });
});
