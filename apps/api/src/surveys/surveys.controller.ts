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
import { diskStorage } from 'multer';
import { Response, Request } from 'express';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  MessageEvent,
  Param,
  Patch,
  Post,
  Res,
  Sse,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import APPS from '@libs/appconfig/constants/apps';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import {
  ANSWER,
  CAN_PARTICIPATE,
  FIND_ONE,
  HAS_ANSWERS,
  IMAGES,
  PUBLIC_SURVEYS,
  RESULT,
  SURVEYS,
} from '@libs/survey/constants/surveys-endpoint';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AnswerDto from '@libs/survey/types/api/answer.dto';
import PushAnswerDto from '@libs/survey/types/api/push-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import SURVEYS_IMAGES_PATH from '@libs/survey/constants/surveysImagesPaths';
import SurveysService from './surveys.service';
import SurveyAnswerService from './survey-answer.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUser from '../common/decorators/getUser.decorator';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';
import AttachmentService from '../filesystem/attachement.service';

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

  @Post(IMAGES)
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req: Request, _file, callback) =>
          req.user?.preferred_username
            ? AttachmentService.getTemporaryDestination(
                `${APPS.SURVEYS}/${IMAGES}`,
                req.user?.preferred_username,
                callback,
              )
            : null,
        filename: (_req, file, callback) => AttachmentService.getUniqueFileNames(file, callback),
      }),
      fileFilter: (_req, file, callback) => AttachmentService.filterMimeTypes(file.mimetype, callback),
    }),
  )
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  uploadImage(@UploadedFile() file: Express.Multer.File, @Res() res: Response, @GetCurrentUsername() username: string) {
    AttachmentService.checkImageFile(file);
    const imageUrl = AttachmentService.getTemporaryImageUrl(`${PUBLIC_SURVEYS}/${IMAGES}`, username, file.filename);
    return res.status(HttpStatus.CREATED).json(imageUrl);
  }

  @Post(ANSWER)
  async getSubmittedSurveyAnswers(@Body() getAnswerDto: AnswerDto, @GetCurrentUsername() username: string) {
    const { surveyId, attendee } = getAnswerDto;
    return this.surveyAnswerService.getPrivateAnswer(surveyId, attendee || username);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto, @GetCurrentUser() user: JWTUser) {
    const survey = await this.surveyService.updateOrCreateSurvey(surveyDto, user, this.surveysSseConnections);
    if (survey == null) {
      return null;
    }

    const FileNames = AttachmentService.getFileNamesFromTEMP(`${APPS.SURVEYS}/${IMAGES}`, user.preferred_username);
    if (FileNames.length === 0) {
      return survey;
    }

    const updateElement = (element: SurveyElement) => {
      if (element.type === 'image') {
        if (!element.imageLink) {
          return;
        }

        const fileName = element.imageLink.split('/').pop();
        if (!fileName) {
          return;
        }
        const domain = `${PUBLIC_SURVEYS}/${IMAGES}`;
        const uri = element.imageLink.split(domain)[0];
        // eslint-disable-next-line no-underscore-dangle
        const pathWithIds = `${survey._id?.toString()}/${element.name}`;

        if (FileNames.includes(fileName)) {
          AttachmentService.moveFileToPermanentFiles(
            fileName,
            `${APPS.SURVEYS}/${IMAGES}`,
            pathWithIds,
            user.preferred_username,
          );
        }

        // eslint-disable-next-line no-param-reassign
        element.imageLink = AttachmentService.getPersistentImageUrl(`${uri}${domain}`, pathWithIds, fileName);
      }
    };

    survey.formula.pages?.forEach((page) => {
      page.elements?.forEach(updateElement);
    });
    survey.formula.elements?.forEach(updateElement);

    const surveyWithUpdatedImageLinks = await this.surveyService.updateSurvey(
      { ...surveyDto, formula: survey.formula },
      user,
      this.surveysSseConnections,
    );

    AttachmentService.clearTEMP(`${APPS.SURVEYS}/${IMAGES}`, user.preferred_username);

    return surveyWithUpdatedImageLinks;
  }

  @Delete()
  async deleteSurvey(@Body() deleteSurveyDto: DeleteSurveyDto) {
    const { surveyIds } = deleteSurveyDto;
    await this.surveyService.deleteSurveys(surveyIds, this.surveysSseConnections);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);

    void AttachmentService.onObjectRemoval(SURVEYS_IMAGES_PATH, surveyIds);
  }

  @Patch()
  async answerSurvey(@Body() pushAnswerDto: PushAnswerDto, @GetCurrentUser() user: JWTUser) {
    const { surveyId, saveNo, answer } = pushAnswerDto;
    return this.surveyAnswerService.addAnswer(surveyId, saveNo, answer, user);
  }

  @Sse('sse')
  sse(@GetCurrentUsername() username: string, @Res() res: Response): Observable<MessageEvent> {
    return SseService.subscribe(username, this.surveysSseConnections, res);
  }
}

export default SurveysController;
