/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/unbound-method */
import { Model } from 'mongoose';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import SurveysService from './surveys.service';
import SurveyAnswersService from './survey-answer.service';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer /*, SurveyAnswerDocument*/ } from './survey-answer.schema';
import {
  openSurveyId01,
  // idOfAnsweredSurvey01,
  // idOfAnsweredSurvey03,
  // saveNoAnsweredSurvey01,
  // firstUsersMockedAnswerForAnsweredSurveys01,
  openSurvey01,
  // answeredSurvey01,
  // answeredSurvey03,
} from './mocks';
import PublicSurveysController from './public-surveys.controller';

describe(PublicSurveysController.name, () => {
  let controller: PublicSurveysController;
  let surveysService: SurveysService;
  // let surveyAnswerService: SurveyAnswersService;
  let surveyModel: Model<SurveyDocument>;
  // let surveyAnswerModel: Model<SurveyAnswerDocument>;

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
    // surveyAnswerService = module.get<SurveyAnswersService>(SurveyAnswersService);
    surveyModel = module.get<Model<SurveyDocument>>(getModelToken(Survey.name));
    // surveyAnswerModel = module.get<Model<SurveyAnswerDocument>>(getModelToken(SurveyAnswer.name));
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
        lean: jest.fn().mockReturnValue(openSurvey01),
      });
      surveysService.findPublicSurvey = jest.fn().mockReturnValue(openSurvey01);

      const result = await controller.find(openSurveyId01);
      expect(result).toEqual(openSurvey01);

      expect(surveysService.findPublicSurvey).toHaveBeenCalledWith(openSurveyId01);
    });
  });

  // describe('answerSurvey', () => {
  //   it('should call the addAnswerToPublicSurvey() function of the surveyAnswerService', async () => {
  //     jest.spyOn(surveyAnswerService, 'addAnswerToPublicSurvey');
  //
  //     surveyModel.findById = jest.fn().mockResolvedValueOnce(answeredSurvey01);
  //     surveyAnswerModel.create = jest.fn().mockResolvedValueOnce(firstUsersMockedAnswerForAnsweredSurveys01);
  //     surveyModel.findByIdAndUpdate = jest.fn().mockReturnValue(answeredSurvey01);
  //
  //     await controller.answerSurvey(
  //       {
  //         surveyId: idOfAnsweredSurvey01,
  //         saveNo: saveNoAnsweredSurvey01,
  //         answer: firstUsersMockedAnswerForAnsweredSurveys01,
  //       },
  //     );
  //
  //     expect(surveyAnswerService.addAnswer).toHaveBeenCalledWith(
  //       idOfAnsweredSurvey01,
  //       saveNoAnsweredSurvey01,
  //       firstUsersMockedAnswerForAnsweredSurveys01,
  //     );
  //   });
  // });

  // describe('getChoices', () => {
  //   it('should call the addAnswer() function of the surveyAnswerService', async () => {
  //     jest.spyOn(surveyAnswerService, 'getSelectableChoices');
  //
  //     surveyModel.findById = jest.fn().mockResolvedValueOnce(answeredSurvey03);
  //
  //     await controller.getChoices({
  //       surveyId: idOfAnsweredSurvey03,
  //       questionId: 'Frage2',
  //     });
  //
  //     expect(surveyAnswerService.getSelectableChoices).toHaveBeenCalledWith(
  //       idOfAnsweredSurvey03,
  //       saveNoAnsweredSurvey01,
  //     );
  //   });
  // });
});
