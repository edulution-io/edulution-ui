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

import { Observable } from 'rxjs';
import { Response } from 'express';
import { Body, Controller, Delete, Get, MessageEvent, Param, Patch, Post, Query, Res, Sse } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import {
  ANSWER,
  CAN_PARTICIPATE,
  FIND_ONE,
  HAS_ANSWERS,
  RESULT,
  SURVEYS,
} from '@libs/survey/constants/surveys-endpoint';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AnswerDto from '@libs/survey/types/api/answer.dto';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUser from '../common/decorators/getUser.decorator';
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

  @Get(`${FIND_ONE}/:surveyId`)
  async findOne(@Param() params: { surveyId: string }, @GetCurrentUser() user: JWTUser) {
    const { surveyId } = params;
    return this.surveyService.findSurvey(surveyId, user);
  }

  @Get(`${CAN_PARTICIPATE}/:surveyId`)
  async canParticipate(@Param() params: { surveyId: string }, @GetCurrentUsername() username: string) {
    const { surveyId } = params;
    return this.surveyAnswerService.canUserParticipateSurvey(surveyId, username);
  }

  @Get(`${HAS_ANSWERS}/:surveyId`)
  async hasAnswers(@Param() params: { surveyId: string }) {
    const { surveyId } = params;
    return this.surveyAnswerService.hasAlreadySubmittedSurveyAnswers(surveyId);
  }

  @Get(`${RESULT}/:surveyId`)
  async getSurveyResult(@Param() params: { surveyId: string }) {
    const { surveyId } = params;
    return this.surveyAnswerService.getPublicAnswers(surveyId);
  }

  @Get()
  async findByStatus(@Query('status') status: SurveyStatus, @GetCurrentUser() user: JWTUser) {
    return this.surveyAnswerService.findUserSurveys(status, user);
  }

  @Post(ANSWER)
  async getSubmittedSurveyAnswers(@Body() getAnswerDto: AnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, attendee } = getAnswerDto;
    return this.surveyAnswerService.getPrivateAnswer(surveyId, attendee || username);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto, @GetCurrentUser() user: JWTUser) {
    return this.surveyService.updateOrCreateSurvey(surveyDto, user, this.surveysSseConnections);
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    await this.surveyService.deleteSurveys(surveyIds, this.surveysSseConnections);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, currentUser);
  }

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.surveysSseConnections, res);
  }
}

export default SurveysController;
