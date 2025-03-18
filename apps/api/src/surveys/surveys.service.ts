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
import AttachmentService from '../filesystem/attachement.service';

@Injectable()
class SurveysService implements OnModuleInit {
  private attachmentService = new AttachmentService(SURVEYS_IMAGES_DOMAIN, SURVEYS_IMAGES_PATH);

  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private readonly groupsService: GroupsService,
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
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    return survey;
  }

  async findPublicSurvey(surveyId: string): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ _id: new Types.ObjectId(surveyId), isPublic: true }).exec();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
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

    const deleteAttachments = surveyIds.map((id) => this.attachmentService.clearPersistent(id));
    try {
      void Promise.all(deleteAttachments);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.ATTACHMENT_DELETION_FAILED, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateSurvey(
    survey: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<SurveyDocument | null> {
    const existingSurvey = await this.surveyModel.findById(survey.id).exec();
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
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      if (survey.isPublic) {
        SseService.informAllUsers(surveysSseConnections, survey, SSE_MESSAGE_TYPE.UPDATED);
      } else {
        const invitedMembersList = await this.groupsService.getInvitedMembers(
          survey.invitedGroups,
          survey.invitedAttendees,
        );
        const updatedSurvey = await this.surveyModel.findById(survey.id).exec();
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
    const creator: AttendeeDto = {
      ...survey.creator,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    try {
      return await this.surveyModel.create({ ...survey, creator });
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
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

  async handleUpdateOrCreateSurvey(
    surveyDto: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<SurveyDocument | null> {
    const updatedSurvey = await this.updateSurvey(surveyDto, currentUser, surveysSseConnections);
    if (updatedSurvey !== null) {
      return updatedSurvey;
    }
    return this.createSurvey(surveyDto, currentUser, surveysSseConnections);
  }

  async updateOrCreateSurvey(surveyDto: SurveyDto, user: JwtUser, surveysSseConnections: UserConnections) {
    const survey = await this.handleUpdateOrCreateSurvey(surveyDto, user, surveysSseConnections);
    if (survey == null) {
      return null;
    }

    const FileNames = this.attachmentService.getFileNamesFromTEMP(user.preferred_username);
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
        const baseUrl = element.imageLink.split(SURVEYS_IMAGES_DOMAIN)[0];
        // eslint-disable-next-line no-underscore-dangle
        const pathWithIds = `${survey._id?.toString()}/${element.name}`;

        if (FileNames.includes(fileName)) {
          this.attachmentService.moveTempFileIntoPermanentDirectory(fileName, pathWithIds, user.preferred_username);
        }

        // eslint-disable-next-line no-param-reassign
        element.imageLink = `${baseUrl}${this.attachmentService.getPersistentImageUrl(pathWithIds, fileName)}`;
      }
    };

    survey.formula.pages?.forEach((page) => {
      page.elements?.forEach(updateElement);
    });
    survey.formula.elements?.forEach(updateElement);

    const surveyWithUpdatedImageLinks = await this.updateSurvey(
      { ...surveyDto, formula: survey.formula },
      user,
      surveysSseConnections,
    );
    this.attachmentService.clearTEMP(user.preferred_username);

    return surveyWithUpdatedImageLinks;
  }

  getTemporaryImageUrl = (userId: string, fileName: string): string =>
    this.attachmentService.getTemporaryImageUrl(userId, fileName);

  serveTemporaryImage = (userId: string, fileName: string, res: Response) =>
    this.attachmentService.serveTemporaryImage(userId, fileName, res);

  servePermanentImage = (surveyId: string, questionId: string, fileName: string, res: Response) =>
    this.attachmentService.servePermanentImage(`${surveyId}/${questionId}`, fileName, res);
}

export default SurveysService;
