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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import prepareCreator from '@libs/survey/utils/prepareCreator';
import SseMessageType from '@libs/common/types/sseMessageType';
import getIsAdmin from '@libs/user/utils/getIsAdmin';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import GroupsService from '../groups/groups.service';
import surveysMigrationsList from './migrations/surveysMigrationsList';
import MigrationService from '../migration/migration.service';
import { Survey, SurveyDocument } from './survey.schema';
import SurveysAttachmentService from './surveys-attachment.service';
import NotificationsService from '../notifications/notifications.service';

@Injectable()
class SurveysService implements OnModuleInit {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private surveysAttachmentService: SurveysAttachmentService,
    private readonly groupsService: GroupsService,
    private readonly sseService: SseService,
    private readonly notificationService: NotificationsService,
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

      const action =
        eventType === SSE_MESSAGE_TYPE.SURVEY_CREATED
          ? SSE_MESSAGE_TYPE.SURVEY_CREATED
          : SSE_MESSAGE_TYPE.SURVEY_UPDATED;

      // TODO: #1152
      const actionName = action === SSE_MESSAGE_TYPE.SURVEY_CREATED ? 'erstellt' : 'aktualisiert';

      const title = `Umfrage ${survey.formula.title}: ${actionName}`;
      const body = `Die Umfrage "${survey.formula.title}" wurde soeben ${actionName}.`;

      await this.notificationService.notifyUsernames(invitedMembersList, {
        title,
        body,
        data: {
          surveyId: survey.id,
          type: eventType,
        },
      });
    }
  };

  static assertUserIsAuthorized = (creatorUsername: string, currentUser: JwtUser): void => {
    const isOwner = creatorUsername === currentUser.preferred_username;
    const isSuperAdmin = getIsAdmin(currentUser.ldapGroups);
    if (!isOwner && !isSuperAdmin) {
      throw new CustomHttpException(CommonErrorMessages.DB_ACCESS_FAILED, HttpStatus.UNAUTHORIZED);
    }
  };
}

export default SurveysService;
