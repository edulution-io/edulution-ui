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
import { v4 as uuidv4 } from 'uuid';
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import {
  SURVEY_FILE_ATTACHMENT_ENDPOINT,
  SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_FILES_PATH from '@libs/survey/constants/surveysFilesPath';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyPage from '@libs/survey/types/TSurveyPage';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import SURVEYS_TEMPLATE_PATH from '@libs/survey/constants/surveysTemplatePath';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import surveysMigrationsList from './migrations/surveysMigrationsList';
import MigrationService from '../migration/migration.service';
import { Survey, SurveyDocument } from './survey.schema';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysService implements OnModuleInit {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private fileSystemService: FilesystemService,
    private readonly groupsService: GroupsService,
    private readonly sseService: SseService,
  ) {}

  async onModuleInit() {
    await MigrationService.runMigrations<SurveyDocument>(this.surveyModel, surveysMigrationsList);
  }

  async findSurvey(surveyId: string, user: JwtUser): Promise<Survey | null> {
    const survey = await this.surveyModel
      .findOne({
        $and: [
          {
            $or: [
              { isPublic: true },
              { 'creator.username': user.preferred_username },
              { 'invitedAttendees.username': user.preferred_username },
              { 'invitedGroups.path': { $in: user.ldapGroups } },
            ],
          },
          { _id: new Types.ObjectId(surveyId) },
        ],
      })
      .exec();

    if (!survey) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysService.name,
      );
    }

    return survey;
  }

  async findPublicSurvey(surveyId: string): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ _id: new Types.ObjectId(surveyId), isPublic: true }).exec();
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysService.name,
      );
    }
  }

  async deleteSurveys(surveyIds: string[]): Promise<void> {
    try {
      const surveyObjectIds = surveyIds.map((s) => new Types.ObjectId(s));
      await this.surveyModel.deleteMany({ _id: { $in: surveyObjectIds } });
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(
        SurveyErrorMessages.DeleteError,
        HttpStatus.NOT_MODIFIED,
        error,
        SurveysService.name,
      );
    } finally {
      this.sseService.informAllUsers(surveyIds, SSE_MESSAGE_TYPE.SURVEY_DELETED);
    }
  }

  async updateSurvey(survey: SurveyDto, currentUser: JwtUser): Promise<SurveyDocument | null> {
    const existingSurvey = await this.surveyModel.findById(survey.id).exec();
    if (!existingSurvey) {
      return null;
    }

    const isUserSuperAdmin = getIsAdmin(currentUser.ldapGroups);
    if (survey.creator.username !== currentUser.preferred_username && !isUserSuperAdmin) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.UNAUTHORIZED,
        undefined,
        SurveysService.name,
      );
    }

    try {
      return await this.surveyModel
        .findOneAndUpdate<SurveyDocument>({ _id: new Types.ObjectId(survey.id) }, survey, { new: true })
        .lean();
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysService.name,
      );
    } finally {
      if (survey.isPublic) {
        this.sseService.informAllUsers(survey, SSE_MESSAGE_TYPE.SURVEY_UPDATED);
      } else {
        const invitedMembersList = await this.groupsService.getInvitedMembers(
          survey.invitedGroups,
          survey.invitedAttendees,
        );

        const updatedSurvey = await this.surveyModel.findById(survey.id).lean();
        this.sseService.sendEventToUsers(invitedMembersList, updatedSurvey || survey, SSE_MESSAGE_TYPE.SURVEY_UPDATED);
      }
    }
  }

  async createSurvey(survey: SurveyDto, currentUser: JwtUser): Promise<SurveyDocument> {
    const creator: AttendeeDto = {
      ...survey.creator,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    try {
      return await this.surveyModel.create({ ...survey, creator });
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysService.name,
      );
    } finally {
      if (survey.isPublic) {
        this.sseService.informAllUsers(survey, SSE_MESSAGE_TYPE.SURVEY_CREATED);
      } else {
        const invitedMembersList = await this.groupsService.getInvitedMembers(
          survey.invitedGroups,
          survey.invitedAttendees,
        );
        this.sseService.sendEventToUsers(invitedMembersList, survey, SSE_MESSAGE_TYPE.SURVEY_CREATED);
      }
    }
  }

  static updateLinkForRestfulChoices(surveyId: string, question: SurveyElement): SurveyElement {
    if (isQuestionTypeChoiceType(question.type) && question.choicesByUrl) {
      const pathParts = question.choicesByUrl.url.split('/');
      const temporalSurveyIdIndex = pathParts.findIndex((part: string) => part === TEMPORAL_SURVEY_ID_STRING);
      if (temporalSurveyIdIndex !== -1) {
        try {
          pathParts[temporalSurveyIdIndex] = surveyId;
          const newLink = pathParts.join('/');
          return {
            ...question,
            choicesByUrl: {
              ...question.choicesByUrl,
              url: newLink,
            },
          };
        } catch (error) {
          throw new CustomHttpException(
            CommonErrorMessages.FILE_NOT_PROVIDED,
            HttpStatus.INTERNAL_SERVER_ERROR,
            error,
            SurveysService.name,
          );
        }
      }
    }
    return question;
  }

  async updateElements(
    username: string,
    surveyId: string,
    tempFiles: string[],
    elements: SurveyElement[],
  ): Promise<SurveyElement[]> {
    const updatePromises = elements?.map(async (question) =>
      this.updateQuestion(username, surveyId, tempFiles, question),
    );
    return Promise.all(updatePromises);
  }

  async updatePages(
    username: string,
    surveyId: string,
    tempFiles: string[],
    pages: SurveyPage[],
  ): Promise<SurveyPage[]> {
    const updatePromises = pages.map(async (page) => {
      if (!page.elements || page.elements?.length === 0) {
        return page;
      }
      const updatedElements = await this.updateElements(username, surveyId, tempFiles, page.elements);
      return { ...page, elements: updatedElements };
    });
    return Promise.all(updatePromises);
  }

  async updateFormula(username: string, surveyId: string, formula: SurveyFormula): Promise<SurveyFormula> {
    const temporaryDirectoryPath = `${SURVEYS_TEMP_FILES_PATH}/${username}`;
    const fileNames = await this.fileSystemService.getAllFilenamesInDirectory(temporaryDirectoryPath);

    if (fileNames.length === 0) {
      return formula;
    }
    const updatedFormula = { ...formula };
    if (formula.logo) {
      updatedFormula.logo = await this.updateTemporalLogo(username, surveyId, fileNames, formula.logo);
    }
    if (formula.pages && formula.pages.length > 0) {
      updatedFormula.pages = await this.updatePages(username, surveyId, fileNames, formula.pages);
    }
    if (formula.elements && formula.elements.length > 0) {
      updatedFormula.elements = await this.updateElements(username, surveyId, fileNames, formula.elements);
    }
    return updatedFormula;
  }

  async updateOrCreateSurvey(surveyDto: SurveyDto, user: JwtUser): Promise<SurveyDocument | null> {
    let survey: SurveyDocument | null;
    survey = await this.updateSurvey(surveyDto, user);
    if (survey == null) {
      survey = await this.createSurvey(surveyDto, user);
    }
    if (survey == null) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysService.name,
      );
    }
    // eslint-disable-next-line no-underscore-dangle
    const surveyId = (survey._id as Types.ObjectId).toString();
    const { preferred_username: username } = user;

    const updatedFormula = await this.updateFormula(username, surveyId, survey.formula);

    const updatedSurvey = { ...surveyDto, id: surveyId, formula: updatedFormula };
    const savedSurvey = await this.updateSurvey(updatedSurvey, user);

    if (savedSurvey == null) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysService.name,
      );
    }

    try {
      const temporaryAttachmentPath = `${SURVEYS_TEMP_FILES_PATH}/${username}`;
      const exists = await FilesystemService.checkIfFileExist(temporaryAttachmentPath);
      if (!exists) {
        return savedSurvey;
      }
      await this.fileSystemService.deleteDirectory(temporaryAttachmentPath);
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_DELETION_FAILED,
        HttpStatus.NOT_MODIFIED,
        error,
        SurveysService.name,
      );
    }

    return savedSurvey;
  }

  async createTemplate(surveyTemplateDto: SurveyTemplateDto): Promise<string> {
    let filename = surveyTemplateDto.fileName;
    if (!filename) {
      const date = new Date();
      filename = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${date.getHours()}:${date.getMinutes()}-${uuidv4()}.json`;
    }
    const templatePath = join(SURVEYS_TEMPLATE_PATH, filename);
    try {
      await this.fileSystemService.ensureDirectoryExists(SURVEYS_TEMPLATE_PATH);
      await FilesystemService.writeFile(templatePath, JSON.stringify(surveyTemplateDto.template, null, 2));
      return filename;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_WRITING_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysService.name,
      );
    }
  }

  async serveTemplateNames(): Promise<string[]> {
    return this.fileSystemService.getAllFilenamesInDirectory(SURVEYS_TEMPLATE_PATH);
  }

  async serveTemplate(fileName: string, res: Response): Promise<Response> {
    const templatePath = join(SURVEYS_TEMPLATE_PATH, fileName);
    const fileStream = await this.fileSystemService.createReadStream(templatePath);
    fileStream.pipe(res);
    return res;
  }

  async serveFiles(surveyId: string, questionId: string, fileName: string, res: Response): Promise<Response> {
    const filePath = `${SURVEYS_FILES_PATH}/${surveyId}/${questionId}/${fileName}`;
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    const filePath = surveyIds.map((surveyId) => join(SURVEYS_FILES_PATH, surveyId));
    return FilesystemService.deleteDirectories(filePath);
  }

  async serveTempFiles(userId: string, fileName: string, res: Response): Promise<Response> {
    const filePath = `${SURVEYS_TEMP_FILES_PATH}/${userId}/${fileName}`;
    const fileStream = await this.fileSystemService.createReadStream(filePath);
    fileStream.pipe(res);
    return res;
  }

  async updateTempFilesUrls(username: string, pathWithIds: string, tempFiles: string[], link: string): Promise<string> {
    if (!link) return link;

    const [baseUrl, tempSegment] = link.split(`/${SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT}`);
    const imagesFileName = tempSegment?.split('/').pop();

    if (!baseUrl || !imagesFileName || !tempFiles.includes(imagesFileName)) {
      return link;
    }

    const temporaryAttachmentPath = join(SURVEYS_TEMP_FILES_PATH, username, imagesFileName);
    const permanentDirectory = join(SURVEYS_FILES_PATH, pathWithIds);
    const persistentAttachmentPath = join(permanentDirectory, imagesFileName);

    try {
      await this.fileSystemService.ensureDirectoryExists(permanentDirectory);
      await FilesystemService.moveFile(temporaryAttachmentPath, persistentAttachmentPath);
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_MOVE_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysService.name,
      );
    }

    return `${baseUrl}/${SURVEY_FILE_ATTACHMENT_ENDPOINT}/${pathWithIds}/${imagesFileName}`;
  }

  async updateTemporalUrls(
    username: string,
    surveyId: string,
    tempFiles: string[],
    question: SurveyElement,
  ): Promise<SurveyElement> {
    const pathWithIds = `${surveyId}/${question.name}`;
    try {
      if (question.type === 'image' && question.imageLink) {
        const newImageLink = await this.updateTempFilesUrls(username, pathWithIds, tempFiles, question.imageLink);
        return { ...question, imageLink: newImageLink };
      }

      if (question.type === 'imagepicker' && question.choices) {
        const choices = await Promise.all(
          question.choices.map(async (choice) => {
            if (choice != null && typeof choice !== 'string' && choice.imageLink) {
              const newImageLink = await this.updateTempFilesUrls(username, pathWithIds, tempFiles, choice.imageLink);
              return { ...choice, imageLink: newImageLink };
            }
            return choice;
          }),
        );
        return { ...question, choices };
      }

      if (question.type === 'file') {
        const newFileLink = await this.updateTempFilesUrls(username, pathWithIds, tempFiles, question.value as string);
        return { ...question, value: newFileLink };
      }

      return question;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_NOT_PROVIDED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error,
        SurveysService.name,
      );
    }
  }

  async updateQuestion(
    username: string,
    surveyId: string,
    tempFiles: string[],
    question: SurveyElement,
  ): Promise<SurveyElement> {
    const updatedQuestion = await this.updateTemporalUrls(username, surveyId, tempFiles, question);
    return SurveysService.updateLinkForRestfulChoices(surveyId, updatedQuestion);
  }

  async updateTemporalLogo(
    username: string,
    surveyId: string,
    tempFiles: string[],
    link: string,
  ): Promise<string | undefined> {
    const pathWithIds = `${surveyId}/logo`;
    return this.updateTempFilesUrls(username, pathWithIds, tempFiles, link);
  }
}

export default SurveysService;
