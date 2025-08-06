/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
 */

/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model, Types } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveysAttachmentService from 'apps/api/src/surveys/surveys-attachment.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveyAnswerService from './survey-answer.service';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import {
  answeredSurvey01,
  answeredSurvey02,
  answeredSurvey03,
  answeredSurvey04,
  answeredSurvey05,
  createdSurvey01,
  filteredChoices,
  filteredChoicesAfterAddingValidAnswer,
  firstMockJWTUser,
  firstMockUser,
  firstParticipant,
  firstUsername,
  firstUsersMockedAnswerForAnsweredSurveys01,
  firstUsersSurveyAnswerAnsweredSurvey01,
  idOfAnsweredSurvey01,
  idOfAnsweredSurvey02,
  idOfAnsweredSurvey03,
  idOfAnsweredSurvey04,
  idOfAnsweredSurvey05,
  idOfPublicSurvey01,
  idOfPublicSurvey02,
  idOfTheSurveyAnswerForTheAnsweredSurvey04,
  idOfTheSurveyAnswerForTheAnsweredSurvey05,
  mockedAnswerForAnsweredSurveys02,
  mockedAnswerForAnsweredSurveys04,
  newMockedAnswerForAnsweredSurveys05,
  newSurveyAnswerAnsweredSurvey05,
  openSurvey01,
  openSurvey02,
  publicSurvey01,
  publicSurvey02,
  publicSurvey02AfterAddingValidAnswer,
  publicSurvey02QuestionNameWithLimiters,
  saveNoAnsweredSurvey01,
  saveNoAnsweredSurvey02,
  saveNoAnsweredSurvey03,
  saveNoAnsweredSurvey04,
  saveNoAnsweredSurvey05,
  secondMockUser,
  secondParticipant,
  surveyAnswerAnsweredSurvey02,
  surveyAnswerAnsweredSurvey03,
  surveyAnswerAnsweredSurvey04,
  surveyAnswerAnsweredSurvey05,
  surveyUpdateInitialSurvey,
  updatedMockedAnswerForAnsweredSurveys03,
  updatedSurveyAnswerAnsweredSurvey03,
} from './mocks';
import SurveysService from './surveys.service';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import PushNotificationService from '../pushNotification/pushNotification.service';

