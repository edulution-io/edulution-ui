import mongoose, { Model } from 'mongoose';
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
import { Survey, SurveyDocument } from './survey.schema';
import type UserConnections from '../types/userConnections';
import SseService from '../sse/sse.service';

@Injectable()
class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

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
      SseService.informAllUsers('deleted', surveysSseConnections);
    }
  }

  async updateSurvey(survey: Survey, surveysSseConnections: UserConnections): Promise<Survey | null> {
    try {
      return await this.surveyModel
        .findByIdAndUpdate<Survey>(
          // eslint-disable-next-line no-underscore-dangle
          survey._id,
          { ...survey },
        )
        .exec();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const invitedMembersList = await this.getInvitedMembers(survey);
      SseService.sendEventToUsers(invitedMembersList, 'updated', surveysSseConnections);
    }
  }

  async createSurvey(survey: Survey, surveysSseConnections: UserConnections): Promise<Survey | null> {
    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const invitedMembersList = await this.getInvitedMembers(survey);
      SseService.sendEventToUsers(invitedMembersList, 'created', surveysSseConnections);
    }
  }

  async updateOrCreateSurvey(survey: Survey, surveysSseConnections: UserConnections): Promise<Survey | null> {
    const updatedSurvey = await this.updateSurvey(survey, surveysSseConnections);
    if (updatedSurvey != null) {
      return updatedSurvey;
    }
    const createdSurvey = await this.createSurvey(survey, surveysSseConnections);
    if (createdSurvey != null) {
      return createdSurvey;
    }
    throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
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

    const invitedMembersList = Array.from(
      new Set([...survey.invitedAttendees.map((attendee) => attendee.username), ...usersInGroups.flat()]),
    );

    return invitedMembersList;
  }
}

export default SurveysService;
