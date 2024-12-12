import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import JWTUser from '@libs/user/types/jwt/jwtUser';
import getNewSurveyId from '@libs/survey/getNewSurveyId';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import throwErrorIfParticipationIsNotPossible from './utils/throwErrorIfParticipationIsNotPossible';

@Injectable()
class SurveyAnswersService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  public canUserParticipateSurvey = async (
    surveyId: string,
    username: string,
    isPublic?: boolean,
  ): Promise<boolean> => {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }

    const survey = await this.surveyModel.findById<Survey>(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    try {
      throwErrorIfParticipationIsNotPossible(survey, username, isPublic);
    } catch (error) {
      return false;
    }
    return true;
  };

  public getSelectableChoices = async (surveyId: string, questionId: string): Promise<ChoiceDto[]> => {
    const survey = await this.surveyModel.findById(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    const limiter = survey.backendLimiters?.find((limit) => limit.questionId === questionId);
    if (!limiter?.choices?.length) {
      throw new CustomHttpException(SurveyErrorMessages.NoBackendLimiters, HttpStatus.NOT_FOUND);
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
      surveyId,
      [`answer.${questionId}`]: choiceId,
    });
  }

  async getCreatedSurveys(username: string): Promise<Survey[]> {
    const createdSurveys = await this.surveyModel.find<Survey>({ 'creator.username': username });
    return createdSurveys || [];
  }

  async getOpenSurveys(username: string): Promise<Survey[]> {
    const currentDate = new Date();
    const openSurveys = await this.surveyModel.find<Survey>({
      $or: [
        {
          $and: [
            { isPublic: true },
            {
              $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
            },
          ],
        },
        {
          $and: [
            { 'invitedAttendees.username': username },
            {
              $or: [
                { $nor: [{ participatedAttendees: { $elemMatch: { username } } }] },
                { canSubmitMultipleAnswers: true },
              ],
            },
            {
              $or: [{ expires: { $eq: null } }, { expires: { $gt: currentDate } }],
            },
          ],
        },
      ],
    });
    return openSurveys;
  }

  async getAnswers(username: string): Promise<SurveyAnswer[]> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ 'attendee.username': username });
    return surveyAnswers || [];
  }

  async getAnsweredSurveys(username: string): Promise<Survey[]> {
    const surveyAnswers = await this.getAnswers(username);
    const answeredSurveyIds = surveyAnswers.map((answer: SurveyAnswer) => answer.surveyId);
    const answeredSurveys = await this.surveyModel.find<Survey>({ _id: { $in: answeredSurveyIds } });
    return answeredSurveys || [];
  }

  async findUserSurveys(status: SurveyStatus, username: string): Promise<Survey[] | null> {
    switch (status) {
      case SurveyStatus.OPEN:
        return this.getOpenSurveys(username);
      case SurveyStatus.ANSWERED:
        return this.getAnsweredSurveys(username);
      case SurveyStatus.CREATED:
        return this.getCreatedSurveys(username);
      default:
        return [];
    }
  }

  async addAnswer(
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
    isPublic?: boolean,
    user?: JWTUser,
  ): Promise<SurveyAnswer | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }

    const survey = await this.surveyModel.findById<Survey>(surveyId);
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    const username = user?.preferred_username;
    const attendee =
      user && !isPublic
        ? { firstName: user.given_name, lastName: user.family_name, username }
        : { username: `public-${surveyId.toString()}` };

    throwErrorIfParticipationIsNotPossible(survey, username, isPublic);
    if (!isPublic) {
      const idExistingUsersAnswer = await this.surveyAnswerModel.findOne<SurveyAnswer>({
        $and: [{ 'attendee.username': username }, { surveyId }],
      });
      if (idExistingUsersAnswer && !survey.canSubmitMultipleAnswers) {
        if (!survey.canUpdateFormerAnswer) {
          throw new CustomHttpException(
            SurveyErrorMessages.ParticipationErrorAlreadyParticipated,
            HttpStatus.FORBIDDEN,
          );
        }

        const updatedSurveyAnswer = await this.surveyAnswerModel.findByIdAndUpdate<SurveyAnswer>(
          idExistingUsersAnswer,
          {
            answer,
            saveNo,
          },
        );
        if (updatedSurveyAnswer == null) {
          throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
        }
        return updatedSurveyAnswer;
      }
    }

    const id = getNewSurveyId();
    const newSurveyAnswer = await this.surveyAnswerModel.create({
      _id: id,
      id,
      attendee,
      surveyId,
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
      participatedAttendees:
        attendee && !isPublic ? [...survey.participatedAttendees, attendee] : survey.participatedAttendees,
      answers: [...survey.answers, newSurveyAnswer.id],
    });
    if (updateSurvey == null) {
      throw new CustomHttpException(UserErrorMessages.UpdateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return newSurveyAnswer;
  }

  async getPrivateAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }
    const usersSurveyAnswer = await this.surveyAnswerModel.findOne<SurveyAnswer>({
      $and: [{ 'attendee.username': username }, { surveyId }],
    });

    if (usersSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return usersSurveyAnswer;
  }

  async getPublicAnswers(surveyId: string): Promise<JSON[] | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId });
    if (surveyAnswers.length === 0) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    const answers = surveyAnswers.filter((answer) => answer.answer !== null);
    return answers.map((answer) => answer.answer);
  }

  async onSurveyRemoval(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyAnswerModel.deleteMany({ surveyId: { $in: surveyIds } }, { ordered: false });
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
