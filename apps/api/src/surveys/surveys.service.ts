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

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import prepareCreator from '@libs/survey/utils/prepareCreator';
import SseMessageType from '@libs/common/types/sseMessageType';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import surveysMigrationsList from './migrations/surveysMigrationsList';
import MigrationService from '../migration/migration.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveysAttachmentService from './surveys-attachment.service';

@Injectable()
class SurveysService implements OnModuleInit {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private surveysAttachmentService: SurveysAttachmentService,
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

  // TODO: REMOVE AFTER REVIEW ONLY INCLUDED TO NOT BREAK THE REVIEW VIEW
  /*
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
  */

  async updateOrCreateSurvey(surveyDto: SurveyDto, user: JwtUser): Promise<SurveyDocument> {
    const isCreating = !surveyDto.id;

    const surveyId = isCreating ? new Types.ObjectId().toString() : surveyDto.id;
    if (!surveyId) {
      throw new CustomHttpException(
        SurveyErrorMessages.MISSING_ID_ERROR,
        HttpStatus.BAD_REQUEST,
        undefined,
        SurveysAttachmentService.name,
      );
    }

    if (!isCreating) {
      const existingSurvey = await this.surveyModel.findById(surveyId).lean();
      if (!existingSurvey) {
        throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
      }
      SurveysService.assertUserIsAuthorized(existingSurvey.creator.username, user);
    }

    const processedFormula = await this.surveysAttachmentService.preProcessFormula(
      surveyId,
      surveyDto.formula,
      user.preferred_username,
    );
    if (processedFormula === null) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysAttachmentService.name,
      );
    }

    const creator = isCreating ? prepareCreator(surveyDto.creator, user) : surveyDto.creator;
    const surveyDataToSave = {
      ...surveyDto,
      _id: surveyId,
      creator,
      formula: processedFormula,
    };
    const savedSurvey = await this.surveyModel
      .findByIdAndUpdate(surveyId, surveyDataToSave, { new: true, upsert: true })
      .exec();
    if (!savedSurvey) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    await this.notifySurveyChange(
      savedSurvey,
      isCreating ? SSE_MESSAGE_TYPE.SURVEY_CREATED : SSE_MESSAGE_TYPE.SURVEY_UPDATED,
    );

    this.surveysAttachmentService.cleanupTemporaryFiles(user.preferred_username);

    return savedSurvey as SurveyDocument;
  }

  notifySurveyChange = async (survey: SurveyDocument, eventType: SseMessageType): Promise<void> => {
    if (survey.isPublic) {
      this.sseService.informAllUsers(survey, eventType);
    } else {
      const invitedMembersList = await this.groupsService.getInvitedMembers(
        survey.invitedGroups,
        survey.invitedAttendees,
      );
      this.sseService.sendEventToUsers(invitedMembersList, survey, eventType);
    }
  };

  static assertUserIsAuthorized = (creatorUsername: string, currentUser: JwtUser): void => {
    const isOwner = creatorUsername === currentUser.preferred_username;
    const isSuperAdmin = currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN);
    if (!isOwner && !isSuperAdmin) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.UNAUTHORIZED);
    }
  };

  // TODO: REMOVE AFTER REVIEW ONLY INCLUDED TO NOT BREAK THE REVIEW VIEW
  /*
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
  */
}

export default SurveysService;
