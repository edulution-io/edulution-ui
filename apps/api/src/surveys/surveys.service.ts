import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import CustomHttpException from '@libs/error/CustomHttpException';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import GroupWithMembers from '@libs/groups/types/groupWithMembers';
import { GROUPS_WITH_MEMBERS_CACHE_KEY } from '@libs/groups/constants/cacheKeys';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Group } from '@libs/groups/types/group';
import { Survey, SurveyDocument } from './survey.schema';
import type UserConnections from '../types/userConnections';
import SseService from '../sse/sse.service';

@Injectable()
class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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

  async findPublicSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ _id: surveyId, isPublic: true }).lean();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
  }

  async deleteSurveys(surveyIds: mongoose.Types.ObjectId[], surveysSseConnections: UserConnections): Promise<void> {
    try {
      await this.surveyModel.deleteMany({ _id: { $in: surveyIds } });
      Logger.log(`Deleted the surveys ${JSON.stringify(surveyIds)}`, SurveysService.name);
    } catch (error) {
      throw new CustomHttpException(SurveyErrorMessages.DeleteError, HttpStatus.NOT_MODIFIED, error);
    } finally {
      SseService.informAllUsers(surveysSseConnections, surveyIds.toString(), SSE_MESSAGE_TYPE.DELETED);
    }
  }

  async updateSurvey(survey: Survey, surveysSseConnections: UserConnections): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOneAndUpdate<Survey>({ id: { $eq: survey.id } }, { ...survey }).lean();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const updatedSurvey = await this.surveyModel.findOne({ id: survey.id }).lean();
      if (updatedSurvey != null) {
        if (!updatedSurvey.isPublic) {
          const invitedMembersList = await this.getInvitedMembers(survey);
          SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, survey, SSE_MESSAGE_TYPE.UPDATED);
        } else {
          SseService.informAllUsers(surveysSseConnections, survey, SSE_MESSAGE_TYPE.UPDATED);
        }
      }
    }
  }

  async createSurvey(survey: Survey, surveysSseConnections: UserConnections): Promise<Survey | null> {
    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const newSurvey = await this.surveyModel.findOne({ id: survey.id }).lean();
      if (newSurvey != null) {
        if (!survey.isPublic) {
          const invitedMembersList = await this.getInvitedMembers(survey);
          SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, survey, SSE_MESSAGE_TYPE.CREATED);
        } else {
          SseService.informAllUsers(surveysSseConnections, survey, SSE_MESSAGE_TYPE.CREATED);
        }
      }
    }
  }

  async updateOrCreateSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const { id, invitedGroups, creator, created = new Date(), saveNo = 0 } = surveyDto;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { label: _label, value: _value, ...creatorWithoutLabelValue } = creator;
    const updatingSurvey: Survey = {
      ...surveyDto,
      _id: id,
      created,
      saveNo,
      creator: creatorWithoutLabelValue,
      invitedGroups: invitedGroups as unknown as Group[],
    };

    const updatedSurvey = await this.updateSurvey(updatingSurvey, surveysSseConnections);
    if (updatedSurvey != null) {
      return updatedSurvey;
    }

    const newCreator = {
      ...creatorWithoutLabelValue,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };
    const creatingSurvey: Survey = {
      ...updatingSurvey,
      creator: newCreator,
    };

    const createdSurvey = await this.createSurvey(creatingSurvey, surveysSseConnections);
    if (createdSurvey != null) {
      return createdSurvey;
    }
    throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default SurveysService;
