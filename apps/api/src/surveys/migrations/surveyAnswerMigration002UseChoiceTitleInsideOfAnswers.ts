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

import { Types } from 'mongoose';
import { Logger } from '@nestjs/common';
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Migration } from '../../migration/migration.type';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '002-enforce-the-choice-title-usage-inside-of-survey-answers';

const updateSurveyQuestionAnswer = async (
  surveyAnswer: Record<string, string | string[] | object | object[]>,
  backendLimiters: { questionName: string; choices: ChoiceDto[] }[],
): Promise<Record<string, string | string[] | object | object[]>> => {
  const answer: Record<string, string | string[] | object | object[]> = { ...surveyAnswer };
  await Promise.all(
    Object.keys(surveyAnswer).map((questionId) => {
      const questionLimiter = backendLimiters.find((limiter) => limiter.questionName === questionId);
      const choices = questionLimiter?.choices ?? [];
      const choiceNames = choices.map((choice) => choice.name);
      const questionAnswer = surveyAnswer[questionId];
      if (Array.isArray(questionAnswer)) {
        answer[questionId] = questionAnswer.map((entry) => {
          if (typeof entry === 'string') {
            const isUsingName = choiceNames.includes(entry);
            if (isUsingName) {
              return choices.find((choice) => choice.name === entry)?.title || entry;
            }
          }
          // eslint-disable-next-line @typescript-eslint/no-unsafe-return
          return entry;
        });
      }
      if (typeof questionAnswer === 'string') {
        const isUsingName = choiceNames.includes(questionAnswer);
        if (isUsingName) {
          answer[questionId] = choices.find((choice) => choice.name === questionAnswer)?.title || questionAnswer;
        }
      }
      return answer;
    }),
  );
  return answer;
};

const surveyAnswerMigration002UseChoiceTitleInsideOfAnswers: Migration<SurveyAnswerDocument> = {
  name,
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 2;
    const newSchemaVersion = 3;

    const unprocessedDocuments = await model
      .find<SurveyAnswerDocument>({ schemaVersion: previousSchemaVersion })
      .populate('surveyId')
      .sort({ _id: 1 })
      .exec();

    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`Found ${unprocessedDocuments.length} documents to process...`);

    let processedCount = 0;

    await Promise.all(
      unprocessedDocuments.map(async (doc: SurveyAnswerDocument) => {
        // eslint-disable-next-line no-underscore-dangle
        const id = doc._id as string | Types.ObjectId;

        let currentId;
        if (id instanceof Types.ObjectId) {
          currentId = id;
        } else {
          currentId = new Types.ObjectId(id);
        }

        const { backendLimiters } = doc.surveyId as unknown as SurveyDto;

        const answer = doc.answer as unknown as Record<string, string | string[] | object | object[]>;

        if (!backendLimiters) {
          return;
        }
        try {
          const updatedAnswer = await updateSurveyQuestionAnswer(answer, backendLimiters);
          await model.updateOne(
            { _id: currentId },
            { $set: { answer: updatedAnswer, schemaVersion: newSchemaVersion } },
          );
          processedCount += 1;
        } catch (error) {
          Logger.error(`Failed to migrate document ${doc.id}:`, error);
        }
      }),
    );

    if (processedCount > 0) {
      Logger.log(`Migration ${name} completed: ${processedCount} documents migrated`);
    }
  },
};

export default surveyAnswerMigration002UseChoiceTitleInsideOfAnswers;
