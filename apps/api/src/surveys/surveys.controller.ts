/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
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
import APPS from '@libs/appconfig/constants/apps';
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
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEYS_ANSWER_FOLDER from '@libs/survey/constants/surveyAnswersFolder';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { SurveyTemplateDto } from '@libs/survey/types/api/surveyTemplate.dto';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import getUsernameFromRequest from 'apps/api/src/common/utils/getUsernameFromRequest';
import SurveysService from './surveys.service';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveysTemplateService from './surveys-template.service';
import SurveyAnswerService from './survey-answers.service';
import FilesystemService from '../filesystem/filesystem.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import GetCurrentUserGroups from '../common/decorators/getCurrentUserGroups.decorator';
import { checkAttachmentFile, createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import AdminGuard from '../common/guards/admin.guard';
import CustomHttpException from '../common/CustomHttpException';

@ApiTags(SURVEYS)
@ApiBearerAuth()
@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveysTemplateService: SurveysTemplateService,
    private readonly surveyAnswerService: SurveyAnswerService,
    private readonly filesystemService: FilesystemService,
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
      createAttachmentUploadOptions((req) => {
        const username = getUsernameFromRequest(req);
        return join(SURVEYS_TEMP_FILES_PATH, username);
      }),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  fileUpload(@UploadedFile() file: Express.Multer.File, @Res() res: Response) {
    const fileName = checkAttachmentFile(file);
    const fileUrl = join(SURVEYS, FILES, fileName);
    return res.status(HttpStatus.CREATED).json(fileUrl);
  }

  @UseGuards(AdminGuard)
  @Post(TEMPLATES)
  async createTemplate(@Body() surveyTemplateDto: SurveyTemplateDto) {
    return this.surveysTemplateService.updateOrCreateTemplateDocument(surveyTemplateDto);
  }

  @Get(TEMPLATES)
  getTemplate(@Res() res: Response, @GetCurrentUserGroups() ldapGroups: string[]) {
    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_JSON);
    return this.surveysTemplateService.getTemplates(ldapGroups, res);
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

  @Get(`${ANSWER}/${FILES}/:userName/:surveyId/:filename`)
  async servePermanentFileFromAnswer(
    @Param() params: { userName: string; surveyId: string; filename: string },
    @Res() res: Response,
    @GetCurrentUser() user: JWTUser,
  ) {
    const { userName, surveyId, filename } = params;
    if (!userName || !surveyId || !filename) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    }
    const survey = await this.surveyService.findSurveyWithCreatorDependency(surveyId, user);
    if (survey === null) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysController.name,
      );
    }
    const filePath = join(SURVEYS_ANSWER_FOLDER, ATTACHMENT_FOLDER, surveyId, userName);
    return this.filesystemService.serveFiles(filePath, filename, res);
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
    await SurveysAttachmentService.onSurveyRemoval(surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() postAnswerDto: PostSurveyAnswerDto, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyId, answer } = postAnswerDto;
    const attendee = {
      username: currentUser.preferred_username,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
    };
    return this.surveyAnswerService.addAnswer(surveyId, answer, attendee);
  }

  @Get(`${FILES}/:filename`)
  serveTempFile(@Param() params: { filename: string }, @Res() res: Response, @GetCurrentUsername() username: string) {
    const { filename } = params;
    const filePath = join(APPS.SURVEYS, username);
    return this.filesystemService.serveTempFiles(filePath, filename, res);
  }

  @Delete(`${TEMPLATES}/:name`)
  async deleteTemplate(@Param() params: { name: string }) {
    const { name } = params;
    return this.surveysTemplateService.deleteTemplate(name);
  }

  @Patch(`${TEMPLATES}/:name`)
  async toggleIsTemplateActive(@Param() params: { name: string }) {
    const { name } = params;
    return this.surveysTemplateService.toggleIsTemplateActive(name);
  }
}

export default SurveysController;