describe('SurveyAnswerService', () => {
  let service: SurveyAnswerService;
  let model: Model<SurveyAnswerDocument>;
  let surveyModel: Model<SurveyDocument>;

  beforeEach(async () => {
    const pushNotificationMock = {
      notifyUsernames: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      providers: [
        SurveysService,
        SseService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveyAnswerService,
        SurveysAttachmentService,
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
        { provide: PushNotificationService, useValue: pushNotificationMock },
      ],
    }).compile();

    service = module.get<SurveyAnswerService>(SurveyAnswerService);
    model = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getSelectableChoices', () => {
    it('Should return those choices that are still selectable (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countChoiceSelections = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02);

      const result = await service.getSelectableChoices(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(result).toEqual(filteredChoices);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(service.countChoiceSelections).toHaveBeenCalledTimes(4);
    });

    it('Should return those choices that are still selectable even after adding a new answer (backend limit was not reached)', async () => {
      jest.spyOn(service, 'getSelectableChoices');

      service.countChoiceSelections = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey02AfterAddingValidAnswer);

      const result = await service.getSelectableChoices(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(result).toEqual(filteredChoicesAfterAddingValidAnswer);

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(service.countChoiceSelections).toHaveBeenCalledTimes(4);
    });

    it('Throw error when the backendLimit is not set', async () => {
      jest.spyOn(service, 'getSelectableChoices');
      jest.spyOn(service, 'countChoiceSelections');

      surveyModel.findById = jest.fn().mockReturnValue(publicSurvey01);

      try {
        await service.getSelectableChoices(idOfPublicSurvey01.toString(), publicSurvey02QuestionNameWithLimiters);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NoBackendLimiters);
      }

      expect(service.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey01.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
    });
  });

  describe('getCreatedSurveys', () => {
    it('should return a list with surveys the user created', async () => {
      jest.spyOn(service, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01, answeredSurvey02]);

      const result = await service.getCreatedSurveys(firstUsername);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01, answeredSurvey02]);

      expect(service.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
      expect(surveyModel.find).toHaveBeenCalledWith({ 'creator.username': firstUsername });
    });
  });

  describe('getOpenSurveys', () => {
    it('should return a list with surveys that the user should/could participate', async () => {
      jest.spyOn(service, 'getOpenSurveys');
      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const currentDate = new Date();
      const result = await service.getOpenSurveys(firstMockJWTUser, currentDate);
      expect(result).toEqual([openSurvey01, openSurvey02]);
      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser, currentDate);

      expect(surveyModel.find).toHaveBeenCalledWith({
        $or: [
          {
            $and: [
              { isPublic: true },
              {
                $or: [
                  { $nor: [{ participatedAttendees: { $elemMatch: { username: firstUsername } } }] },
                  { canSubmitMultipleAnswers: true },
                ],
              },
              {
                $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
              },
            ],
          },
          {
            $and: [
              {
                $or: [
                  { 'invitedAttendees.username': firstUsername },
                  { 'invitedGroups.path': { $in: firstMockJWTUser.ldapGroups } },
                ],
              },
              {
                $or: [
                  { $nor: [{ participatedAttendees: { $elemMatch: { username: firstUsername } } }] },
                  { canSubmitMultipleAnswers: true },
                ],
              },
              {
                $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
              },
            ],
          },
        ],
      });
    });
  });

  describe('getAnsweredSurveys', () => {
    it('should return a list with surveys that the user has already participated in', async () => {
      jest.spyOn(service, 'getAnsweredSurveys');

      model.find = jest
        .fn()
        .mockReturnValue([
          firstUsersSurveyAnswerAnsweredSurvey01,
          surveyAnswerAnsweredSurvey02,
          surveyAnswerAnsweredSurvey05,
          surveyAnswerAnsweredSurvey04,
        ]);
      surveyModel.find = jest
        .fn()
        .mockReturnValue([answeredSurvey01, answeredSurvey02, answeredSurvey05, answeredSurvey04]);

      const result = await service.getAnsweredSurveys(firstUsername);
      expect(result).toEqual([answeredSurvey01, answeredSurvey02, answeredSurvey05, answeredSurvey04]);

      expect(service.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
      expect(model.find).toHaveBeenCalledWith({ 'attendee.username': firstUsername });
      expect(surveyModel.find).toHaveBeenCalledWith({
        _id: {
          $in: [idOfAnsweredSurvey01, idOfAnsweredSurvey02, idOfAnsweredSurvey05, idOfAnsweredSurvey04],
        },
      });
    });
  });

  describe('findUserSurveys', () => {
    it('return surveys with status OPEN', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getOpenSurveys');

      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, openSurvey02]);

      const result = await service.findUserSurveys(SurveyStatus.OPEN, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, openSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.OPEN, firstMockJWTUser);
      expect(service.getOpenSurveys).toHaveBeenCalledWith(firstMockJWTUser);
    });

    it('return surveys with status CREATED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getCreatedSurveys');

      surveyModel.find = jest.fn().mockReturnValue([surveyUpdateInitialSurvey, createdSurvey01]);

      const result = await service.findUserSurveys(SurveyStatus.CREATED, firstMockJWTUser);
      expect(result).toEqual([surveyUpdateInitialSurvey, createdSurvey01]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.CREATED, firstMockJWTUser);
      expect(service.getCreatedSurveys).toHaveBeenCalledWith(firstUsername);
    });

    it('return surveys with status ANSWERED', async () => {
      jest.spyOn(service, 'findUserSurveys');
      jest.spyOn(service, 'getAnsweredSurveys');

      model.find = jest.fn().mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, surveyAnswerAnsweredSurvey02]);
      surveyModel.find = jest.fn().mockReturnValue([openSurvey01, answeredSurvey01, answeredSurvey02]);

      const result = await service.findUserSurveys(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(result).toEqual([openSurvey01, answeredSurvey01, answeredSurvey02]);

      expect(service.findUserSurveys).toHaveBeenCalledWith(SurveyStatus.ANSWERED, firstMockJWTUser);
      expect(service.getAnsweredSurveys).toHaveBeenCalledWith(firstUsername);
    });
  });

  describe('addAnswer', () => {
    beforeEach(() => {
      jest
        .spyOn(mockGroupsService, 'getInvitedMembers')
        .mockResolvedValue([firstMockUser.username, secondMockUser.username]);
    });

    it('should return an error if the survey was not found', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(null);
      const id = new Types.ObjectId().toString();

      try {
        await service.addAnswer(id, 1, {} as JSON, firstParticipant);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.NotFoundError);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(id, 1, {} as JSON, firstParticipant);
    });

    it('should return an error if the survey has already expired', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey01);
      model.findOne = jest.fn().mockReturnValue(null);
      model.create = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      model.findByIdAndUpdate = jest.fn().mockReturnValue(firstUsersSurveyAnswerAnsweredSurvey01);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(answeredSurvey01);

      try {
        await service.addAnswer(
          idOfAnsweredSurvey01.toString(),
          saveNoAnsweredSurvey01,
          firstUsersMockedAnswerForAnsweredSurveys01,
          firstParticipant,
        );
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorSurveyExpired);
      }

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey01.toString(),
        saveNoAnsweredSurvey01,
        firstUsersMockedAnswerForAnsweredSurveys01,
        firstParticipant,
      );
    });

    it('should return an error if the user is no participant (or creator)', async () => {
      // jest.spyOn(service, 'addAnswer');
      //
      // surveyModel.findOne = jest.fn().mockReturnValue(answeredSurvey02);
      // surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey02);
      // surveyModel.create = jest.fn().mockReturnValue(answeredSurvey02);
      // model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey02);
      //
      // try {
      //   await service.addAnswer(
      //     idOfAnsweredSurvey02.toString(),
      //     saveNoAnsweredSurvey02,
      //     mockedAnswerForAnsweredSurveys02,
      //     firstParticipant,
      //   );
      // } catch (e) {
      //   expect(e).toBeInstanceOf(Error);
      //   expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorUserNotAssigned);
      // }
      //
      // expect(service.addAnswer).toHaveBeenCalledWith(
      //   idOfAnsweredSurvey02.toString(),
      //   saveNoAnsweredSurvey02,
      //   mockedAnswerForAnsweredSurveys02,
      //   firstParticipant,
      // );
    });

    it(
      'should return an error if the has already participated and can not' +
        ' update the answer or submit multiple answers',
      async () => {
        jest.spyOn(service, 'addAnswer');

        surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey02);

        try {
          await service.addAnswer(
            idOfAnsweredSurvey02.toString(),
            saveNoAnsweredSurvey02,
            mockedAnswerForAnsweredSurveys02,
            secondParticipant,
          );
        } catch (e) {
          expect(e).toBeInstanceOf(Error);
          expect(e.message).toBe(SurveyErrorMessages.ParticipationErrorAlreadyParticipated);
        }

        expect(service.addAnswer).toHaveBeenCalledWith(
          idOfAnsweredSurvey02.toString(),
          saveNoAnsweredSurvey02,
          mockedAnswerForAnsweredSurveys02,
          secondParticipant,
        );
      },
    );

    it('should update the former answer of the user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey03);
      model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey03);
      model.findByIdAndUpdate = jest.fn().mockReturnValue(updatedSurveyAnswerAnsweredSurvey03);

      const result = await service.addAnswer(
        idOfAnsweredSurvey03.toString(),
        saveNoAnsweredSurvey03,
        updatedMockedAnswerForAnsweredSurveys03,
        firstParticipant,
      );
      expect(result).toEqual(updatedSurveyAnswerAnsweredSurvey03);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey03.toString(),
        saveNoAnsweredSurvey03,
        updatedMockedAnswerForAnsweredSurveys03,
        firstParticipant,
      );
    });

    it('should create an answer object if there is none for the survey submitted by the given user', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey04);
      model.findOne = jest.fn().mockReturnValue(null);
      model.create = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey04);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey04,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey04],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey04.toString(),
        saveNoAnsweredSurvey04,
        mockedAnswerForAnsweredSurveys04,
        firstParticipant,
      );
      expect(result).toEqual(surveyAnswerAnsweredSurvey04);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey04.toString(),
        saveNoAnsweredSurvey04,
        mockedAnswerForAnsweredSurveys04,
        firstParticipant,
      );
    });

    it('should also create an answer object if the users can submit multiple answers', async () => {
      jest.spyOn(service, 'addAnswer');

      surveyModel.findById = jest.fn().mockReturnValue(answeredSurvey05);
      model.findOne = jest.fn().mockReturnValue(surveyAnswerAnsweredSurvey05);
      model.create = jest.fn().mockReturnValue(newSurveyAnswerAnsweredSurvey05);
      surveyModel.findByIdAndUpdate = jest.fn().mockResolvedValue({
        ...answeredSurvey05,
        participatedAttendees: [firstMockUser],
        answers: [idOfTheSurveyAnswerForTheAnsweredSurvey05],
      });

      const result = await service.addAnswer(
        idOfAnsweredSurvey05.toString(),
        saveNoAnsweredSurvey05,
        newMockedAnswerForAnsweredSurveys05,
        firstParticipant,
      );
      expect(result).toEqual(newSurveyAnswerAnsweredSurvey05);

      expect(service.addAnswer).toHaveBeenCalledWith(
        idOfAnsweredSurvey05.toString(),
        saveNoAnsweredSurvey05,
        newMockedAnswerForAnsweredSurveys05,
        firstParticipant,
      );
    });
  });

  describe('getPrivateAnswer', () => {
    // it('should return the submitted answer of a given user', async () => {
    //   jest.spyOn(service, 'getPrivateAnswer');
    //
    //   model.findOne = jest.fn().mockReturnValue(secondUsersSurveyAnswerAnsweredSurvey01);
    //
    //   const result = await service.getPrivateAnswer(idOfAnsweredSurvey01.toString(), secondUsername);
    //   expect(result).toEqual(secondUsersSurveyAnswerAnsweredSurvey01);
    //
    //   expect(service.getPrivateAnswer).toHaveBeenCalledWith(idOfAnsweredSurvey01, secondUsername);
    // });
  });

  describe('getPublicAnswers', () => {
    // it('should return the public answers the users submitted', async () => {
    //   jest.spyOn(service, 'getPublicAnswers');
    //
    //   model.find = jest
    //     .fn()
    //     .mockReturnValue([firstUsersSurveyAnswerAnsweredSurvey01, secondUsersSurveyAnswerAnsweredSurvey01]);
    //
    //   const result = await service.getPublicAnswers(idOfAnsweredSurvey01.toString());
    //   expect(result).toEqual([
    //     firstUsersSurveyAnswerAnsweredSurvey01.answer,
    //     secondUsersSurveyAnswerAnsweredSurvey01.answer,
    //   ]);
    //
    //   expect(service.getPublicAnswers).toHaveBeenCalledWith(idOfAnsweredSurvey01.toString());
    // });
  });

  describe('onSurveyRemoval', () => {
    // it('should also remove the survey answers that are stored', async () => {
    //   jest.spyOn(service, 'onSurveyRemoval');
    //
    //   model.deleteMany = jest.fn().mockResolvedValueOnce(true);
    //
    //   await service.onSurveyRemoval([idOfAnsweredSurvey01.toString()]);
    //
    //   expect(service.onSurveyRemoval).toHaveBeenCalledWith([idOfAnsweredSurvey01]);
    //   expect(model.deleteMany).toHaveBeenCalledWith({ surveyId: { $in: [idOfAnsweredSurvey01] } }, { ordered: false });
    // });
  });
});
