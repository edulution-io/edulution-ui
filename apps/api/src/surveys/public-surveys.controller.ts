import { Body, Controller, Get, Post, Param } from '@nestjs/common';
import { PUBLIC_SURVEYS_ENDPOINT, RESTFUL_CHOICES_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import { ApiTags } from '@nestjs/swagger';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(PUBLIC_SURVEYS_ENDPOINT)
@Controller(PUBLIC_SURVEYS_ENDPOINT)
class PublicSurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get(`/:surveyId`)
  @Public()
  async find(@Param() params: { surveyId: string }) {
    const { surveyId } = params;
    return this.surveyService.findPublicSurvey(surveyId);
  }

  @Post()
  @Public()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, true);
  }

  @Get(`${RESTFUL_CHOICES_ENDPOINT}/:surveyId/:questionId`)
  @Public()
  async getChoices(@Param() params: { surveyId: string; questionId: string }) {
    const { surveyId, questionId } = params;
    return this.surveyAnswerService.getSelectableChoices(surveyId, questionId);
  }
}

export default PublicSurveysController;
