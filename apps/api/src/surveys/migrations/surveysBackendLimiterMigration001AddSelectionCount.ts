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

import { AnyBulkWriteOperation } from 'mongoose';
import { Logger } from '@nestjs/common';
import TSurveyAnswer from '@libs/survey/types/TSurveyAnswer';
import TSurveyQuestionAnswerTypes from '@libs/survey/types/TSurveyQuestionAnswerTypes';
import SURVEYJS_COMMENT_SUFFIX from '@libs/survey/constants/surveyjs-comment-suffix';
import { Migration } from '../../migration/migration.type';
import { SurveysBackendLimiterDocument } from '../surveys-backend-limiter.schema';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '001-add-selection-count-to-backend-limiter-choices';

const countMatchesInValue = (questionAnswer: TSurveyQuestionAnswerTypes, choiceTitle: string): number => {
  if (Array.isArray(questionAnswer)) {
    let count = 0;
    questionAnswer.forEach((val) => {
      if (typeof val === 'string' && val === choiceTitle) count += 1;
      else if (typeof val === 'object' && val !== null && (val as { name?: string }).name === choiceTitle) count += 1;
    });
    return count;
  }
  if (typeof questionAnswer === 'string' && questionAnswer === choiceTitle) return 1;
  if (
    typeof questionAnswer === 'object' &&
    questionAnswer !== null &&
    (questionAnswer as { name?: string }).name === choiceTitle
  )
    return 1;
  return 0;
};

const countMatchesInAnswer = (answer: TSurveyAnswer, questionName: string, choiceTitle: string): number => {
  let count = 0;
  Object.keys(answer).forEach((key) => {
    if (key === questionName) {
      count += countMatchesInValue(answer[key], choiceTitle);
    } else if (Array.isArray(answer[key])) {
      (answer[key] as TSurveyAnswer[]).forEach((entry) => {
        if (typeof entry === 'object' && entry !== null) {
          count += countMatchesInAnswer(entry, questionName, choiceTitle);
        }
      });
    } else if (typeof answer[key] === 'object' && answer[key] !== null) {
      count += countMatchesInAnswer(answer[key] as TSurveyAnswer, questionName, choiceTitle);
    }
  });
  return count;
};

const surveysBackendLimiterMigration001AddSelectionCount: Migration<SurveysBackendLimiterDocument> = {
  name,
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 1;
    const newSchemaVersion = 2;

    const docs = await model.find<SurveysBackendLimiterDocument>({ schemaVersion: previousSchemaVersion }).exec();

    if (docs.length === 0) {
      return;
    }

    Logger.log(`Found ${docs.length} documents to process...`, name);

    const SurveyAnswerModel = model.db.model<SurveyAnswerDocument>('SurveyAnswer');
    const updateOperations: AnyBulkWriteOperation[] = [];

    await Promise.all(
      docs.map(async (doc) => {
        try {
          const answers = await SurveyAnswerModel.find<SurveyAnswerDocument>({ surveyId: doc.surveyId }).exec();

          const updatedChoices = doc.choices.map((choice) => {
            let selectionCount = 0;
            answers.forEach((answerDoc) => {
              const answer = answerDoc.answer as unknown as TSurveyAnswer;
              selectionCount += countMatchesInAnswer(answer, doc.questionName, choice.title);
              if (choice.isCustomUserEntry) {
                selectionCount += countMatchesInAnswer(
                  answer,
                  `${doc.questionName}${SURVEYJS_COMMENT_SUFFIX}`,
                  choice.title,
                );
              }
            });
            return { ...choice, selectionCount };
          });

          updateOperations.push({
            updateOne: {
              // eslint-disable-next-line no-underscore-dangle
              filter: { _id: doc._id },
              update: { $set: { choices: updatedChoices, schemaVersion: newSchemaVersion } },
            },
          });
        } catch (error) {
          Logger.error(`Failed to migrate document ${doc.id}:`, error, name);
        }
      }),
    );

    if (updateOperations.length > 0) {
      await model.bulkWrite(updateOperations, { ordered: false });
      Logger.log(`Migration ${name} completed: ${updateOperations.length} documents migrated`, name);
    }
  },
};

export default surveysBackendLimiterMigration001AddSelectionCount;
