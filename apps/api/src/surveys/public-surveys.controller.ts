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
import APPS from '@libs/appconfig/constants/apps';
import { ANSWER, PUBLIC_USER, FILES, PUBLIC_SURVEYS, CHOICES } from '@libs/survey/constants/surveys-endpoint';
import ATTACHMENT_FOLDER from '@libs/common/constants/attachmentFolder';
import SURVEYS_ANSWER_FOLDER from '@libs/survey/constants/surveyAnswersFolder';
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
    const { surveyId, answer, attendee } = postAnswerDto;
    const savedAnswer = await this.surveyAnswerService.addAnswer(surveyId, answer, attendee);
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
    const filePath = join(APPS.SURVEYS, ATTACHMENT_FOLDER, surveyId, questionId);
    return this.filesystemService.serveFiles(filePath, filename, res);
  }

  @Post(`${ANSWER}/${FILES}/:userName/:surveyId`)
  @Public()
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        (req) => {
          const userName = req.params?.userName;
          const surveyId = req.params?.surveyId;
          if (!userName || !surveyId) {
            throw new CustomHttpException(
              CommonErrorMessages.INVALID_REQUEST_DATA,
              HttpStatus.UNPROCESSABLE_ENTITY,
              undefined,
              PublicSurveysController.name,
            );
          }
          return join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId);
        },
        false,
        (_req, file) => addUuidToFileName(file.originalname),
      ),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async tempFileUpload(
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
    @Res() res: Response,
    @Param() params: { userName: string; surveyId: string },
  ) {
    const { userName, surveyId } = params;
    if (!userName || !surveyId || !file) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        PublicSurveysController.name,
      );
    }
    const filePath = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, file.filename);
    const url = `${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${userName}/${surveyId}/${file.filename}`;

    await FilesystemService.checkIfFileExist(filePath);
    const content = (await FilesystemService.readFile(filePath)).toString('base64');
    return res.status(HttpStatus.CREATED).json({ name: file.filename, url, content });
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:fileName`)
  @Public()
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async deleteTempFiles(@Param() params: { userName: string; surveyId: string; fileName: string }) {
    const { userName, surveyId, fileName } = params;
    if (!userName || !surveyId || !fileName) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        PublicSurveysController.name,
      );
    }
    await SurveyAnswerAttachmentsService.deleteTempFileFromAnswer(userName, surveyId, fileName);
  }

  @Get(`${ANSWER}/${FILES}/:userName/:surveyId/:filename`)
  @Public()
  serveTempFileFromAnswer(
    @Param() params: { userName: string; surveyId: string; filename: string },
    @Res() res: Response,
  ) {
    const { userName, surveyId, filename } = params;
    if (!userName || !surveyId || !filename) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        PublicSurveysController.name,
      );
    }
    const filePath = join(SURVEYS_ANSWER_FOLDER, userName, surveyId);
    return this.filesystemService.serveTempFiles(filePath, filename, res);
  }

  @Get(`${CHOICES}/:surveyId/:questionName`)
  @Public()
  async getChoices(@Param() params: { surveyId: string; questionName: string }) {
    const { surveyId, questionName } = params;
    if (surveyId === TEMPORAL_SURVEY_ID_STRING) {
      return [];
    }
    const choices = await this.surveyAnswerService.getSelectableChoices(surveyId, questionName);
    return choices.filter((choice) => choice.name !== SHOW_OTHER_ITEM);
  }
}

export default PublicSurveysController;
