import mongoose from 'mongoose';
import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Sse, MessageEvent, Res } from '@nestjs/common';
import { Observable } from 'rxjs';
import { Response } from 'express';
import SurveyStatus from '@libs/survey/survey-status-enum';
import { ANSWER_ENDPOINT, RESULT_ENDPOINT, SURVEYS } from '@libs/survey/constants/surveys-endpoint';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AnswerDto from '@libs/survey/types/api/answer.dto';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import { Survey } from './survey.schema';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUser, { GetCurrentUsername } from '../common/decorators/getUser.decorator';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';

@ApiTags(SURVEYS)
@ApiBearerAuth()
@Controller(SURVEYS)
class SurveysController {
  private surveysSseConnections: UserConnections = new Map();

  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
  ) {}

  @Get()
  async find(@Query('status') status: SurveyStatus, @GetCurrentUsername() username: string) {
    return this.surveyAnswerService.findUserSurveys(status, username);
  }

  @Get(`${RESULT_ENDPOINT}:surveyId`)
  async getSurveyResult(@Param('surveyId') surveyId: mongoose.Types.ObjectId) {
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Post(ANSWER_ENDPOINT)
  async getSubmittedSurveyAnswers(@Body() getAnswerDto: AnswerDto, @GetCurrentUsername() username: string) {
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

    return this.surveyService.updateOrCreateSurvey(survey, this.surveysSseConnections);
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    await this.surveyService.deleteSurveys(surveyIds, this.surveysSseConnections);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUser() user: JWTUser) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, user, answer);
  }

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.surveysSseConnections, res);
  }
}

export default SurveysController;
