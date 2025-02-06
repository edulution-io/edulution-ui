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
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import GroupRoles from '@libs/groups/types/group-roles.enum';
import AttendeeDto from '@libs/user/types/attendee.dto';
import SseService from '../sse/sse.service';
import type UserConnections from '../types/userConnections';
import { Survey, SurveyDocument } from './survey.schema';

@Injectable()
class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
        const invitedMembersList = await this.getInvitedMembers(survey);
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
        const invitedMembersList = await this.getInvitedMembers(survey);
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

  async getInvitedMembers(survey: SurveyDto | Survey): Promise<string[]> {
    const usersInGroups = await Promise.all(
      survey.invitedGroups.map(async (group) => {
        const groupWithMembers = await this.cacheManager.get<GroupWithMembers>(
          `${GROUPS_WITH_MEMBERS_CACHE_KEY}-${group.path}`,
        );

        return groupWithMembers?.members?.map((member) => member.username) || [];
      }),
    );

    return Array.from(
      new Set([...survey.invitedAttendees.map((attendee) => attendee.username), ...usersInGroups.flat()]),
    );
  }
}

export default SurveysService;
