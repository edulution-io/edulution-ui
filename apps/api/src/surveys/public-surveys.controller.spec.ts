/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveysService from './surveys.service';
import SurveyAnswersService from './survey-answer.service';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import PublicSurveysController from './public-surveys.controller';
import {
  filteredChoices,
  filteredChoicesAfterAddingValidAnswer,
  idOfPublicSurvey01,
  idOfPublicSurvey02,
  mockedValidAnswerForPublicSurveys02,
  publicSurvey01,
  publicSurvey02,
  publicSurvey02AfterAddingValidAnswer,
  publicSurvey02QuestionIdWithLimiters,
  saveNoPublicSurvey02,
  surveyValidAnswerPublicSurvey02,
  unknownSurveyId,
} from './mocks';

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
        {
          provide: getModelToken(Survey.name),
          useValue: jest.fn(),
        },
        SurveyAnswersService,
        {
          provide: getModelToken(SurveyAnswer.name),
          useValue: jest.fn(),
        },
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
        lean: jest.fn().mockReturnValue(publicSurvey01),
      });
      surveysService.findPublicSurvey = jest.fn().mockReturnValue(publicSurvey01);

      const result = await controller.find(idOfPublicSurvey01);
      expect(result).toEqual(publicSurvey01);

      expect(surveysService.findPublicSurvey).toHaveBeenCalledWith(idOfPublicSurvey01);
    });

    it('throw an error when the survey with the given id does not exist', async () => {
      surveysService.findPublicSurvey = jest.fn().mockRejectedValue(new Error(CommonErrorMessages.DBAccessFailed));

      try {
        await controller.find(unknownSurveyId);
      } catch (e) {
        expect(e).toBeInstanceOf(Error);
        expect(e.message).toEqual(CommonErrorMessages.DBAccessFailed);
      }

      expect(surveysService.findPublicSurvey).toHaveBeenCalledWith(unknownSurveyId);
    });
  });

  describe('answerSurvey', () => {
    it('should call the addAnswerToPublicSurvey() function of the surveyAnswerService', async () => {
      jest.spyOn(surveyAnswerService, 'addAnswerToPublicSurvey');

      surveyModel.findById = jest.fn().mockResolvedValueOnce(publicSurvey02);

      surveyAnswerModel.create = jest.fn().mockResolvedValueOnce(surveyValidAnswerPublicSurvey02);
      surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(publicSurvey02AfterAddingValidAnswer);

      await controller.answerSurvey({
        surveyId: idOfPublicSurvey02,
        saveNo: saveNoPublicSurvey02,
        answer: mockedValidAnswerForPublicSurveys02,
      });

      expect(surveyAnswerService.addAnswerToPublicSurvey).toHaveBeenCalledWith(
        idOfPublicSurvey02,
        saveNoPublicSurvey02,
        mockedValidAnswerForPublicSurveys02,
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
        surveyId: idOfPublicSurvey02,
        questionId: publicSurvey02QuestionIdWithLimiters,
      });
      expect(result).toEqual(filteredChoices);

      expect(surveyAnswerService.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02,
        publicSurvey02QuestionIdWithLimiters,
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
        surveyId: idOfPublicSurvey02,
        questionId: publicSurvey02QuestionIdWithLimiters,
      });
      expect(result).toEqual(filteredChoicesAfterAddingValidAnswer);

      expect(surveyAnswerService.getSelectableChoices).toHaveBeenCalledWith(
        idOfPublicSurvey02,
        publicSurvey02QuestionIdWithLimiters,
      );
      expect(surveyAnswerService.countChoiceSelections).toHaveBeenCalledTimes(4);
    });
  });
});