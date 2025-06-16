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
import GroupRoles from '@libs/groups/types/group-roles.enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyQuestionUpdate from '@libs/survey/types/TSurveyQuestionUpdate';
import SurveyTemplateDto from '@libs/survey/types/api/template.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import TSurveyQuestionChoice from '@libs/survey/types/TSurveyQuestionChoice';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import {
  SURVEY_FILE_ATTACHMENT_ENDPOINT,
  SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT,
} from '@libs/survey/constants/surveys-endpoint';
import SURVEYS_FILES_PATH from '@libs/survey/constants/surveysFilesPath';
import SURVEYS_TEMP_FILES_PATH from '@libs/survey/constants/surveysTempFilesPath';
import TEMPORAL_SURVEY_ID_STRING from '@libs/survey/constants/temporal-survey-id-string';
import SURVEYS_HEADER_IMAGE from '@libs/survey/constants/surveys-header-image';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyPage from '@libs/survey/types/TSurveyPage';
import SurveyFormula from '@libs/survey/types/TSurveyFormula';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import SURVEYS_TEMPLATE_PATH from '@libs/survey/constants/surveysTemplatePath';
import isQuestionTypeChoiceType from '@libs/survey/utils/isQuestionTypeChoiceType';
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

    const isUserSuperAdmin = currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN);
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

  static updateRestfulChoicesQuestionLink(surveyId: string, question: SurveyElement): SurveyElement {
    if (!isQuestionTypeChoiceType(question.type)) {
      return question;
    }

    if (!question.choicesByUrl) {
      return question;
    }

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
    return question;
  }

  async updateElements(
    username: string,
    surveyId: string,
    elements: SurveyElement[],
    tempFiles: string[],
  ): Promise<SurveyElement[]> {
    const updatePromises = elements?.map(async (question) =>
      this.updateQuestion(username, surveyId, question, tempFiles),
    );
    return Promise.all(updatePromises);
  }

  async updatePages(
    username: string,
    surveyId: string,
    pages: SurveyPage[],
    tempFiles: string[],
  ): Promise<SurveyPage[]> {
    const updatePromises = pages.map(async (page) => {
      if (!page.elements || page.elements?.length === 0) {
        return page;
      }
      const updatedElements = await this.updateElements(username, surveyId, page.elements, tempFiles);
      return { ...page, elements: updatedElements };
    });
    return Promise.all(updatePromises);
  }

  async updateFormula(username: string, surveyId: string, formula: SurveyFormula): Promise<SurveyFormula> {
    const temporaryDirectoryPath = join(SURVEYS_TEMP_FILES_PATH, username);
    const tempFileNames = await this.fileSystemService.getAllFilenamesInDirectory(temporaryDirectoryPath);

    const updatedFormula = { ...formula };

    if (formula.logo) {
      updatedFormula.logo = await this.updateLogo(username, surveyId, formula, tempFileNames);
    }

    if (formula.pages && formula.pages.length > 0) {
      updatedFormula.pages = await this.updatePages(username, surveyId, formula.pages, tempFileNames);
    }
    if (formula.elements && formula.elements.length > 0) {
      updatedFormula.elements = await this.updateElements(username, surveyId, formula.elements, tempFileNames);
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

    Logger.log(`Survey with id: ${surveyId} was updated or created by ${username}`, SurveysService.name);

    try {
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
      this.removeTemporaryFilesFolder(username);

      return savedSurvey;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.FILE_DELETION_FAILED,
        HttpStatus.NOT_MODIFIED,
        error,
        SurveysService.name,
      );
    }
  }

  removeTemporaryFilesFolder(username: string): void {
    setTimeout((): void => {
      const temporaryAttachmentPath = join(SURVEYS_TEMP_FILES_PATH, username);
      void this.fileSystemService.deleteDirectory(temporaryAttachmentPath);
    }, 500000);
  }

  async createTemplate(surveyTemplateDto: SurveyTemplateDto): Promise<void> {
    let filename = surveyTemplateDto.fileName;
    if (!filename) {
      const date = new Date();
      filename = `${date.getFullYear()}${date.getMonth() + 1}${date.getDate()}-${date.getHours()}:${date.getMinutes()}-${uuidv4()}.json`;
    }
    const templatePath = join(SURVEYS_TEMPLATE_PATH, filename);
    try {
      await this.fileSystemService.ensureDirectoryExists(SURVEYS_TEMPLATE_PATH);
      return await FilesystemService.writeFile(templatePath, JSON.stringify(surveyTemplateDto.template, null, 2));
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

  async updateTempFilesUrls(username: string, pathWithIds: string, link: string, fileName?: string): Promise<string> {
    if (!link) return link;

    const [baseUrl, tempSegment] = link.split(`/${SURVEY_TEMP_FILE_ATTACHMENT_ENDPOINT}`);
    const imagesFileName = fileName || tempSegment?.split('/').pop();

    if (!baseUrl || !imagesFileName) {
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

  async removeQuestionAttachment(username: string, surveyId: string, questionName: string) {
    const permaDirectory = join(SURVEYS_FILES_PATH, username, surveyId, questionName);
    await this.fileSystemService.deleteDirectory(permaDirectory);
  }

  async removeTemporaryAttachments(username: string) {
    const tempDirectory = join(SURVEYS_TEMP_FILES_PATH, username);
    await this.fileSystemService.deleteDirectory(tempDirectory);
  }

  async updateImageQuestionImageLink(
    username: string,
    surveyId: string,
    questionUpdate: SurveyQuestionUpdate,
  ): Promise<SurveyQuestionUpdate> {
    const { question, temporalFileNames, permanentFileNames } = questionUpdate;

    if (question.type !== 'image') {
      return { question, temporalFileNames, permanentFileNames };
    }

    let { imageLink } = question;
    if (!imageLink) {
      await this.removeQuestionAttachment(username, surveyId, question.name);
      return { question, temporalFileNames, permanentFileNames };
    }

    let fileNames: string[] = [];
    if (permanentFileNames && permanentFileNames.length > 0) {
      fileNames = permanentFileNames;
    } else {
      const permanentDirectoryPath = join(SURVEYS_FILES_PATH, surveyId, question.name);
      fileNames = await this.fileSystemService.getAllFilenamesInDirectory(permanentDirectoryPath);
    }

    if (fileNames.length === 0 && temporalFileNames.length === 0) {
      return { question, temporalFileNames, permanentFileNames: fileNames };
    }

    const linkedFileName = imageLink.split('/').pop();
    if (!linkedFileName) {
      return { question, temporalFileNames, permanentFileNames: fileNames };
    }

    const tempIndex = temporalFileNames.indexOf(linkedFileName);
    if (tempIndex !== -1) {
      temporalFileNames.splice(tempIndex, 1);
      const pathWithIds = join(surveyId, question.name);
      imageLink = await this.updateTempFilesUrls(username, pathWithIds, imageLink, linkedFileName);
      question.imageLink = imageLink;
    }

    const deleteOldFilesPromises = fileNames.map(async (fileName) => {
      if (fileName !== linkedFileName) {
        const path = join(SURVEYS_FILES_PATH, surveyId, question.name);
        const filePath = join(path, fileName);

        Logger.log(`Deleting permanent image file: ${filePath}`);

        await FilesystemService.deleteFile(path, fileName);
      }
    });
    await Promise.all(deleteOldFilesPromises);

    return { question, temporalFileNames, permanentFileNames: fileNames };
  }

  async updateImagePickerQuestionChoiceImageLink(
    username: string,
    surveyId: string,
    question: SurveyElement,
    choice: TSurveyQuestionChoice,
    temporalFileNames: string[],
  ): Promise<TSurveyQuestionChoice> {
    if (typeof choice === 'string') {
      return choice;
    }

    let { imageLink } = choice;
    if (!imageLink) {
      return choice;
    }

    const linkedFileName = imageLink.split('/').pop();
    if (!linkedFileName) {
      return choice;
    }

    const tempIndex = temporalFileNames.indexOf(linkedFileName);
    if (tempIndex !== -1) {
      temporalFileNames.splice(tempIndex, 1);
      const pathWithIds = join(surveyId, question.name);
      imageLink = await this.updateTempFilesUrls(username, pathWithIds, imageLink, linkedFileName);
    }
    return { ...choice, imageLink };
  }

  async updateImagePickerQuestionChoicesImageLinks(
    username: string,
    surveyId: string,
    questionUpdate: SurveyQuestionUpdate,
  ): Promise<SurveyQuestionUpdate> {
    const { question, temporalFileNames, permanentFileNames } = questionUpdate;

    if (question.type !== 'imagepicker') {
      return { question, temporalFileNames, permanentFileNames };
    }

    Logger.log(
      `updateQuestion::updateImagePickerQuestionChoicesImageLinks: '${JSON.stringify(question, null, 2)}'`,
      SurveysService.name,
    );

    const { choices } = question;
    if (!choices || choices.length === 0) {
      await this.removeQuestionAttachment(username, surveyId, question.name);
      return { question, temporalFileNames, permanentFileNames };
    }

    let fileNames: string[] = [];
    if (permanentFileNames && permanentFileNames.length > 0) {
      fileNames = permanentFileNames;
    } else {
      const permanentDirectoryPath = join(SURVEYS_FILES_PATH, surveyId, question.name);
      fileNames = await this.fileSystemService.getAllFilenamesInDirectory(permanentDirectoryPath);
    }

    if (fileNames.length === 0 && temporalFileNames.length === 0) {
      return { question, temporalFileNames, permanentFileNames: fileNames };
    }

    const promises = choices.map(async (choice) =>
      this.updateImagePickerQuestionChoiceImageLink(username, surveyId, question, choice, temporalFileNames),
    );

    const updatedChoices = await Promise.all(promises);

    const includedFileNames: string[] = [];
    updatedChoices.forEach((choice) => {
      if (typeof choice === 'string') {
        return;
      }
      const { imageLink } = choice;
      if (!imageLink) {
        return;
      }
      const fileName = imageLink.split('/').pop();
      if (!fileName) {
        return;
      }
      includedFileNames.push(fileName);
    });

    const deleteOldFilesPromises = fileNames.map(async (fileName) => {
      if (!includedFileNames.includes(fileName)) {
        const path = join(SURVEYS_FILES_PATH, surveyId, question.name);
        await FilesystemService.deleteFile(path, fileName);
      }
    });

    await Promise.all(deleteOldFilesPromises);

    return {
      question: { ...question, choices: updatedChoices },
      temporalFileNames,
      permanentFileNames: includedFileNames,
    };
  }

  async updateFileQuestionFileLink(
    username: string,
    surveyId: string,
    questionUpdate: SurveyQuestionUpdate,
  ): Promise<SurveyQuestionUpdate> {
    const { question, temporalFileNames, permanentFileNames } = questionUpdate;

    if (question.type !== 'file') {
      return { question, temporalFileNames, permanentFileNames };
    }

    let fileNames: string[] = [];
    if (permanentFileNames && permanentFileNames.length > 0) {
      fileNames = permanentFileNames;
    } else {
      const permanentDirectoryPath = join(SURVEYS_FILES_PATH, surveyId, question.name);
      fileNames = await this.fileSystemService.getAllFilenamesInDirectory(permanentDirectoryPath);
    }

    Logger.log(
      `updateQuestion::updateFileQuestionFileLink: '${JSON.stringify(question, null, 2)}'`,
      SurveysService.name,
    );

    if (fileNames.length === 0 && temporalFileNames.length === 0) {
      return { question, temporalFileNames, permanentFileNames: fileNames };
    }

    let questionValue = question.value as string;
    if (!questionValue) {
      await this.removeQuestionAttachment(username, surveyId, question.name);
      return { question, temporalFileNames, permanentFileNames };
    }

    const linkedFileName = questionValue.split('/').pop();
    if (!linkedFileName) {
      await this.removeQuestionAttachment(username, surveyId, question.name);
      return { question, temporalFileNames, permanentFileNames };
    }

    const tempIndex = temporalFileNames.indexOf(linkedFileName);
    if (tempIndex !== -1) {
      temporalFileNames.splice(tempIndex, 1);
      const pathWithIds = join(surveyId, question.name);
      questionValue = await this.updateTempFilesUrls(username, pathWithIds, questionValue, linkedFileName);
      question.value = questionValue;
    }

    const deleteOldFilesPromises = fileNames.map(async (fileName) => {
      if (fileName !== linkedFileName) {
        const path = join(SURVEYS_FILES_PATH, surveyId, question.name);
        const filePath = join(path, fileName);

        Logger.log(`Deleting permanent image file: ${filePath}`);

        await FilesystemService.deleteFile(path, fileName);
      }
    });
    await Promise.all(deleteOldFilesPromises);

    return { question: { ...question, value: questionValue }, temporalFileNames, permanentFileNames };
  }

  async removeAttachmentForOtherQuestionTypes(
    username: string,
    surveyId: string,
    questionUpdate: SurveyQuestionUpdate,
  ): Promise<void> {
    const { question } = questionUpdate;

    const isQuestionTypeAttachmentType = (questionType: string): boolean =>
      questionType === 'image' || questionType === 'imagepicker' || questionType === 'file';

    if (isQuestionTypeAttachmentType(question.type)) {
      return;
    }

    await this.removeQuestionAttachment(username, surveyId, question.name);
  }

  async updateQuestion(
    username: string,
    surveyId: string,
    question: SurveyElement,
    tempFiles: string[],
  ): Promise<SurveyElement> {
    Logger.log(
      `updateQuestion: '${question.name}' in survey: '${surveyId}' for user: '${username}'`,
      SurveysService.name,
    );

    let updatedQuestion: SurveyQuestionUpdate = {
      question,
      temporalFileNames: tempFiles,
    };

    switch (question.type) {
      case 'image':
        updatedQuestion = await this.updateImageQuestionImageLink(username, surveyId, updatedQuestion);
        break;
      case 'imagepicker':
        updatedQuestion = await this.updateImagePickerQuestionChoicesImageLinks(username, surveyId, updatedQuestion);
        break;
      case 'file':
        updatedQuestion = await this.updateFileQuestionFileLink(username, surveyId, updatedQuestion);
        break;
      default:
        await this.removeAttachmentForOtherQuestionTypes(username, surveyId, updatedQuestion);
        break;
    }

    await this.removeTemporaryAttachments(username);

    updatedQuestion.question = SurveysService.updateRestfulChoicesQuestionLink(surveyId, updatedQuestion.question);

    return updatedQuestion.question;
  }

  async updateLogo(
    username: string,
    surveyId: string,
    formula: SurveyFormula,
    tempFileNames: string[],
  ): Promise<string | undefined> {
    const permanentDirectoryPath = join(SURVEYS_FILES_PATH, surveyId, SURVEYS_HEADER_IMAGE);
    const permanentFileNames = await this.fileSystemService.getAllFilenamesInDirectory(permanentDirectoryPath);

    if (tempFileNames.length === 0 && permanentFileNames.length === 0) {
      return formula.logo;
    }

    let { logo } = formula;
    if (logo) {
      const logosFileName = logo?.split('/').pop();
      if (logosFileName) {
        const tempIndex = tempFileNames.indexOf(logosFileName);
        if (tempIndex !== -1) {
          tempFileNames.splice(tempIndex, 1);
          const pathWithIds = join(surveyId, SURVEYS_HEADER_IMAGE);
          logo = await this.updateTempFilesUrls(username, pathWithIds, logo, logosFileName);
        }

        const deleteOldFilesPromises = permanentFileNames.map(async (fileName) => {
          if (fileName !== logosFileName) {
            const path = join(SURVEYS_FILES_PATH, surveyId, SURVEYS_HEADER_IMAGE);
            const filePath = join(path, fileName);

            Logger.log(`Deleting permanent logo file: ${filePath}`);

            const exists = await FilesystemService.checkIfFileExist(filePath);
            if (exists) {
              await FilesystemService.deleteFile(path, fileName);
            }
          }
        });
        await Promise.all(deleteOldFilesPromises);
      }
    } else {
      await this.removeQuestionAttachment(username, surveyId, SURVEYS_HEADER_IMAGE);
    }

    return logo;
  }
}

export default SurveysService;
