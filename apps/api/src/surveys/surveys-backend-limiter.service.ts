/*
 * Copyright (C) [2025] [Netzint GmbH]
 * All rights reserved.
 *
 * This software is dual-licensed under the terms of:
 *
 * 1. The GNU Affero General Public License (AGPL-3.0-or-later), as published by the Free Software Foundation.
 *    You may use, modify and distribute this software under the terms of the AGPL, provided that you comply with its conditions.
 *
 *    A copy of the license can be found at: https://www.gnu.org/licenses/agpl-3.0.html
 *
 * OR
 *
 * 2. A commercial license agreement with Netzint GmbH. Licensees holding a valid commercial license from Netzint GmbH
 *    may use this software in accordance with the terms contained in such written agreement, without the obligations imposed by the AGPL.
 *
 * If you are uncertain which license applies to your use case, please contact us at info@netzint.de for clarification.
 */

import { Model, Types } from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import JwtUser from '@libs/user/types/jwt/jwtUser';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import TSurveyQuestionAnswerTypes from '@libs/survey/types/TSurveyQuestionAnswerTypes';
import SurveyBackendLimiterDto from '@libs/survey/types/api/survey-backend-limiter.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyQuestionPanelTypes from '@libs/survey/constants/surveyQuestionPanelTypes';
import CustomHttpException from '../common/CustomHttpException';
import SurveysService from './surveys.service';
import { Survey } from './survey.schema';
import { SurveyAnswer, SurveyAnswerDocument } from './survey-answers.schema';
import { SurveysBackendLimiter, SurveysBackendLimiterDocument } from './surveys-backend-limiter.schema';

@Injectable()
class SurveysBackendLimiterService {
  constructor(
    @InjectModel(SurveyAnswer.name) private surveyAnswerModel: Model<SurveyAnswerDocument>,
    @InjectModel(SurveysBackendLimiter.name) private surveysBackendLimiterModel: Model<SurveysBackendLimiterDocument>,
    private readonly surveyService: SurveysService,
  ) {}

