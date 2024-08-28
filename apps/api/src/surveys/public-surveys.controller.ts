import mongoose from 'mongoose';
import { Body, Controller, Query, Get, Patch } from '@nestjs/common';
import { PUBLIC_SURVEYS_ENDPOINT } from '@libs/survey/constants/api/surveys-endpoint';
import PushAnswerToPublicSurveyDto from '@libs/survey/types/api/push-answer-to-public-survey.dto';

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

  @Patch()
  @Public()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerToPublicSurveyDto) {
    const { surveyId, saveNo, answer, username } = pushAnswerDto;
    return this.surveyAnswerService.addAnswerToPublicSurvey(surveyId, saveNo, answer, username);
  }
}

export default PublicSurveysController;
