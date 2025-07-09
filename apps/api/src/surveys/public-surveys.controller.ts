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

import { Response } from 'express';
import { ApiTags } from '@nestjs/swagger';
import { Body, Controller, Get, Post, Param, Res } from '@nestjs/common';
import { PUBLIC_USER, FILES, PUBLIC_SURVEYS, CHOICES } from '@libs/survey/constants/surveys-endpoint';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import SurveysAttachmentService from './surveys-attachment.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(PUBLIC_SURVEYS)
@Controller(PUBLIC_SURVEYS)
class PublicSurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
    private readonly surveysAttachmentService: SurveysAttachmentService,
  ) {}

  @Get(`/:surveyId`)
  @Public()
  async find(@Param() params: { surveyId: string }) {
    const { surveyId } = params;
    return this.surveyService.findPublicSurvey(surveyId);
  }

  @Post()
  @Public()
  async answerSurvey(@Body() postAnswerDto: PostSurveyAnswerDto) {
    const { surveyId, saveNo, answer, attendee } = postAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, attendee);
  }

  @Get(`${PUBLIC_USER}/:surveyId/:publicUserName`)
  @Public()
  async hasPublicUserAnswered(@Param() params: { surveyId: string; publicUserName: string }) {
    const { surveyId, publicUserName } = params;
    const response = await this.surveyAnswerService.hasPublicUserAnsweredSurvey(surveyId, publicUserName);
    return response;
  }

  @Get(`${FILES}/:surveyId/:questionId/:filename`)
  @Public()
  serveFile(@Param() params: { surveyId: string; questionId: string; filename: string }, @Res() res: Response) {
    const { surveyId, questionId, filename } = params;
    return this.surveysAttachmentService.serveFiles(surveyId, questionId, filename, res);
  }

  @Get(`${CHOICES}/:surveyId/:questionName`)
  @Public()
  async getChoices(@Param() params: { surveyId: string; questionName: string }) {
    const { surveyId, questionName } = params;
    if (surveyId === TEMPORAL_SURVEY_ID_STRING) {
      return [];
    }
    return this.surveyAnswerService.getSelectableChoices(surveyId, questionName);
  }
}

export default PublicSurveysController;
