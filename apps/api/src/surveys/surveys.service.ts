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
import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import SurveyElement from '@libs/survey/types/TSurveyElement';
import SURVEYS_IMAGES_DOMAIN from '@libs/survey/constants/surveysImagesDomain';
import SURVEYS_IMAGES_PATH from '@libs/survey/constants/surveysImagesPaths';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import surveysMigrationsList from './migrations/surveysMigrationsList';
import MigrationService from '../migration/migration.service';
import type UserConnections from '../types/userConnections';
import { Survey, SurveyDocument } from './survey.schema';
import AttachmentService from '../common/file-attachment/attachment.service';
import FilesystemService from '../filesystem/filesystem.service';

@Injectable()
class SurveysService implements OnModuleInit {
  private attachmentService: AttachmentService;

  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private readonly fileSystemService: FilesystemService,
    private readonly groupsService: GroupsService,
  ) {}

  async onModuleInit() {
    this.attachmentService = new AttachmentService(SURVEYS_IMAGES_DOMAIN, SURVEYS_IMAGES_PATH, this.fileSystemService);
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
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    return survey;
  }

  async findPublicSurvey(surveyId: string): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ _id: new Types.ObjectId(surveyId), isPublic: true }).exec();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteSurveys(surveyIds: string[], surveysSseConnections: UserConnections): Promise<void> {
    try {
      const surveyObjectIds = surveyIds.map((s) => new Types.ObjectId(s));
      await this.surveyModel.deleteMany({ _id: { $in: surveyObjectIds } });
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED, error);
    } finally {
      SseService.informAllUsers(surveysSseConnections, surveyIds.toString(), SSE_MESSAGE_TYPE.DELETED);
    }
  }

  async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    const imageDirectories = surveyIds.map((surveyId) => join(SURVEYS_IMAGES_PATH, surveyId));
    await this.fileSystemService.deleteDirectories(imageDirectories);
  }

  async updateSurvey(
    survey: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<SurveyDocument | null> {

    Logger.log(`updateSurvey`, 'AttachmentService');

    const existingSurvey = await this.surveyModel.findById(survey.id).lean();
    if (!existingSurvey) {
      return null;
    }

    const isUserSuperAdmin = currentUser.ldapGroups.includes(GroupRoles.SUPER_ADMIN);
    if (survey.creator.username !== currentUser.preferred_username && !isUserSuperAdmin) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.UNAUTHORIZED);
    }

    try {
      return await this.surveyModel
        .findOneAndUpdate<Survey>({ _id: new Types.ObjectId(survey.id) }, survey, { new: true })
        .lean();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      if (survey.isPublic) {
        SseService.informAllUsers(surveysSseConnections, survey, SSE_MESSAGE_TYPE.UPDATED);
      } else {
        const invitedMembersList = await this.groupsService.getInvitedMembers(
          survey.invitedGroups,
          survey.invitedAttendees,
        );
        const updatedSurvey = await this.surveyModel.findById(survey.id).lean();
        SseService.sendEventToUsers(
          invitedMembersList,
          surveysSseConnections,
          updatedSurvey || survey,
          SSE_MESSAGE_TYPE.UPDATED,
        );
      }
    }
  }

  async createSurvey(
    survey: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<SurveyDocument> {

    Logger.log(`createSurvey`, 'AttachmentService');

    const creator: AttendeeDto = {
      ...survey.creator,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    try {
      return await this.surveyModel.create({ ...survey, creator });
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      if (survey.isPublic) {
        SseService.informAllUsers(surveysSseConnections, survey, SSE_MESSAGE_TYPE.CREATED);
      } else {
        const invitedMembersList = await this.groupsService.getInvitedMembers(
          survey.invitedGroups,
          survey.invitedAttendees,
        );
        SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, survey, SSE_MESSAGE_TYPE.CREATED);
      }
    }
  }

  async updateImageLinkForImageQuestion(
    baseUrl: string,
    username: string,
    surveyId: string,
    tempFiles: string[],
    question: SurveyElement
  ) {

    Logger.log(`updateImageLinkForImageQuestion::question: ${JSON.stringify(question, null, 2)}`, 'AttachmentService');

    if (question.type !== 'image') {
      Logger.log(`question.type !== 'image'`, 'AttachmentService');
      return
    }
    if (!question.imageLink) {
      Logger.log(`!question.imageLink`, 'AttachmentService');
      return;
    }

    // eslint-disable-next-line no-underscore-dangle
    const pathWithIds = `${surveyId}/${question.name}`;

    Logger.log(`pathWithIds ${pathWithIds}`, 'AttachmentService');

    const imagesFileName = question.imageLink.split('/').pop();
    if (!imagesFileName) {
      return;
    }

    Logger.log(`imagesFileName ${imagesFileName}`, 'AttachmentService');

    Logger.log(`tempFiles.includes(imagesFileName) ${tempFiles.includes(imagesFileName)}`, 'AttachmentService');

    if (tempFiles.includes(imagesFileName)) {
      try {

        await this.attachmentService.moveTempFileIntoPermanentDirectory(imagesFileName, username, pathWithIds);

        // eslint-disable-next-line no-param-reassign
        question.imageLink = `${baseUrl}${this.attachmentService.getPersistentAttachmentUrl(pathWithIds, imagesFileName)}`;

      } catch (error) {
        Logger.error(error);
        throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.INTERNAL_SERVER_ERROR, error);
      }
    } else {
      Logger.log(`tempFiles does not include imagesFileName`, 'AttachmentService');
    }
  };

  async updateOrCreateSurvey(
    surveyDto: SurveyDto,
    user: JwtUser,
    baseUrl: string,
    surveysSseConnections: UserConnections,
  ): Promise<SurveyDocument | null> {

    Logger.log(`updateOrCreateSurvey`, 'AttachmentService');

    let survey: SurveyDocument | null;

    survey = await this.updateSurvey(surveyDto, user, surveysSseConnections);

    if (survey == null) {
      survey = await this.createSurvey(surveyDto, user, surveysSseConnections);
    }

    Logger.log(`surveyId ${survey._id}`, 'AttachmentService');

    Logger.log(`survey ${JSON.stringify(survey, null, 2)}`, 'AttachmentService');

    // eslint-disable-next-line no-underscore-dangle
    if (!survey._id) {
      return survey;
    }

    const surveyId = survey._id.toString();
    const FileNames = await this.attachmentService.getFileNamesFromTEMP(user.preferred_username);

    Logger.log(`FileNames ${JSON.stringify(FileNames, null, 2)}`, 'AttachmentService');

    if (FileNames.length === 0) {
      return survey;
    }

    const updateSurveyElement = async (question: SurveyElement) => {
      const pathWithIds = join(surveyId, question.name);
      await this.attachmentService.createPersistentDirectory(pathWithIds);

      const exists = await this.attachmentService.checkExistence(this.attachmentService.getPersistentDirectory(pathWithIds));

      Logger.log(`exists ${exists}`, 'AttachmentService');

      await this.updateImageLinkForImageQuestion(baseUrl, user.preferred_username, surveyId, FileNames, question);
    }

    survey.formula.pages?.forEach((page) => {
      page.elements?.forEach(updateSurveyElement);
    });
    survey.formula.elements?.forEach(updateSurveyElement);

    const surveyWithUpdatedImageLinks = await this.updateSurvey(
      { ...surveyDto, formula: survey.formula },
      user,
      surveysSseConnections,
    );
    void this.attachmentService.clearTEMP(user.preferred_username);

    Logger.log(`surveyWithUpdatedImageLinks ${JSON.stringify(surveyWithUpdatedImageLinks, null, 2)}`, 'AttachmentService');

    return surveyWithUpdatedImageLinks;
  }

  getTemporaryImageUrl = (username: string, fileName: string): string => this.attachmentService.getTemporaryAttachmentUrl(username, fileName);

  async serveTemporaryImage(userId: string, fileName: string, res: Response): Promise<Response> {
    return this.attachmentService.serveTemporaryAttachment(userId, fileName, res);
  }

  async servePermanentImage(surveyId: string, questionId: string, fileName: string, res: Response): Promise<Response> {
    const pathWithIds = join(surveyId, questionId);
    return this.attachmentService.servePersistentAttachment(pathWithIds, fileName, res);
  }
}

export default SurveysService;