  public getSelectableChoices = async (
    surveyId: string,
    questionName: string,
    returnOriginal: boolean = false,
  ): Promise<ChoiceDto[]> => {
    const surveysBackendLimiter = await this.surveysBackendLimiterModel
      .findOne({ surveyId: new Types.ObjectId(surveyId), questionName })
      .exec();

    if (!surveysBackendLimiter) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysBackendLimiterService.name,
      );
    }

    if (!surveysBackendLimiter?.choices?.length) {
      throw new CustomHttpException(
        SurveyErrorMessages.NoBackendLimiters,
        HttpStatus.INTERNAL_SERVER_ERROR,
        undefined,
        SurveysBackendLimiterService.name,
      );
    }

    const possibleChoices = surveysBackendLimiter.choices;
    if (returnOriginal) {
      possibleChoices.sort((a, b) => a.title.localeCompare(b.title));
      return possibleChoices;
    }

    const filteredChoices: ChoiceDto[] = [];
    await Promise.all(
      possibleChoices.map(async (choice) => {
        const counter = await this.countTotalChoiceSelectionsInSurveyAnswers(surveyId, questionName, choice.title);
        if (choice.limit === 0 || !counter || counter < choice.limit) {
          filteredChoices.push(choice);
        }
      }),
    );

    filteredChoices.sort((a, b) => a.title.localeCompare(b.title));

    return filteredChoices;
  };

  static countChoiceMatchesInValue = (questionAnswer: TSurveyQuestionAnswerTypes, choiceTitle: string): number => {
    if (Array.isArray(questionAnswer)) {
      let count = 0;
      questionAnswer.forEach((answerValue) => {
        if (typeof answerValue === 'string' && answerValue === choiceTitle) {
          count += 1;
        } else if (typeof answerValue === 'object' && answerValue !== null && answerValue.name === choiceTitle) {
          count += 1;
        }
      });
      return count;
    }
    if (typeof questionAnswer === 'string' && questionAnswer === choiceTitle) {
      return 1;
    }
    if (typeof questionAnswer === 'object' && questionAnswer !== null && questionAnswer.name === choiceTitle) {
      return 1;
    }
    return 0;
  };

  static countChoiceMatchesInAnswer = (answer: TSurveyAnswer, questionName: string, choiceTitle: string): number => {
    let count = 0;
    Object.keys(answer).forEach((key) => {
      if (key === questionName) {
        const nestedCount = SurveysBackendLimiterService.countChoiceMatchesInValue(answer[key], choiceTitle);
        count += nestedCount;
      } else if (Array.isArray(answer[key])) {
        answer[key].forEach((entry) => {
          if (typeof entry === 'object' && entry !== null) {
            const nestedCount = SurveysBackendLimiterService.countChoiceMatchesInAnswer(
              entry as TSurveyAnswer,
              questionName,
              choiceTitle,
            );
            count += nestedCount;
          }
        });
      } else if (typeof answer[key] === 'object' && answer[key] !== null) {
        const nestedCount = SurveysBackendLimiterService.countChoiceMatchesInAnswer(
          answer[key] as TSurveyAnswer,
          questionName,
          choiceTitle,
        );
        count += nestedCount;
      }
    });
    return count;
  };

  async countTotalChoiceSelectionsInSurveyAnswers(
    surveyId: string,
    questionName: string,
    choiceTitle: string,
  ): Promise<number> {
    const documents = await this.surveyAnswerModel
      .find<SurveyAnswerDocument>({ surveyId: new Types.ObjectId(surveyId) })
      .exec();
    let count = 0;
    documents.forEach((document) => {
      const answerCount = SurveysBackendLimiterService.countChoiceMatchesInAnswer(
        document.answer as unknown as TSurveyAnswer,
        questionName,
        choiceTitle,
      );
      count += answerCount;
    });
    return count;
  }

  async deleteBackendLimiter(surveyId: string, questionName: string): Promise<void> {
    try {
      await this.surveysBackendLimiterModel.deleteOne({ surveyId: new Types.ObjectId(surveyId), questionName });
      Logger.log(
        `Deleted the backend limiter for survey ${surveyId} and question ${questionName}`,
        SurveysBackendLimiterService.name,
      );
    } catch (error) {
      throw new CustomHttpException(
        SurveyErrorMessages.DeleteError,
        HttpStatus.NOT_MODIFIED,
        error,
        SurveysBackendLimiterService.name,
      );
    }
  }

  async onSurveyRemoval(surveyIds: string[]): Promise<void> {
    const objectIds = surveyIds.map((id) => new Types.ObjectId(id));
    try {
      await this.surveysBackendLimiterModel.deleteMany({ surveyId: { $in: objectIds } });
      Logger.log(
        `Deleted the backend limiters for survey ${JSON.stringify(surveyIds)}`,
        SurveysBackendLimiterService.name,
      );
    } catch (error) {
      throw new CustomHttpException(
        SurveyErrorMessages.DeleteError,
        HttpStatus.NOT_MODIFIED,
        error,
        SurveysBackendLimiterService.name,
      );
    }
  }

  async copyBackendLimitersToNewSurvey(newSurveyId: string, templateSurveyId: string): Promise<void> {
    try {
      const templateLimiters = await this.surveysBackendLimiterModel
        .find({ surveyId: new Types.ObjectId(templateSurveyId) })
        .lean();
      const newLimiters = templateLimiters.map((limiter) => ({
        ...limiter,
        _id: new Types.ObjectId(),
        surveyId: new Types.ObjectId(newSurveyId),
      }));
      await this.surveysBackendLimiterModel.insertMany(newLimiters);
      Logger.log(
        `Copied ${newLimiters.length} backend limiters from survey ${templateSurveyId} to new survey ${newSurveyId}`,
        SurveysBackendLimiterService.name,
      );
    } catch (error) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : undefined,
        SurveysBackendLimiterService.name,
      );
    }
  }

  getQuestionFromElementList(elements: TSurveyElement[], questionName: string): TSurveyElement | undefined {
    let question = elements.find((element) => element.name === questionName);
    if (question) {
      return question;
    }
    elements.forEach((element) => {
      if (question) {
        return;
      }
      if (element.type === SurveyQuestionPanelTypes.PANEL && element.elements) {
        const questionFoundInPanel = this.getQuestionFromElementList(element.elements, questionName);
        if (questionFoundInPanel) {
          question = questionFoundInPanel;
        }
      }
      if (element.type === SurveyQuestionPanelTypes.DYNAMIC_PANEL && element.templateElements) {
        const questionFoundInPanelDynamic = this.getQuestionFromElementList(element.templateElements, questionName);
        if (questionFoundInPanelDynamic) {
          question = questionFoundInPanelDynamic;
        }
      }
    });
    return question;
  }

  getQuestionFromFormula(formula: SurveyFormula, questionName: string): TSurveyElement | undefined {
    if (formula.elements) {
      return this.getQuestionFromElementList(formula.elements, questionName);
    }
    let question: TSurveyElement | undefined;
    if (formula.pages) {
      formula.pages.forEach((page) => {
        if (question || !page.elements) {
          return;
        }
        const questionFoundInPage = this.getQuestionFromElementList(page.elements, questionName);
        if (questionFoundInPage) {
          question = questionFoundInPage;
        }
      });
    }
    return question;
  }

  canAddOwnChoicesToTheQuestion = (survey: Survey, questionName: string): boolean => {
    const question = this.getQuestionFromFormula(survey.formula, questionName);
    if (!question) {
      return false;
    }
    return question.showOtherItem ?? false;
  };

  throwErrorIfTheUserHasNoPermissionToCreateOrUpdateTheBackendLimiters = async (
    isCreating: boolean,
    surveyId: string,
    questionName: string,
    user?: JwtUser,
  ): Promise<void> => {
    if (isCreating && user) {
      // eslint-disable-next-line no-underscore-dangle
      await this.surveyService.throwErrorIfUserIsNotCreator(surveyId, user);
    } else {
      let survey: Survey | null = null;
      if (!user) {
        survey = await this.surveyService.findPublicSurvey(surveyId);
      } else {
        survey = await this.surveyService.findSurvey(surveyId, user);
      }
      if (!survey) {
        throw new CustomHttpException(
          SurveyErrorMessages.NotFoundError,
          HttpStatus.NOT_FOUND,
          undefined,
          SurveysBackendLimiterService.name,
        );
      }

      let isAllowedToUpdate = survey?.creator.username === user?.preferred_username;
      if (!isAllowedToUpdate) {
        isAllowedToUpdate = this.canAddOwnChoicesToTheQuestion(survey, questionName);
      }
      if (!isAllowedToUpdate) {
        throw new CustomHttpException(
          CommonErrorMessages.DB_ACCESS_FAILED,
          HttpStatus.NOT_MODIFIED,
          undefined,
          SurveysBackendLimiterService.name,
        );
      }
    }
  };

  async updateOrCreateSurveysBackendLimiters(
    surveysBackendLimiterDocument: SurveyBackendLimiterDto,
    user?: JwtUser,
  ): Promise<void> {
    const { id, surveyId, questionName } = surveysBackendLimiterDocument;
    const isCreating = !id;

    await this.throwErrorIfTheUserHasNoPermissionToCreateOrUpdateTheBackendLimiters(
      isCreating,
      surveyId,
      questionName,
      user,
    );

    const limiterId = isCreating ? new Types.ObjectId().toString() : id;
    if (!limiterId) {
      throw new CustomHttpException(
        SurveyErrorMessages.MISSING_ID_ERROR,
        HttpStatus.BAD_REQUEST,
        undefined,
        SurveysBackendLimiterService.name,
      );
    }

    if (!isCreating) {
      const existingBackendLimiterSurvey = await this.surveysBackendLimiterModel.findById(limiterId).lean();
      if (!existingBackendLimiterSurvey) {
        throw new CustomHttpException(
          CommonErrorMessages.DB_ACCESS_FAILED,
          HttpStatus.NOT_FOUND,
          undefined,
          SurveysBackendLimiterService.name,
        );
      }
    }

    const backendLimiter = await this.surveysBackendLimiterModel
      .findByIdAndUpdate(limiterId, surveysBackendLimiterDocument, { new: true, upsert: true })
      .exec();
    if (!backendLimiter) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}

export default SurveysBackendLimiterService;
