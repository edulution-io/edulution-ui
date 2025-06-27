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
  Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiConsumes, ApiTags } from '@nestjs/swagger';
import { ANSWER, PUBLIC_USER, FILES, PUBLIC_SURVEYS, CHOICES } from '@libs/survey/constants/surveys-endpoint';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import { RequestResponseContentType } from '@libs/common/types/http-methods';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import { Public } from '../common/decorators/public.decorator';
import { createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import FilesystemService from 'apps/api/src/filesystem/filesystem.service';
import APPS_FILES_PATH from '@libs/common/constants/appsFilesPath';

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
    return this.surveyService.serveFiles(surveyId, questionId, filename, res);
  }

  @Get(`${ANSWER}/${FILES}/:surveyId/:questionId/:filename`)
  @Public()
  serveFileFromAnswer(
    @Param() params: { surveyId: string; questionId: string; filename: string },
    @Res() res: Response,
  ) {
    const { surveyId, questionId, filename } = params;
    return this.surveyAnswerService.serveFileFromAnswer(surveyId, questionId, filename, res);
  }

  @Post(`${ANSWER}/${FILES}/:userName/:surveyId`)
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
        return join(APPS_FILES_PATH, 'survey-answer', userName, surveyId);
      }),
    ),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  fileUpload(
    @UploadedFile() file: Express.Multer.File,
    @Res() res: Response,
    @Param() params: { userName: string; surveyId: string },
  ) {
    const { userName, surveyId } = params;
    if (!userName || !surveyId || !file) {
      throw new Error('INVALID_REQUEST_DATA');
    }
    const filePath = join(APPS_FILES_PATH, 'survey-answer', userName, surveyId, file.filename);

    FilesystemService.checkIfFileExist(filePath);

    const fileUrl = `${PUBLIC_SURVEYS}/${ANSWER}/${FILES}/${file.filename}`;

    Logger.log(
      `Created file: ${file.filename} in ${filePath} serving on: ${fileUrl} (url)`,
      PublicSurveysController.name,
    );

    return res.status(HttpStatus.CREATED).json(fileUrl);
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:fileName`)
  @Public()
  async deleteFiles(@Param() params: { userName: string; surveyId: string; fileName: string }) {
    const { userName, surveyId, fileName } = params;
    if (!userName || !surveyId || !fileName) {
      throw new Error('INVALID_REQUEST_DATA');
    }
    const path = join(APPS_FILES_PATH, 'survey-answer', userName, surveyId);

    Logger.log(`Deleting file: ${fileName} from path: ${path}`, PublicSurveysController.name);

    const response = await FilesystemService.deleteFile(path, FilesystemService.buildPathString(fileName));

    Logger.log(`File deleted: ${fileName} -> response: ${JSON.stringify(response)}`, PublicSurveysController.name);

    return response;
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
