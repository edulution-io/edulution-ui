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
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import { Group } from '@libs/groups/types/group';
import getDefaultSurveyFormula from '@libs/survey/utils/getDefaultSurveyFormula';
import getNewSurveyId from '@libs/survey/utils/getNewSurveyId';
import { Survey, SurveyDocument } from './survey.schema';
import type UserConnections from '../types/userConnections';
import SseService from '../sse/sse.service';
import getInvitedMembers from './util/getInvitedMembers';

@Injectable()
class SurveysService {
  constructor(
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async findPublicSurvey(surveyId: mongoose.Types.ObjectId): Promise<Survey | null> {
    try {
      return await this.surveyModel.findOne<Survey>({ id: surveyId, isPublic: true }).lean();
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

  async updateSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const { id, creator, saveNo, invitedGroups } = surveyDto;

    let existingSurvey: Survey | null;
    try {
      existingSurvey = await this.surveyModel.findOne({ id }).exec();
      if (existingSurvey == null) {
        return null;
      }
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    }
    if (existingSurvey.creator.username !== currentUser.preferred_username) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.UNAUTHORIZED);
    }
    if (existingSurvey.saveNo !== saveNo) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.CONFLICT);
    }

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { label: _label, value: _value, ...creatorWithoutLabelValue } = creator;
    const survey: Partial<Survey> = {
      ...surveyDto,
      creator: creatorWithoutLabelValue,
      saveNo: saveNo + 1,
      invitedGroups: invitedGroups as unknown as Group[],
    };
    try {
      return await this.surveyModel
        .findOneAndUpdate<Survey>(
          {
            $and: [
              { id: { $eq: id } },
              { 'creator.username': { $eq: currentUser.preferred_username } },
              { saveNo: { $eq: saveNo } },
            ],
          },
          { ...survey },
        )
        .exec();
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const updatedSurvey = await this.surveyModel.findOne({ id: survey.id }).exec();
      if (updatedSurvey != null) {
        if (!updatedSurvey.isPublic) {
          const invitedMembersList = await getInvitedMembers(updatedSurvey, this.cacheManager);
          SseService.sendEventToUsers(
            invitedMembersList,
            surveysSseConnections,
            updatedSurvey,
            SSE_MESSAGE_TYPE.UPDATED,
          );
        } else {
          SseService.informAllUsers(surveysSseConnections, updatedSurvey, SSE_MESSAGE_TYPE.UPDATED);
        }
      }
    }
  }

  async createSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const {
      creator,
      invitedAttendees = [],
      invitedGroups = [],
      id = getNewSurveyId(),
      formula = getDefaultSurveyFormula(),
      saveNo = 0,
      created = new Date(),
    } = surveyDto;

    // eslint-disable-next-line @typescript-eslint/naming-convention
    const { label: _label, value: _value, ...creatorWithoutLabelValue } = creator;

    const newCreator = {
      ...creatorWithoutLabelValue,
      firstName: currentUser.given_name,
      lastName: currentUser.family_name,
      username: currentUser.preferred_username,
    };

    const survey: Survey = {
      ...surveyDto,
      _id: new mongoose.Types.ObjectId(id),
      id,
      formula,
      saveNo: saveNo + 1,
      created,
      creator: newCreator,
      invitedAttendees,
      invitedGroups: invitedGroups as unknown as Group[],
    };

    try {
      return await this.surveyModel.create(survey);
    } catch (error) {
      throw new CustomHttpException(CommonErrorMessages.DBAccessFailed, HttpStatus.INTERNAL_SERVER_ERROR, error);
    } finally {
      const newSurvey = await this.surveyModel.findOne({ id: survey.id }).exec();
      if (newSurvey != null) {
        if (!survey.isPublic) {
          const invitedMembersList = await getInvitedMembers(newSurvey, this.cacheManager);
          SseService.sendEventToUsers(invitedMembersList, surveysSseConnections, newSurvey, SSE_MESSAGE_TYPE.CREATED);
        } else {
          SseService.informAllUsers(surveysSseConnections, newSurvey, SSE_MESSAGE_TYPE.CREATED);
        }
      }
    }
  }

  async updateOrCreateSurvey(
    surveyDto: SurveyDto,
    currentUser: JWTUser,
    surveysSseConnections: UserConnections,
  ): Promise<Survey | null> {
    const updatedSurvey = await this.updateSurvey(surveyDto, currentUser, surveysSseConnections);
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
