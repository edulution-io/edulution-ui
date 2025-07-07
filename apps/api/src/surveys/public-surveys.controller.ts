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
import { Request, Response } from 'express';
import {
  Body,
  Controller,
  Req,
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
import { ANSWER, PUBLIC_USER, FILES, PUBLIC_SURVEYS, CHOICES } from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveysAnswerTemporaryAttachmentPath';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import getUsernameFromRequest from 'apps/api/src/common/utils/getUsernameFromRequest';
import surveyAnswerMaximumFileSize from '@libs/survey/constants/survey-answer-max-file-size';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import FilesystemService from 'apps/api/src/filesystem/filesystem.service';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import SurveysAttachmentService from './surveys-attachment.service';
import { Public } from '../common/decorators/public.decorator';
import { createAttachmentUploadOptions } from '../filesystem/multer.utilities';

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
    const savedAnswer = await this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, attendee);
    if (!savedAnswer) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        PublicSurveysController.name,
      );
    }
    return savedAnswer;
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

  @Post(`${ANSWER}/${FILES}/:userName/:surveyId`)
  @Public()
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions((req) => {
        const userName = req.params?.userName;
        const surveyId = req.params?.surveyId;
        if (!userName || !surveyId) {
          throw new Error('INVALID_REQUEST_DATA');
        }
        return join(SURVEYS_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
      }),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async fileUpload(
    @UploadedFile(
      new ParseFilePipeBuilder()
        .addMaxSizeValidator({
          maxSize: surveyAnswerMaximumFileSize,
        })
        .build({
          errorHttpStatusCode: HttpStatus.UNPROCESSABLE_ENTITY,
        }),
    )
    file: Express.Multer.File,
    @Res() res: Response,
    @Param() params: { userName: string; surveyId: string },
  ) {
    const { userName, surveyId } = params;
    if (!userName || !surveyId || !file) {
      throw new Error('INVALID_REQUEST_DATA');
    }
    const filePath = join(SURVEYS_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, file.filename);
    const fileUrl = `${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${surveyId}/${file.filename}`;
    await FilesystemService.checkIfFileExist(filePath);
    return res.status(HttpStatus.CREATED).json(fileUrl);
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:fileName`)
  @Public()
  async deleteFiles(@Param() params: { userName: string; surveyId: string; fileName: string }) {
    const { userName, surveyId, fileName } = params;
    if (!userName || !surveyId || !fileName) {
      throw new Error('INVALID_REQUEST_DATA');
    }
    await SurveyAnswerService.deleteFileFromAnswer(userName, surveyId, fileName);
  }

  @Get(`${ANSWER}/${FILES}/:surveyId/:filename`)
  @Public()
  serveFileFromAnswer(
    @Param() params: { surveyId: string; filename: string },
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const { surveyId, filename } = params;

    if (!surveyId || !filename) {
      throw new Error('INVALID_REQUEST_DATA');
    }

    const userName = getUsernameFromRequest(req);

    return this.surveyAnswerService.serveFileFromAnswer(userName, surveyId, filename, res);
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
