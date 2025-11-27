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
  Get,
  Post,
  Delete,
  Param,
  Res,
  UploadedFile,
  UseInterceptors,
  HttpStatus,
  ParseFilePipeBuilder,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { randomUUID } from 'crypto';
import { SURVEYS, ANSWER, PUBLIC_USER, FILES, PUBLIC_SURVEYS, CHOICES } from '@libs/survey/constants/surveys-endpoint';
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import { addUuidToFileName } from '@libs/common/utils/uuidAndFileNames';
import SURVEY_ANSWERS_MAXIMUM_FILE_SIZE from '@libs/survey/constants/survey-answers-maximum-file-size';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import FilesystemService from 'apps/api/src/filesystem/filesystem.service';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answers.service';
import { Public } from '../common/decorators/public.decorator';
import { createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';

@ApiTags(PUBLIC_SURVEYS)
@Controller(PUBLIC_SURVEYS)
class PublicSurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveyAnswerService: SurveyAnswerService,
    private readonly filesystemService: FilesystemService,
    private readonly surveyAnswerAttachmentsService: SurveyAnswerAttachmentsService,
  ) {}

  private static validateParams(params: Record<string, string | undefined>, requiredFields: string[]): void {
    const missingFields = requiredFields.filter((field) => !params[field]);
    if (missingFields.length > 0) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        PublicSurveysController.name,
      );
    }
  }

  @Get(`/:surveyId`)
  @Public()
  async find(@Param() params: { surveyId: string }) {
    const { surveyId } = params;
    return this.surveyService.findPublicSurvey(surveyId);
  }

  @Post(ANSWER)
  @Public()
  async answerSurvey(@Body() postAnswerDto: PostSurveyAnswerDto) {
    const { surveyId, answer, attendee } = postAnswerDto;
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    const savedAnswer = await this.surveyAnswerService.addAnswer(surveyId, answer, attendee);
    return savedAnswer;
  }

  @Get(`${PUBLIC_USER}/:surveyId/:publicUserName`)
  @Public()
  async hasPublicUserAnswered(@Param() params: { surveyId: string; publicUserName: string }) {
    const { surveyId, publicUserName } = params;
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    const response = await this.surveyAnswerService.hasPublicUserAnsweredSurvey(surveyId, publicUserName);
    return response;
  }

  @Get(`${FILES}/:surveyId/:questionId/:filename`)
  @Public()
  async serveFile(@Param() params: { surveyId: string; questionId: string; filename: string }, @Res() res: Response) {
    const { surveyId, questionId, filename } = params;
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    const filePath = join(SURVEYS, ATTACHMENT_FOLDER, surveyId, questionId);
    return this.filesystemService.serveFiles(filePath, filename, res);
  }

  @Post(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId`)
  @Public()
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        (req) => {
          const { userName, surveyId, questionId } = req.params || {};
          PublicSurveysController.validateParams(req.params, ['userName', 'surveyId', 'questionId']);
          return join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
        },
        false,
        (_req, file) => addUuidToFileName(file.originalname, randomUUID()),
      ),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async answeringFileUpload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: SURVEY_ANSWERS_MAXIMUM_FILE_SIZE,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Param() params: { userName: string; surveyId: string; questionId: string },
    @Res() res: Response,
  ) {
    const { userName, surveyId, questionId } = params;
    const path = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
    const filePath = join(path, file.filename);
    const url = `${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${userName}/${surveyId}/${questionId}/${file.filename}`;

    const fileExists = await FilesystemService.checkIfFileExist(filePath);
    if (!fileExists) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_CREATION_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        PublicSurveysController.name,
      );
    }

    const survey = await this.surveyService.findPublicSurvey(surveyId);
    if (!survey) {
      await FilesystemService.deleteFile(path, file.filename);
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        PublicSurveysController.name,
      );
    } else {
      const content = (await FilesystemService.readFile(filePath)).toString('base64');
      return res.status(HttpStatus.CREATED).json({ name: file.filename, url, content });
    }
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId/:fileName`)
  @Public()
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async deleteTempAnswerFile(
    @Param() params: { userName: string; surveyId: string; questionId: string; fileName?: string },
  ) {
    const { userName, surveyId, questionId, fileName } = params;
    PublicSurveysController.validateParams({ ...params }, ['userName', 'surveyId', 'questionId']);
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    if (fileName) {
      await SurveyAnswerAttachmentsService.deleteTempQuestionAnswerFile(userName, surveyId, questionId, fileName);
    } else {
      await this.surveyAnswerAttachmentsService.deleteTempQuestionAnswerFiles(userName, surveyId, questionId);
    }
  }

  @Get(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId/:fileName`)
  @Public()
  async serveFileFromAnswer(
    @Param() params: { userName: string; surveyId: string; questionId: string; fileName: string },
    @Res() res: Response,
  ) {
    const { userName, surveyId, questionId, fileName } = params;
    PublicSurveysController.validateParams({ ...params }, ['userName', 'surveyId', 'questionId', 'fileName']);
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    return this.surveyAnswerAttachmentsService.serveFileFromAnswer(userName, surveyId, questionId, fileName, res);
  }

  @Get(`${CHOICES}/:surveyId/:questionId`)
  @Public()
  async getChoices(@Param() params: { surveyId: string; questionId: string }) {
    const { surveyId, questionId } = params;
    if (surveyId === TEMPORAL_SURVEY_ID_STRING) {
      return [];
    }
    await this.surveyService.throwErrorIfSurveyIsNotPublic(surveyId);
    const choices = await this.surveyAnswerService.getSelectableChoices(surveyId, questionId);
    return choices.filter((choice) => choice.name !== SHOW_OTHER_ITEM);
  }
}

export default PublicSurveysController;
