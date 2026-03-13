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
import ChoiceDto from '@libs/survey/types/api/choice.dto';
import SurveyDto from '@libs/survey/types/api/survey.dto';
import { Migration } from '../../migration/migration.type';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '002-enforce-the-choice-title-usage-inside-of-survey-answers';

type AnswerValue = string | string[] | object | object[];
type AnswerRecord = Record<string, AnswerValue>;

const applyChoiceTitle = (value: unknown, nameToTitle: Map<string, string>): unknown => {
  if (typeof value === 'string') return nameToTitle.get(value) ?? value;
  return value;
};

const updateSurveyQuestionAnswer = (
  surveyAnswer: AnswerRecord,
  backendLimiters: { questionName: string; choices: ChoiceDto[] }[],
): AnswerRecord => {
  const limiterMap = new Map<string, Map<string, string>>();

  backendLimiters.forEach((limiter) => {
    const nameToTitle = new Map(limiter.choices.map((c) => [c.name, c.title]));
    limiterMap.set(limiter.questionName, nameToTitle);
  });

  const result: AnswerRecord = { ...surveyAnswer };

  Object.keys(surveyAnswer).forEach((questionId) => {
    const nameToTitle = limiterMap.get(questionId);
    if (!nameToTitle) return;

    const questionAnswer = surveyAnswer[questionId];
    if (Array.isArray(questionAnswer)) {
      result[questionId] = questionAnswer.map((entry) => applyChoiceTitle(entry, nameToTitle)) as AnswerValue;
      return;
    }
    if (typeof questionAnswer === 'string') {
      result[questionId] = nameToTitle.get(questionAnswer) ?? questionAnswer;
    }
  });
  return result;
};

const surveyAnswerMigration002UseChoiceTitleInsideOfAnswers: Migration<SurveyAnswerDocument> = {
  name,
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 2;
    const newSchemaVersion = 3;

    const cursor = model
      .find<SurveyAnswerDocument>({ schemaVersion: previousSchemaVersion })
      .populate({ path: 'surveyId', select: 'backendLimiters' })
      .sort({ _id: 1 })
      .cursor();

    let counter = 0;
    let ops: AnyBulkWriteOperation[] = [];
    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of cursor) {
      let skipAnswerUpdate = false;
      if (!doc.surveyId) {
        // eslint-disable-next-line no-underscore-dangle
        Logger.warn(`Survey answer with id ${String(doc._id)} is missing the SurveyId.`, name);
        skipAnswerUpdate = true;
      }

      const { backendLimiters } = (doc.surveyId as unknown as SurveyDto) ?? {};
      const foundNoBackendLimiters = !backendLimiters || backendLimiters.length === 0;
      if (!skipAnswerUpdate && foundNoBackendLimiters) {
        skipAnswerUpdate = true;
      }

      const answer = doc.answer as AnswerRecord;
      const foundNoAnswer = !answer || Object.keys(answer).length === 0;
      if (!skipAnswerUpdate && foundNoAnswer) {
        // eslint-disable-next-line no-underscore-dangle
        Logger.warn(`Survey answer with id ${String(doc._id)} is missing the answer object.`, name);
        skipAnswerUpdate = true;
      }

      if (skipAnswerUpdate) {
        ops.push({
          updateOne: {
            // eslint-disable-next-line no-underscore-dangle
            filter: { _id: doc._id },
            update: { $set: { schemaVersion: newSchemaVersion } },
          },
        });
      } else {
        const updatedAnswer = updateSurveyQuestionAnswer(answer, backendLimiters!);
        ops.push({
          updateOne: {
            // eslint-disable-next-line no-underscore-dangle
            filter: { _id: doc._id },
            update: { $set: { answer: updatedAnswer, schemaVersion: newSchemaVersion } },
          },
        });
      }

      if (ops.length >= 500) {
        await model.bulkWrite(ops, { ordered: false });
        ops = [];
        counter += 500;
      }
    }

    if (ops.length > 0) {
      await model.bulkWrite(ops, { ordered: false });
      counter += ops.length;
    }

    if (counter > 0) {
      Logger.log(`Migration ${name} completed: ${counter} documents migrated`);
    }
  },
};

export default surveyAnswerMigration002UseChoiceTitleInsideOfAnswers;
