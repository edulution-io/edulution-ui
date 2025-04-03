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
import { v4 as uuidv4 } from 'uuid';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import SurveyStatus from '@libs/survey/survey-status-enum';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import publicUserIdRegex from '@libs/survey/utils/publicUserIdRegex';
import createValidPublicUserId from '@libs/survey/utils/createValidPublicUserId';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import Attendee from '../conferences/attendee.schema';
import MigrationService from '../migration/migration.service';
import surveyAnswersMigrationsList from './migrations/surveyAnswersMigrationsList';
import GroupsService from '../groups/groups.service';

@Injectable()
class SurveyAnswersService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
    private readonly groupsService: GroupsService,
  ) {}

  async onModuleInit() {
    await MigrationService.runMigrations<SurveyAnswerDocument>(this.surveyAnswerModel, surveyAnswersMigrationsList);
  }

  public canUserParticipateSurvey = async (surveyId: string, username: string): Promise<boolean> => {
    const survey = await this.surveyModel.findById<Survey>(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    try {
      await this.throwErrorIfParticipationIsNotPossible(survey, username);
    } catch (error) {
      return false;
    }
    return true;
  };

  public hasAlreadySubmittedSurveyAnswers = async (surveyId: string): Promise<boolean> => {
    const answers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId: new Types.ObjectId(surveyId) });
    return answers.length !== 0;
  };

  public getSelectableChoices = async (surveyId: string, questionId: string): Promise<ChoiceDto[]> => {
    const survey = await this.surveyModel.findById(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    const limiter = survey.backendLimiters?.find((limit) => limit.questionId === questionId);
    if (!limiter?.choices?.length) {
      throw new CustomHttpException(SurveyErrorMessages.NoBackendLimiters, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    const possibleChoices = limiter.choices;

    const filteredChoices = await Promise.all(
      possibleChoices.map(async (choice) => {
        const isVisible = (await this.countChoiceSelections(surveyId, questionId, choice.name)) < choice.limit;
        return isVisible ? choice : null;
      }),
    );

    return filteredChoices.filter((choice) => choice !== null);
  };

  async countChoiceSelections(surveyId: string, questionId: string, choiceId: string): Promise<number> {
    return this.surveyAnswerModel.countDocuments({
      surveyId: new Types.ObjectId(surveyId),
      [`answer.${questionId}`]: choiceId,
    });
  }

  async getCreatedSurveys(username: string): Promise<Survey[]> {
    const createdSurveys = await this.surveyModel.find<Survey>({ 'creator.username': username });
    return createdSurveys || [];
  }

  async getOpenSurveys(user: JwtUser, currentDate: Date = new Date()): Promise<Survey[]> {
    const query = {
      $or: [
        {
          $and: [
            { isPublic: true },
            {
              $or: [
                { $nor: [{ participatedAttendees: { $elemMatch: { username: user.preferred_username } } }] },
                { canSubmitMultipleAnswers: true },
              ],
            },
            {
              $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
            },
          ],
        },
        {
          $and: [
            {
              $or: [
                { 'invitedAttendees.username': user.preferred_username },
                { 'invitedGroups.path': { $in: user.ldapGroups } },
              ],
            },
            {
              $or: [
                { $nor: [{ participatedAttendees: { $elemMatch: { username: user.preferred_username } } }] },
                { canSubmitMultipleAnswers: true },
              ],
            },
            {
              $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
            },
          ],
        },
      ],
    };
    return this.surveyModel.find<Survey>(query);
  }

  async getAnsweredSurveys(username: string): Promise<Survey[]> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ 'attendee.username': username });
    const answeredSurveyIds = surveyAnswers.map((answer: SurveyAnswer) => new Types.ObjectId(answer.surveyId));
    const answeredSurveys = await this.surveyModel.find<Survey>({ _id: { $in: answeredSurveyIds } });
    return answeredSurveys || [];
  }

  async findUserSurveys(status: SurveyStatus, user: JwtUser): Promise<Survey[] | null> {
    switch (status) {
      case SurveyStatus.OPEN:
        return this.getOpenSurveys(user);
      case SurveyStatus.ANSWERED:
        return this.getAnsweredSurveys(user.preferred_username);
      case SurveyStatus.CREATED:
        return this.getCreatedSurveys(user.preferred_username);
      default:
        return [];
    }
  }

  throwErrorIfParticipationIsNotPossible = async (survey: Survey, username?: string): Promise<void> => {
    const {
      expires = false,
      canSubmitMultipleAnswers = false,
      canUpdateFormerAnswer = false,
      isPublic = false,
      participatedAttendees = [],
      creator,
    } = survey;

    if (expires && expires < new Date()) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
    }

    if (!username) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
    }

    const hasParticipated = participatedAttendees.find((participant: Attendee) => participant.username === username);
    if (hasParticipated && !canSubmitMultipleAnswers && !canUpdateFormerAnswer) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorAlreadyParticipated, HttpStatus.FORBIDDEN);
    }

    if (isPublic) {
      return;
    }

    const isCreator = creator?.username === username;
    const invitedMembers = await this.groupsService.getInvitedMembers(survey.invitedGroups, survey.invitedAttendees);

    const isAttendee = invitedMembers.includes(username);

    const canParticipate = isCreator || isAttendee;
    if (!canParticipate) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
    }
  };

  async createAnswer(
    attendee: Attendee,
    surveyId: string,
    saveNo: number,
    answer: JSON,
  ): Promise<SurveyAnswerDocument> {
    const newSurveyAnswer: SurveyAnswerDocument | null = await this.surveyAnswerModel.create({
      attendee,
      surveyId: new Types.ObjectId(surveyId),
      saveNo,
      answer,
    });
    if (newSurveyAnswer == null) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
    return newSurveyAnswer;
  }

  async addAnswer(
    surveyId: string,
    saveNo: number,
    answer: JSON,
    attendee: Attendee,
  ): Promise<SurveyAnswer | undefined> {
    const survey = await this.surveyModel.findById<Survey>(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    const {
      isPublic = false,
      isAnonymous = false,
      canSubmitMultipleAnswers = false,
      canUpdateFormerAnswer = false,
    } = survey;

    if (isAnonymous) {
      return this.createAnswer({ username: 'anonymous' }, surveyId, saveNo, answer);
    }

    const { username, firstName, lastName } = attendee;
    const isUnauthenticatedUser = isPublic && !firstName && !lastName;
    const isAnswerFromAuthenticatedUser = publicUserIdRegex.test(username) || !isUnauthenticatedUser;
    if (isAnswerFromAuthenticatedUser) {
      await this.throwErrorIfParticipationIsNotPossible(survey, username);

      const existingUsersAnswer = await this.surveyAnswerModel.findOne<SurveyAnswer>({
        $and: [{ 'attendee.username': username }, { surveyId: new Types.ObjectId(surveyId) }],
      });

      if (existingUsersAnswer == null || canSubmitMultipleAnswers) {
        const newSurveyAnswer = await this.surveyAnswerModel.create({
          attendee,
          surveyId: new Types.ObjectId(surveyId),
          saveNo,
          answer,
        });

        if (newSurveyAnswer == null) {
          throw new CustomHttpException(
            SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
            HttpStatus.INTERNAL_SERVER_ERROR,
          );
        }

        const updateSurvey = await this.surveyModel.findByIdAndUpdate<Survey>(surveyId, {
          participatedAttendees: username
            ? [...survey.participatedAttendees, { username }]
            : survey.participatedAttendees,
          answers: [...survey.answers, new Types.ObjectId(String(newSurveyAnswer.id))],
        });
        if (updateSurvey == null) {
          throw new CustomHttpException(UserErrorMessages.UpdateError, HttpStatus.INTERNAL_SERVER_ERROR);
        }

        return newSurveyAnswer;
      }

      if (!canUpdateFormerAnswer) {
        throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorAlreadyParticipated, HttpStatus.FORBIDDEN);
      }

      const updatedSurveyAnswer = await this.surveyAnswerModel.findByIdAndUpdate<SurveyAnswer>(existingUsersAnswer, {
        answer,
        saveNo,
      });
      if (updatedSurveyAnswer == null) {
        throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
      }
      return updatedSurveyAnswer;
    }

    let publicUserId = username;
    if (canSubmitMultipleAnswers || canUpdateFormerAnswer) {
      publicUserId = createValidPublicUserId(username, uuidv4());
    }
    const createdAnswer: SurveyAnswerDocument | null = await this.createAnswer(
      { username: publicUserId },
      surveyId,
      saveNo,
      answer,
    );
    if (createdAnswer == null) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToCreateSurveyAnswerError,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createdAnswer;
  }

  async getAnswer(surveyId: string, username: string): Promise<SurveyAnswer> {
    const usersSurveyAnswer = await this.surveyAnswerModel.findOne<SurveyAnswer>({
      $and: [{ 'attendee.username': username }, { surveyId: new Types.ObjectId(surveyId) }],
    });

    if (usersSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return usersSurveyAnswer;
  }

  async getAnswerPublicParticipation(surveyId: string, username: string): Promise<SurveyAnswer> {
    if (!publicUserIdRegex.test(username)) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return this.getAnswer(surveyId, username);
  }

  async getPublicAnswers(surveyId: string): Promise<JSON[] | null> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId: new Types.ObjectId(surveyId) });
    if (surveyAnswers.length === 0) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    const answers = surveyAnswers.filter((answer) => answer.answer != null);
    return answers.map((answer) => {
      let identification = answer.attendee.username;
      if (!publicUserIdRegex.test(identification)) {
        identification = `${answer.attendee?.firstName} ${answer.attendee?.lastName}`;
      }
      return { identification, ...answer.answer };
    });
  }

  async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    try {
      const surveyObjectIds = surveyIds.map((s) => new Types.ObjectId(s));
      await this.surveyAnswerModel.deleteMany({ surveyId: { $in: surveyObjectIds } }, { ordered: false });
    } catch (error) {
      throw new CustomHttpException(
        SurveyAnswerErrorMessages.NotAbleToDeleteSurveyAnswerError,
        HttpStatus.NOT_MODIFIED,
        error,
      );
    }
  }
}

export default SurveyAnswersService;
