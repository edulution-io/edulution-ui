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
import { createReadStream, existsSync, promises } from 'fs';
import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import AttendeeDto from '@libs/user/types/attendee.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import CustomHttpException from '@libs/error/CustomHttpException';
import SURVEYS_IMAGES_PATH from '@libs/survey/constants/surveysImagesPaths';
import IMAGE_UPLOAD_ALLOWED_MIME_TYPES from '@libs/common/constants/imageUploadAllowedMimeTypes';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import surveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import surveysMigrationsList from './migrations/surveysMigrationsList';
import MigrationService from '../migration/migration.service';
import type UserConnections from '../types/userConnections';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService implements OnModuleInit {
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
  }

  async updateSurvey(
    survey: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
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
        .exec();
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

  async createSurvey(survey: SurveyDto, currentUser: JwtUser, surveysSseConnections: UserConnections): Promise<Survey> {
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

  async updateOrCreateSurvey(
    surveyDto: SurveyDto,
    currentUser: JwtUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const updatedSurvey = await this.updateSurvey(surveyDto, currentUser, surveysSseConnections);
    if (updatedSurvey !== null) {
      return updatedSurvey;
    }

    return this.createSurvey(surveyDto, currentUser, surveysSseConnections);
  }

  static checkImageFile(file: Express.Multer.File): string {
    if (!file) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_PROVIDED, HttpStatus.BAD_REQUEST);
    }
    if (!IMAGE_UPLOAD_ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new CustomHttpException(CommonErrorMessages.ATTACHMENT_UPLOAD_FAILED, HttpStatus.BAD_REQUEST);
    }
    return file.filename;
  }

  static getImagePath(surveyId: string, questionId: string, fileName: string): string {
    return join(SURVEYS_IMAGES_PATH, surveyId, questionId, fileName);
  }

  static getImageUrl(file: Express.Multer.File, surveyId: string, questionId: string): string {
    const existingFileName = this.checkImageFile(file);
    return SurveysService.getImagePath(surveyId, questionId, existingFileName);
  }

  static serveImage(surveyId: string, questionId: string, fileName: string, res: Response): Response {
    const imagePath = SurveysService.getImagePath(surveyId, questionId, fileName);

    if (!existsSync(imagePath)) {
      throw new CustomHttpException(CommonErrorMessages.FILE_NOT_FOUND, HttpStatus.NOT_FOUND);
    }

    const fileStream = createReadStream(imagePath);
    fileStream.pipe(res);

    return res;
  }

  async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    const imageDirectories = surveyIds.map((surveyId) => join(SURVEYS_IMAGES_PATH, surveyId));
    const deletionPromises = imageDirectories.map((directory) => promises.rmdir(directory, { recursive: true }));

    try {
      await Promise.all(deletionPromises);
    } catch (error) {
      throw new CustomHttpException(surveyErrorMessages.ImageDeletionFailed, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default SurveysService;
