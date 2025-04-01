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
import { Body, Controller, Get, Post, Param, Res, Logger } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { IMAGES, PUBLIC_SURVEYS, RESTFUL_CHOICES } from '@libs/survey/constants/surveys-endpoint';
import NAME_OF_TEMPORARY_FOLDER from '@libs/common/constants/nameOfTemporaryFolder';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import { Public } from '../common/decorators/public.decorator';

@ApiTags(PUBLIC_SURVEYS)
@Controller(PUBLIC_SURVEYS)
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
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer);
  }

  @Get(`${IMAGES}/${NAME_OF_TEMPORARY_FOLDER}/:userId/:filename`)
  @Public()
  getTemporaryImage(@Param() params: { userId: string; filename: string }, @Res() res: Response) {
    const { userId, filename } = params;

    Logger.log(`Serving temporary image ${filename} for user ${userId}`, 'AttachmentService');

    return this.surveyService.serveTemporaryImage(userId, filename, res);
  }

  @Get(`${IMAGES}/:surveyId/:questionId/:filename`)
  @Public()
  getPermanentImage(@Param() params: { surveyId: string; questionId: string; filename: string }, @Res() res: Response) {
    const { surveyId, questionId, filename } = params;

    Logger.log(`Serving permanent image ${filename} for question ${questionId} survey ${surveyId}`, 'AttachmentService');

    return this.surveyService.servePermanentImage(surveyId, questionId, filename, res);
  }

  @Get(`${RESTFUL_CHOICES}/:surveyId/:questionId`)
  @Public()
  async getChoices(@Param() params: { surveyId: string; questionId: string }) {
    const { surveyId, questionId } = params;
    return this.surveyAnswerService.getSelectableChoices(surveyId, questionId);
  }
}

export default PublicSurveysController;
