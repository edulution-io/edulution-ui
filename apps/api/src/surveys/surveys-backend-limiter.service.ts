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
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyQuestionPanelTypes from '@libs/survey/constants/surveyQuestionPanelTypes';
import SHOW_OTHER_ITEM from '@libs/survey/constants/show-other-item';
import SSE_MESSAGE_TYPE from '@libs/common/constants/sseMessageType';
import CustomHttpException from '../common/CustomHttpException';
import SseService from '../sse/sse.service';
import SurveysService from './surveys.service';
import { Survey } from './survey.schema';
import { SurveysBackendLimiter, SurveysBackendLimiterDocument } from './surveys-backend-limiter.schema';

@Injectable()
class SurveysBackendLimiterService {
  constructor(
    @InjectModel(SurveysBackendLimiter.name) private surveysBackendLimiterModel: Model<SurveysBackendLimiterDocument>,
    private readonly surveyService: SurveysService,
    private readonly sseService: SseService,
  ) {}

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

  throwErrorIfTheUserHasNoPermissionToCreateOrUpdateTheBackendLimiters = (
    survey: Survey,
    questionName: string,
    _user?: JwtUser,
  ): void => {
    const isAllowed = this.canAddOwnChoicesToTheQuestion(survey, questionName);
    if (!isAllowed) {
      throw new CustomHttpException(
        SurveyErrorMessages.UpdateOrCreateError,
        HttpStatus.FORBIDDEN,
        undefined,
        SurveysBackendLimiterService.name,
      );
    }
  };

  async updateOrCreateSurveysBackendLimiters(
    surveyId: string,
    questionName: string,
    choices: ChoiceDto[],
  ): Promise<void> {
    const backendLimiter = await this.surveysBackendLimiterModel
      .findOneAndUpdate({ surveyId, questionName }, { choices }, { new: true, upsert: true })
      .exec();

    if (!backendLimiter) {
      throw new CustomHttpException(SurveyErrorMessages.UpdateOrCreateError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async appendChoicesToBackendLimiter(surveyId: string, questionName: string, choices: ChoiceDto[]): Promise<void> {
    const backendLimiter = await this.surveysBackendLimiterModel.findOne({ surveyId, questionName }).exec();

    if (!backendLimiter) {
      throw new CustomHttpException(
        SurveyErrorMessages.NotFoundError,
        HttpStatus.NOT_FOUND,
        undefined,
        SurveysBackendLimiterService.name,
      );
    }

    const existingChoices = backendLimiter.choices;
    const showOtherItemChoice = existingChoices.find((choice) => choice.name === SHOW_OTHER_ITEM);
    const otherItemLimit = showOtherItemChoice?.limit ?? 0;

    let hasNewChoices = false;
    choices.forEach((newChoice) => {
      const alreadyExists = existingChoices.some((existing) => existing.title === newChoice.title);
      if (!alreadyExists) {
        existingChoices.push({ ...newChoice, limit: otherItemLimit });
        hasNewChoices = true;
      }
    });

    if (hasNewChoices) {
      backendLimiter.choices = existingChoices;
      await backendLimiter.save();
      this.sseService.informAllUsers(surveyId, SSE_MESSAGE_TYPE.SURVEY_BACKEND_LIMITER_UPDATED);
    }
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
}

export default SurveysBackendLimiterService;
