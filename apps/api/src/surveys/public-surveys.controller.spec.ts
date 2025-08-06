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
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveysAttachmentService from 'apps/api/src/surveys/surveys-attachment.service';
import SurveysService from './surveys.service';
import SurveyAnswersService from './survey-answers.service';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answers.schema';
import PublicSurveysController from './public-surveys.controller';
import {
  filteredChoices,
  filteredChoicesAfterAddingValidAnswer,
  firstMockUser,
  idOfPublicSurvey01,
  idOfPublicSurvey02,
  mockedValidAnswerForPublicSurveys02,
  publicSurvey01,
  publicSurvey02,
  publicSurvey02AfterAddingValidAnswer,
  publicSurvey02QuestionNameWithLimiters,
  saveNoPublicSurvey02,
  surveyValidAnswerPublicSurvey02,
} from './mocks';
import GroupsService from '../groups/groups.service';
import mockGroupsService from '../groups/groups.service.mock';
import SseService from '../sse/sse.service';
import FilesystemService from '../filesystem/filesystem.service';
import mockFilesystemService from '../filesystem/filesystem.service.mock';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';

describe(PublicSurveysController.name, () => {
  let controller: PublicSurveysController;
  let surveysService: SurveysService;
  let surveyAnswerService: SurveyAnswersService;
  let surveyModel: Model<SurveyDocument>;
  let surveyAnswerModel: Model<SurveyAnswerDocument>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [],
      controllers: [PublicSurveysController],
      providers: [
        SurveysService,
        SseService,
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveyAnswersService,
        SurveysAttachmentService,
        SurveyAnswerAttachmentsService,
        { provide: GroupsService, useValue: mockGroupsService },
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
        { provide: FilesystemService, useValue: mockFilesystemService },
      ],
    }).compile();

    controller = module.get<PublicSurveysController>(PublicSurveysController);
    surveysService = module.get<SurveysService>(SurveysService);
    surveyAnswerService = module.get<SurveyAnswersService>(SurveyAnswersService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('find', () => {
    it('return a public survey with the given surveyId if it exists ', async () => {
      surveyModel.findOne = jest.fn().mockResolvedValueOnce({
        exec: jest.fn().mockReturnValue(publicSurvey01),
      });
      surveysService.findPublicSurvey = jest.fn().mockReturnValue(publicSurvey01);

      const result = await controller.find({ surveyId: idOfPublicSurvey01.toString() });
      expect(result).toEqual(publicSurvey01);

      expect(surveysService.findPublicSurvey).toHaveBeenCalledWith(idOfPublicSurvey01.toString());
    });

    it('throw an error when the survey with the given id does not exist', async () => {
      surveysService.findPublicSurvey = jest.fn().mockRejectedValue(new Error(CommonErrorMessages.DB_ACCESS_FAILED));
      const id = new Types.ObjectId().toString();

      try {
        await controller.find({ surveyId: id });
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(CommonErrorMessages.DB_ACCESS_FAILED);
      }

      expect(surveysService.findPublicSurvey).toHaveBeenCalledWith(id);
    });
  });

  describe('answerSurvey', () => {
    it('should call the addAnswerToPublicSurvey() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswerService, 'addAnswer');

      surveyAnswerModel.findOne = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(null),
      });
      surveyModel.findById = jest.fn().mockReturnValue({
        exec: jest.fn().mockResolvedValue(publicSurvey02),
      });

      surveyAnswerModel.create = jest.fn().mockResolvedValueOnce(surveyValidAnswerPublicSurvey02);

      surveyAnswerModel.findByIdAndUpdate = jest.fn().mockReturnValue({
        lean: jest.fn().mockResolvedValue(surveyValidAnswerPublicSurvey02),
      });

      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(publicSurvey02AfterAddingValidAnswer);

      await controller.answerSurvey({
        surveyId: idOfPublicSurvey02.toString(),
        answer: mockedValidAnswerForPublicSurveys02,
        attendee: firstMockUser,
      });

      expect(surveyAnswerService.addAnswer).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        mockedValidAnswerForPublicSurveys02,
        firstMockUser,
      );
    });

    // TODO: NIEDUUI-404: MAKE SURE THAT THE ANSWER IS NOT ADDED TO THE SURVEY IF IT IS INVALID
    // it('should call the addAnswerToPublicSurvey() function of the surveyAnswerService', async () => {
    //   jest.spyOn(surveyAnswerService, 'addAnswerToPublicSurvey');
    //
    //   surveyAnswerModel.create = jest.fn().mockResolvedValueOnce(surveyInvalidAnswerPublicSurvey02);
    //   surveyModel.findByIdAndUpdate = jest.fn().mockRejectedValue(new Error(SurveyAnswerError.InvalidAnswer));
    //
    //   await controller.answerSurvey(
    //     {
    //       surveyId: idOfPublicSurvey02,
    //       saveNo: saveNoPublicSurvey02,
    //       answer: mockedInvalidAnswerForPublicSurveys02,
    //     },
    //   );
    //
    //   expect(surveyAnswerService.addAnswer).toHaveBeenCalledWith(
    //     idOfPublicSurvey02,
    //     saveNoPublicSurvey02,
    //     mockedInvalidAnswerForPublicSurveys02,
    //   );
    // });
  });

  describe('getChoices', () => {
    it('should call the getSelectableChoices() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswerService, 'getSelectableChoices');

      surveyAnswerService.countChoiceSelections = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockResolvedValueOnce(publicSurvey02);

      const result = await controller.getChoices({
        surveyId: idOfPublicSurvey02.toString(),
        questionName: publicSurvey02QuestionNameWithLimiters,
      });
      expect(result).toEqual(filteredChoices);

      expect(surveyAnswerService.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(surveyAnswerService.countChoiceSelections).toHaveBeenCalledTimes(4);
    });

    it('Update Choices that getSelectableChoices() returns after adding a new answer', async () => {
      jest.spyOn(surveyAnswerService, 'getSelectableChoices');

      surveyAnswerService.countChoiceSelections = jest
        .fn()
        .mockReturnValueOnce(0)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(1)
        .mockReturnValueOnce(2);

      surveyModel.findById = jest.fn().mockResolvedValueOnce(publicSurvey02AfterAddingValidAnswer);

      const result = await controller.getChoices({
        surveyId: idOfPublicSurvey02.toString(),
        questionName: publicSurvey02QuestionNameWithLimiters,
      });
      expect(result).toEqual(filteredChoicesAfterAddingValidAnswer);

      expect(surveyAnswerService.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02.toString(),
        publicSurvey02QuestionNameWithLimiters,
      );
      expect(surveyAnswerService.countChoiceSelections).toHaveBeenCalledTimes(4);
    });
  });
});
