import mongoose from 'mongoose';
import { Body, Controller, Delete, Query, Get, Patch, Post, Param } from '@nestjs/common';
import { ANSWER_ENDPOINT, FIND_ONE_ENDPOINT, RESULT_ENDPOINT, SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AnswerDto from '@libs/survey/types/api/answer.dto';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import JWTUser from '../types/JWTUser';

@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get(FIND_ONE_ENDPOINT)
  async findOne(@Query('surveyId') surveyId: mongoose.Types.ObjectId, @GetCurrentUsername() username: string) {
    return this.surveyService.findSurvey(surveyId, username);
  }

  @Get()
  async find(@Query('status') status: SurveyStatus, @GetCurrentUsername() username: string) {
    return this.surveyAnswerService.findUserSurveys(status, username);
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Post(ANSWER_ENDPOINT)
  async getCommittedSurveyAnswers(@Body() getAnswerDto: AnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, attendee } = getAnswerDto;
    return this.surveyAnswerService.getPrivateAnswer(surveyId, attendee || username);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto) {
    const { id, created = new Date() } = surveyDto;

    const survey: Survey = {
      ...surveyDto,
      _id: id,
      created,
    };

    return this.surveyService.updateOrCreateSurvey(survey);
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    await this.surveyService.deleteSurveys(surveyIds);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUser() user: JWTUser) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, user, answer);
  }
}

export default SurveysController;
