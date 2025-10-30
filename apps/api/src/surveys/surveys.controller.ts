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
  ParseFilePipeBuilder,
  Post,
  Query,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import {
  ANSWER,
  CAN_PARTICIPATE,
  CHOICES,
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
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import PostSurveyAnswerDto from '@libs/survey/types/api/post-survey-answer.dto';
import DeleteSurveyDto from '@libs/survey/types/api/delete-survey.dto';
import { addUuidToFileName } from '@libs/common/utils/uuidAndFileNames';
import { HTTP_HEADERS, RequestResponseContentType } from '@libs/common/types/http-methods';
import SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH from '@libs/survey/constants/surveyAnswersTemporaryAttachmentPath';
import SURVEY_ANSWERS_MAXIMUM_FILE_SIZE from '@libs/survey/constants/survey-answers-maximum-file-size';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import CustomHttpException from 'apps/api/src/common/CustomHttpException';
import getUsernameFromRequest from 'apps/api/src/common/utils/getUsernameFromRequest';
import SurveysService from './surveys.service';
import SurveysAttachmentService from './surveys-attachment.service';
import SurveysTemplateService from './surveys-template.service';
import SurveyAnswerService from './survey-answers.service';
import FilesystemService from '../filesystem/filesystem.service';
import GetCurrentUsername from '../common/decorators/getCurrentUsername.decorator';
import GetCurrentUser from '../common/decorators/getCurrentUser.decorator';
import { checkAttachmentFile, createAttachmentUploadOptions } from '../filesystem/multer.utilities';
import AdminGuard from '../common/guards/admin.guard';
import SurveyAnswerAttachmentsService from './survey-answer-attachments.service';

@ApiTags(SURVEYS)
@ApiBearerAuth()
@Controller(SURVEYS)
class SurveysController {
  constructor(
    private readonly surveyService: SurveysService,
    private readonly surveysTemplateService: SurveysTemplateService,
    private readonly surveyAnswerService: SurveyAnswerService,
    private readonly filesystemService: FilesystemService,
    private readonly surveyAnswerAttachmentsService: SurveyAnswerAttachmentsService,
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
    return this.surveysTemplateService.createTemplate(surveyTemplateDto);
  }

  @Get(TEMPLATES)
  getTemplateNames() {
    return this.surveysTemplateService.serveTemplateNames();
  }

  @Get(`${TEMPLATES}/:filename`)
  getTemplate(@Param() params: { filename: string }, @Res() res: Response) {
    const { filename } = params;
    res.setHeader(HTTP_HEADERS.ContentType, RequestResponseContentType.APPLICATION_JSON);
    return this.surveysTemplateService.serveTemplate(filename, res);
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

  @Get(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId/:filename`)
  async servePermanentFileFromAnswer(
    @Param() params: { userName: string; surveyId: string; questionId: string; filename: string },
    @Res() res: Response,
    @GetCurrentUser() user: JWTUser,
  ) {
    const { userName, surveyId, questionId, filename } = params;
    if (!userName || !surveyId || !questionId || !filename) {
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
    const path = join(SURVEYS_ANSWER_FOLDER, ATTACHMENT_FOLDER, surveyId, questionId, userName);
    return this.filesystemService.serveFiles(path, filename, res);
  }

  @Post()
  async updateOrCreateSurvey(@Body() surveyDto: SurveyDto, @GetCurrentUser() currentUser: JWTUser) {
    return this.surveyService.updateOrCreateSurvey(surveyDto, currentUser);
  }

  @Delete()
  async deleteSurveys(@Body() deleteSurveyDto: DeleteSurveyDto, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyIds } = deleteSurveyDto;
    await Promise.all(
      surveyIds.map(async (surveyId) => {
        await this.surveyService.throwErrorIfUserIsNotCreator(surveyId, currentUser);
      }),
    );
    await this.surveyService.deleteSurveys(surveyIds);
    await this.surveyAnswerService.onSurveyRemoval(surveyIds);
    await SurveysAttachmentService.onSurveyRemoval(surveyIds);
  }

  @Post(ANSWER)
  async answerSurvey(@Body() postAnswerDto: PostSurveyAnswerDto, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyId, answer } = postAnswerDto;
    const attendee = {
      username: currentUser.preferred_username,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
    };
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    const savedAnswer = await this.surveyAnswerService.addAnswer(surveyId, answer, attendee);
    return savedAnswer;
  }

  @Get(`${FILES}/:surveyId/:questionId/:filename`)
  async serveFile(
    @Param() params: { surveyId: string; questionId: string; filename: string },
    @GetCurrentUser() currentUser: JWTUser,
    @Res() res: Response,
  ) {
    const { surveyId, questionId, filename } = params;
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    const path = join(SURVEYS, ATTACHMENT_FOLDER, surveyId, questionId);
    return this.filesystemService.serveFiles(path, filename, res);
  }

  @Get(`${FILES}/:filename`)
  async serveTempFile(
    @Param() params: { filename: string },
    @Res() res: Response,
    @GetCurrentUsername() username: string,
  ) {
    const { filename } = params;
    const path = join(SURVEYS, username);
    return this.filesystemService.serveTempFiles(path, filename, res);
  }

  @Post(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId`)
  @ApiConsumes(RequestResponseContentType.MULTIPART_FORM_DATA)
  @UseInterceptors(
    FileInterceptor(
      'file',
      createAttachmentUploadOptions(
        (req) => {
          const userName = req.params?.userName;
          const surveyId = req.params?.surveyId;
          const questionId = req.params?.questionId;
          if (!userName || !surveyId || !questionId) {
            throw new CustomHttpException(
              CommonErrorMessages.INVALID_REQUEST_DATA,
              HttpStatus.UNPROCESSABLE_ENTITY,
              undefined,
              SurveysController.name,
            );
          }
          return join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
        },
        false,
        (_req, file) => addUuidToFileName(file.originalname),
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
    @GetCurrentUser() currentUser: JWTUser,
    @Res() res: Response,
  ) {
    const { userName, surveyId, questionId } = params;
    if (!userName || !surveyId || !questionId || !file) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    }
    const path = join(SURVEY_ANSWERS_TEMPORARY_ATTACHMENT_PATH, userName, surveyId, questionId);
    const filePath = join(path, file.filename);
    const url = `${SURVEYS}/${ANSWER}/${FILES}/${userName}/${surveyId}/${questionId}/${file.filename}`;

    await FilesystemService.checkIfFileExist(filePath);

    const survey = await this.surveyService.findSurvey(surveyId, currentUser);
    if (!survey) {
      await FilesystemService.deleteFile(path, file.filename);
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    } else {
      const content = (await FilesystemService.readFile(filePath)).toString('base64');
      return res.status(HttpStatus.CREATED).json({ name: file.filename, url, content });
    }
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:questionName`)
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async deleteTempQuestionAnswerFiles(
    @Param() params: { userName: string; surveyId: string; questionId: string },
    @GetCurrentUser() currentUser: JWTUser,
  ) {
    const { userName, surveyId, questionId } = params;
    if (!userName || !surveyId || !questionId) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    }
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    await this.surveyAnswerAttachmentsService.deleteTempQuestionAnswerFiles(userName, surveyId, questionId);
  }

  @Get(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId/:filename`)
  async serveTempFileFromAnswer(
    @Param() params: { userName: string; surveyId: string; questionId: string; filename: string },
    @GetCurrentUser() currentUser: JWTUser,
    @Res() res: Response,
  ) {
    const { userName, surveyId, questionId, filename } = params;
    if (!userName || !surveyId || !questionId || !filename) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    }
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    return this.surveyAnswerAttachmentsService.serveFileFromAnswer(userName, surveyId, questionId, filename, res);
  }

  @Delete(`${ANSWER}/${FILES}/:userName/:surveyId/:questionId/:fileName`)
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async deleteTempAnswerFile(
    @Param() params: { userName: string; surveyId: string; questionId: string; fileName: string },
    @GetCurrentUser() currentUser: JWTUser,
  ) {
    const { userName, surveyId, questionId, fileName } = params;
    if (!userName || !surveyId || !questionId || !fileName) {
      throw new CustomHttpException(
        CommonErrorMessages.INVALID_REQUEST_DATA,
        HttpStatus.UNPROCESSABLE_ENTITY,
        undefined,
        SurveysController.name,
      );
    }
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    await SurveyAnswerAttachmentsService.deleteTempAnswerFile(userName, surveyId, questionId, fileName);
  }

  @Get(`${CHOICES}/:surveyId/:questionId`)
  async getChoices(@Param() params: { surveyId: string; questionId: string }, @GetCurrentUser() currentUser: JWTUser) {
    const { surveyId, questionId } = params;
    if (surveyId === TEMPORAL_SURVEY_ID_STRING) {
      return [];
    }
    await this.surveyService.throwErrorIfSurveyIsNotAccessible(surveyId, currentUser);
    const choices = await this.surveyAnswerService.getSelectableChoices(surveyId, questionId);
    return choices.filter((choice) => choice.name !== SHOW_OTHER_ITEM);
  }
}

export default SurveysController;
