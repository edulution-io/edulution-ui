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

import { join } from 'path';
import { Response } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import {
  ANSWER,
  CAN_PARTICIPATE,
  FILES,
  FIND_ONE,
  HAS_ANSWERS,
  RESULT,
  SURVEYS,
  TEMPLATES,
} from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import { checkAttachmentFile, createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import AppConfigGuard from '../appconfig/appconfig.guard';

@ApiTags(SURVEYS)
@ApiBearerAuth()
@Controller(SURVEYS)
class SurveysController {
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

  @Post(FILES)
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions((req) => `${SURVEYS_TEMP_FILES_PATH}/${req.user?.preferred_username}`),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  fileUpload(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const fileName = checkAttachmentFile(file);
    const fileUrl = join(SURVEYS, FILES, fileName);
    return res.status(HttpStatus.CREATED).json(fileUrl);
  }

  @UseGuards(AppConfigGuard)
  @Post(TEMPLATES)
  async createTemplate(@Body() surveyTemplateDto: SurveyTemplateDto) {
    return this.surveyService.createTemplate(surveyTemplateDto);
  }

  @Get(TEMPLATES)
  getTemplateNames() {
    return this.surveyService.serveTemplateNames();
  }

  @Get(`${TEMPLATES}/:filename`)
  getTemplate(@Param() params: { filename: string }, @Res() res: Response) {
    const { filename } = params;
    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_JSON);
    return this.surveyService.serveTemplate(filename, res);
  }

  @Get(`${ANSWER}/:surveyId`)
  async getSubmittedSurveyAnswerCurrentUser(
    @Param() params: { surveyId: string },
    @GetCurrentUsername() currentUsername: string,
  ) {
    const { surveyId } = params;
    return this.surveyAnswerService.getAnswer(surveyId, currentUsername);
  }

  @Get(`${ANSWER}/:surveyId/:username`)
  async getSubmittedSurveyAnswers(
    @Param() params: { surveyId: string; username: string },
    @GetCurrentUsername() currentUsername: string,
  ) {
    const { surveyId, username } = params;
    return this.surveyAnswerService.getAnswer(surveyId, username || currentUsername);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto, @GetCurrentUser() user: JWTUser) {
    return this.surveyService.updateOrCreateSurvey(surveyDto, user);
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    await this.surveyService.deleteSurveys(surveyIds);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);
    await this.surveyService.onSurveyRemoval(surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() postAnswerDto: PostSurveyAnswerDto, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyId, saveNo, answer } = postAnswerDto;
    const attendee = {
      username: currentUser.preferred_username,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
    };
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, attendee);
  }

  @Get(`${FILES}/:filename`)
  serveTempFile(@Param() params: { filename: string }, @Res() res: Response, @GetCurrentUsername() username: string) {
    const { filename } = params;
    return this.surveyService.serveTempFiles(username, filename, res);
  }
}

export default SurveysController;
