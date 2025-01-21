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

  async updateSurvey(surveyDto: SurveyDto, surveysSseConnections: UserConnections): Promise<Survey | null> {
    try {
      return await this.surveyModel
        .findOneAndUpdate<Survey>(
          // eslint-disable-next-line no-underscore-dangle
          { id: { $eq: surveyDto.id } },
          { ...surveyDto },
        )
        .exec();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      if (!surveyDto.isPublic) {
        const invitedMembersList = await this.getInvitedMembers(surveyDto);
        SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, surveyDto, SSE_MESSAGE_TYPE.UPDATED);
      } else {
        SseService.informAllUsers(surveysSseConnections, surveyDto, SSE_MESSAGE_TYPE.UPDATED);
      }
    }
  }

  async createSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const creator = {
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    const newSurvey = {
      id: surveyDto.id,
      formula: surveyDto.formula,
      backendLimiters: surveyDto.backendLimiters,
      saveNo: surveyDto.saveNo || 0,
      creator,
      invitedAttendees: [...surveyDto.invitedAttendees, creator],
      invitedGroups: surveyDto.invitedGroups,
      participatedAttendees: [],
      answers: [],
      created: new Date(),
      expires: surveyDto.expires,
      isAnonymous: surveyDto.isAnonymous,
      isPublic: surveyDto.isPublic,
      canShowResultsTable: surveyDto.canShowResultsTable,
      canShowResultsChart: surveyDto.canShowResultsChart,
      canSubmitMultipleAnswers: surveyDto.canSubmitMultipleAnswers,
    };

    try {
      return await this.surveyModel.create(newSurvey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const survey = await this.surveyModel.findOne({ id: newSurvey.id }).lean();
      if (survey) {
        if (!survey.isPublic) {
          const invitedMembersList = await this.getInvitedMembers(surveyDto);
          SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, surveyDto, SSE_MESSAGE_TYPE.CREATED);
        } else {
          SseService.informAllUsers(surveysSseConnections, surveyDto, SSE_MESSAGE_TYPE.CREATED);
        }
      }
    }
  }

  async updateOrCreateSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const updatedSurvey = await this.updateSurvey(surveyDto, surveysSseConnections);
    if (updatedSurvey != null) {
      return updatedSurvey;
    }
    const createdSurvey = await this.createSurvey(surveyDto, currentUser, surveysSseConnections);
    if (createdSurvey != null) {
      return createdSurvey;
    }
    throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
  }
}

export default SurveysService;
