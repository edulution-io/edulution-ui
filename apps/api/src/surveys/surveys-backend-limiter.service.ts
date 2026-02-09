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
import SurveyBackendLimiterDto from '@libs/survey/types/api/survey-backend-limiter.dto';
import CommonErrorMessages from '@libs/common/constants/common-error-messages';
import SurveyErrorMessages from '@libs/survey/constants/survey-error-messages';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyQuestionPanelTypes from '@libs/survey/constants/surveyQuestionPanelTypes';
import CustomHttpException from '../common/CustomHttpException';
import SurveysService from './surveys.service';
import { Survey } from './survey.schema';
import { SurveysBackendLimiter, SurveysBackendLimiterDocument } from './surveys-backend-limiter.schema';

@Injectable()
class SurveysBackendLimiterService {
  constructor(
    @InjectModel(SurveysBackendLimiter.name) private surveysBackendLimiterModel: Model<SurveysBackendLimiterDocument>,
    private readonly surveyService: SurveysService,
  ) {}

  async getBackendLimiter(surveyId: string, questionName: string): Promise<SurveysBackendLimiter | null> {
    try {
      const surveysBackendLimiter = await this.surveysBackendLimiterModel
        .findOne({ surveyId: new Types.ObjectId(surveyId), questionName })
        .exec();
      return surveysBackendLimiter;
    } catch (error) {
      throw new CustomHttpException(
        CommonErrorMessages.DB_ACCESS_FAILED,
        HttpStatus.INTERNAL_SERVER_ERROR,
        error instanceof Error ? error.message : undefined,
        SurveysBackendLimiterService.name,
      );
    }
  }

  async deleteBackendLimiter(surveyId: string, questionName: string): Promise<void> {
    try {
      await this.surveysBackendLimiterModel.deleteOne({ _id: new Types.ObjectId(surveyId), questionName });
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

  async removeBackendLimiterOnSurveyDeletion(surveyId: string): Promise<void> {
    try {
      await this.surveysBackendLimiterModel.deleteMany({ surveyId: new Types.ObjectId(surveyId) });
      Logger.log(`Deleted the backend limiters for survey ${surveyId}`, SurveysBackendLimiterService.name);
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
    user: JwtUser,
    questionName: string,
  ): Promise<void> => {
    if (isCreating) {
      // eslint-disable-next-line no-underscore-dangle
      await this.surveyService.throwErrorIfUserIsNotCreator(surveyId, user);
    } else {
      const survey = await this.surveyService.findSurvey(surveyId, user);
      if (!survey) {
        throw new CustomHttpException(
          SurveyErrorMessages.NotFoundError,
          HttpStatus.NOT_FOUND,
          undefined,
          SurveysBackendLimiterService.name,
        );
      }

      let isAllowedToUpdate = survey?.creator.username === user.preferred_username;
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
    user: JwtUser,
  ): Promise<void> {
    const isCreating = !surveysBackendLimiterDocument.id;

    await this.throwErrorIfTheUserHasNoPermissionToCreateOrUpdateTheBackendLimiters(
      isCreating,
      surveysBackendLimiterDocument.surveyId,
      user,
      surveysBackendLimiterDocument.questionName,
    );

    const limiterId = isCreating ? new Types.ObjectId().toString() : surveysBackendLimiterDocument.id;
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
  }
}

export default SurveysBackendLimiterService;
