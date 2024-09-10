import mongoose, { Model } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable } from '@nestjs/common';
import CustomHttpException from '@libs/error/CustomHttpException';
import SurveyStatus from '@libs/survey/survey-status-enum';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyAnswerErrorMessages from '@libs/survey/constants/survey-answer-error-messages';
import UserErrorMessages from '@libs/user/constants/user-error-messages';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import { Survey, SurveyDocument } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answer.schema';
import Attendee from '../conferences/attendee.schema';
import JWTUser from '../types/JWTUser';

@Injectable()
class SurveyAnswersService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(Survey.name) private surveyModel: Model<SurveyDocument>,
  ) {}

  public getSelectableChoices = async (surveyId: mongoose.Types.ObjectId, questionId: string): Promise<ChoiceDto[]> => {
    const survey = await this.surveyModel.findById(surveyId).exec();
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }

    const { backendLimiters } = survey;
    const limiter = backendLimiters?.find((limit) => limit.questionId === questionId);
    if (!limiter || !limiter.choices || limiter.choices.length === 0) {
      throw new CustomHttpException(SurveyErrorMessages.NoBackendLimiters, HttpStatus.NOT_FOUND);
    }
    const possibleChoices: ChoiceDto[] = limiter.choices;

    const choices: ChoiceDto[] = [];
    const promises: Promise<void>[] = possibleChoices.map(async (choice): Promise<void> => {
      const isVisible = (await this.countChoiceSelections(surveyId, questionId, choice.name)) < choice.limit;
      if (isVisible) {
        choices.push(choice);
      }
    });
    await Promise.all(promises);
    return choices;
  };

  async countChoiceSelections(
    surveyId: mongoose.Types.ObjectId,
    questionId: string,
    choiceId: string,
  ): Promise<number> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId }).exec();
    if (surveyAnswers.length === 0) {
      return 0;
    }
    let counter = 0;
    surveyAnswers.forEach((surveyAnswer) => {
      if (surveyAnswer.answer) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const answer = JSON.parse(JSON.stringify(surveyAnswer.answer));
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-assignment
        const questionAnswer = answer[questionId];
        if (questionAnswer === choiceId) {
          counter += 1;
        }
      }
    });
    return counter;
  }

  async getCreatedSurveys(username: string): Promise<Survey[]> {
    const createdSurveys = await this.surveyModel.find<Survey>({ 'creator.username': username }).exec();
    return createdSurveys || [];
  }

  public getOpenSurveys = async (username: string): Promise<Survey[]> => {
    const openSurveys = await this.surveyModel
      .find<Survey>({
        $and: [
          { 'invitedAttendees.username': username },
          {
            $or: [
              { $nor: [{ participatedAttendees: { $elemMatch: { username } } }] },
              { canSubmitMultipleAnswers: true },
            ],
          },
        ],
      })
      .exec();
    return openSurveys || [];
  };

  async getAnswers(username: string): Promise<SurveyAnswer[]> {
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ 'attendee.username': username }).exec();
    return surveyAnswers || [];
  }

  async getAnsweredSurveys(username: string): Promise<Survey[]> {
    const surveyAnswers = await this.getAnswers(username);
    const answeredSurveyIds = surveyAnswers.map((answer: SurveyAnswer) => answer.surveyId);
    const answeredSurveys = await this.surveyModel.find<Survey>({ _id: { $in: answeredSurveyIds } }).exec();
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
    user: JWTUser,
    answer: JSON,
  ): Promise<SurveyAnswer | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }

    const username = user.preferred_username;
    const attendee = { firstName: user.given_name, lastName: user.family_name, username };

    const survey = await this.surveyModel.findById<Survey>(surveyId).exec();
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }
    const { expires, canUpdateFormerAnswer, canSubmitMultipleAnswers } = survey;

    if (expires) {
      const isExpired = expires < new Date();
      if (isExpired) {
        throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
      }
    }

    const hasParticipated = survey.participatedAttendees.find(
      (participant: Attendee) => participant.username === username,
    );
    if (hasParticipated && !canSubmitMultipleAnswers && !canUpdateFormerAnswer) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorAlreadyParticipated, HttpStatus.FORBIDDEN);
    }

    const isCreator = survey.creator.username === username;
    const isAttendee = survey.invitedAttendees.find((participant: Attendee) => participant.username === username);
    const canParticipate = isCreator || isAttendee;
    if (!canParticipate) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
    }

    const idExistingUsersAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ $and: [{ 'attendee.username': username }, { surveyId }] })
      .exec();

    if (!idExistingUsersAnswer || canSubmitMultipleAnswers) {
      const time = new Date().getTime();
      const id = mongoose.Types.ObjectId.createFromTime(time);
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

      const updateSurvey = await this.surveyModel
        .findByIdAndUpdate<Survey>(surveyId, {
          participatedAttendees: [...survey.participatedAttendees, attendee],
          answers: [...survey.answers, newSurveyAnswer.id],
        })
        .exec();
      if (updateSurvey == null) {
        throw new CustomHttpException(UserErrorMessages.UpdateError, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return newSurveyAnswer;
    }

    const updatedSurveyAnswer = await this.surveyAnswerModel
      .findByIdAndUpdate<SurveyAnswer>(idExistingUsersAnswer, { answer, saveNo })
      .exec();
    if (updatedSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }

    return updatedSurveyAnswer;
  }

  async addAnswerToPublicSurvey(
    surveyId: mongoose.Types.ObjectId,
    saveNo: number,
    answer: JSON,
  ): Promise<SurveyAnswer | undefined> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }

    const survey = await this.surveyModel.findById<Survey>(surveyId).exec();
    if (!survey) {
      throw new CustomHttpException(SurveyErrorMessages.NotFoundError, HttpStatus.NOT_FOUND);
    }
    const { expires, isPublic } = survey;

    if (expires) {
      const isExpired = expires < new Date();
      if (isExpired) {
        throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorSurveyExpired, HttpStatus.UNAUTHORIZED);
      }
    }

    if (!isPublic) {
      throw new CustomHttpException(SurveyErrorMessages.ParticipationErrorUserNotAssigned, HttpStatus.UNAUTHORIZED);
    }

    const pseudoAttendee: Attendee = { username: `public-${surveyId.toString()}` };

    const time = new Date().getTime();
    const id = mongoose.Types.ObjectId.createFromTime(time);
    const newSurveyAnswer = await this.surveyAnswerModel.create({
      _id: id,
      id,
      attendee: pseudoAttendee,
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

    const updateSurvey = await this.surveyModel
      .findByIdAndUpdate<Survey>(surveyId, {
        answers: [...survey.answers, newSurveyAnswer.id],
      })
      .exec();
    if (updateSurvey == null) {
      throw new CustomHttpException(UserErrorMessages.UpdateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }

    return newSurveyAnswer;
  }

  async getPrivateAnswer(surveyId: mongoose.Types.ObjectId, username: string): Promise<SurveyAnswer> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }
    const usersSurveyAnswer = await this.surveyAnswerModel
      .findOne<SurveyAnswer>({ $and: [{ 'attendee.username': username }, { surveyId }] })
      .exec();

    if (usersSurveyAnswer == null) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return usersSurveyAnswer;
  }

  async getPublicAnswers(surveyId: mongoose.Types.ObjectId): Promise<JSON[] | null> {
    if (!mongoose.isValidObjectId(surveyId)) {
      throw new CustomHttpException(SurveyErrorMessages.IdTypeError, HttpStatus.NOT_ACCEPTABLE);
    }
    const surveyAnswers = await this.surveyAnswerModel.find<SurveyAnswer>({ surveyId }).exec();
    if (surveyAnswers.length === 0) {
      throw new CustomHttpException(SurveyAnswerErrorMessages.NotAbleToFindSurveyAnswerError, HttpStatus.NOT_FOUND);
    }
    return surveyAnswers.map((surveyAnswer: SurveyAnswer) => surveyAnswer.answer);
  }

  async onSurveyRemoval(surveyIds: mongoose.Types.ObjectId[]): Promise<void> {
    try {
      await this.surveyAnswerModel.deleteMany({ surveyId: { $in: surveyIds } }, { ordered: false }).exec();
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
