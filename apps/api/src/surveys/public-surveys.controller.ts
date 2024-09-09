import mongoose from 'mongoose';
import { Body, Controller, Query, Get, Post } from '@nestjs/common';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/surveys-endpoint';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import { Public } from '../common/decorators/public.decorator';

@Controller(PUBLIC_SURVEYS_ENDPOINT)
class PublicSurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get()
  @Public()
  async find(@Query('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyService.findPublicSurvey(surveyId);
  }

  @Post()
  @Public()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswerToPublicSurvey(surveyId, saveNo, answer);
  }
}

export default PublicSurveysController;
