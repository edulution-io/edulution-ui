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
import SurveyDto from '@libs/survey/types/api/survey.dto';
import SurveyFormula from '@libs/survey/types/SurveyFormula';
import TSurveyElement from '@libs/survey/types/TSurveyElement';
import SurveyQuestionOtherTypes from '@libs/survey/constants/surveyQuestionOtherTypes';
import SurveyQuestionMatrixTypes from '@libs/survey/constants/surveyQuestionMatrixTypes';
import { Migration } from '../../migration/migration.type';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '003-fix-corrupted-nested-answers';

type SurveyElementWithExtras = TSurveyElement & {
  items?: Array<{ name: string; [key: string]: unknown }>;
  rows?: Array<string | { name?: string; value?: string; [key: string]: unknown }>;
};

const gatherSurveyElements = (elements: TSurveyElement[], map: Map<string, SurveyElementWithExtras>): void => {
  elements.forEach((element) => {
    if (element.name) {
      map.set(element.name, element as SurveyElementWithExtras);
    }
    if (element.elements) gatherSurveyElements(element.elements, map);
    if (element.templateElements) gatherSurveyElements(element.templateElements, map);
  });
};

const buildQuestionsMap = (formula: SurveyFormula): Map<string, SurveyElementWithExtras> => {
  const map = new Map<string, SurveyElementWithExtras>();
  if (formula.pages) {
    formula.pages.forEach((page) => {
      if (page.elements) gatherSurveyElements(page.elements, map);
    });
  }
  if (formula.elements) {
    gatherSurveyElements(formula.elements, map);
  }
  return map;
};

const isCharObject = (value: unknown): boolean => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return false;
  const keys = Object.keys(value as Record<string, unknown>);
  if (keys.length === 0) return true;
  return (
    keys.every((k) => /^\d+$/.test(k)) &&
    Object.values(value as Record<string, unknown>).every((v) => typeof v === 'string' && v.length === 1)
  );
};

const isCorruptedCharArray = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0 && (value as unknown[]).every(isCharObject);

const reconstructString = (charObj: Record<string, string>): string =>
  Object.entries(charObj)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([, v]) => v)
    .join('');

const getRowName = (row: string | { name?: string; value?: string; [key: string]: unknown }, index: number): string => {
  if (typeof row === 'string') return row;
  return row.value ?? row.name ?? String(index);
};

const fixAnswerRecursive = (
  answer: Record<string, unknown>,
  questionsMap: Map<string, SurveyElementWithExtras>,
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};

  Object.entries(answer).forEach(([questionId, value]) => {
    const question = questionsMap.get(questionId);

    if (isCorruptedCharArray(value)) {
      const strings = (value as Array<Record<string, string>>).map(reconstructString);

      if (question?.type === SurveyQuestionOtherTypes.MULTIPLETEXT) {
        const items = (question?.items ?? []) as Array<{ name: string }>;
        if (items.length === strings.length) {
          const reconstructed: Record<string, string> = {};
          items.forEach((item, i) => {
            reconstructed[item.name] = strings[i];
          });
          result[questionId] = reconstructed;
        } else {
          result[questionId] = value;
        }
      } else if (question?.type === SurveyQuestionMatrixTypes.MATRIX) {
        const rows = (question.rows ?? []) as Array<string | { name?: string; value?: string }>;
        if (rows.length === strings.length) {
          const reconstructed: Record<string, string> = {};
          rows.forEach((row, i) => {
            reconstructed[getRowName(row, i)] = strings[i];
          });
          result[questionId] = reconstructed;
        } else {
          result[questionId] = value;
        }
      } else {
        result[questionId] = value;
      }
    } else if (question?.type === SurveyQuestionMatrixTypes.MATRIX_DROPDOWN && Array.isArray(value)) {
      const rows = (question.rows ?? []) as Array<string | { name?: string; value?: string }>;
      const arrayValue = value as Array<Record<string, unknown>>;
      if (rows.length === arrayValue.length) {
        const reconstructed: Record<string, unknown> = {};
        rows.forEach((row, i) => {
          reconstructed[getRowName(row, i)] = fixAnswerRecursive(arrayValue[i], questionsMap);
        });
        result[questionId] = reconstructed;
      } else {
        result[questionId] = value;
      }
    } else if (Array.isArray(value)) {
      result[questionId] = (value as unknown[]).map((element) => {
        if (typeof element === 'object' && element !== null && !Array.isArray(element)) {
          return fixAnswerRecursive(element as Record<string, unknown>, questionsMap);
        }
        return element;
      });
    } else if (typeof value === 'object' && value !== null) {
      result[questionId] = fixAnswerRecursive(value as Record<string, unknown>, questionsMap);
    } else {
      result[questionId] = value;
    }
  });

  return result;
};

const surveyAnswerMigration003FixCorruptedNestedAnswers: Migration<SurveyAnswerDocument> = {
  name,
  version: 3,
  execute: async (model) => {
    const previousSchemaVersion = 3;
    const newSchemaVersion = 4;

    const cursor = model
      .find<SurveyAnswerDocument>({ schemaVersion: previousSchemaVersion })
      .populate({ path: 'surveyId', select: 'formula' })
      .sort({ _id: 1 })
      .cursor();

    let counter = 0;
    let ops: AnyBulkWriteOperation[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of cursor) {
      const { formula } = (doc.surveyId as unknown as SurveyDto) ?? {};
      const answer = doc.answer as unknown as Record<string, unknown>;

      let fixedAnswer = answer;
      if (formula && answer && Object.keys(answer).length > 0) {
        const questionsMap = buildQuestionsMap(formula);
        const fixed = fixAnswerRecursive(answer, questionsMap);
        if (JSON.stringify(answer) !== JSON.stringify(fixed)) {
          fixedAnswer = fixed;
        }
      }

      ops.push({
        updateOne: {
          // eslint-disable-next-line no-underscore-dangle
          filter: { _id: doc._id },
          update: { $set: { answer: fixedAnswer, schemaVersion: newSchemaVersion } },
        },
      });

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
      Logger.log(`Migration ${name} completed: ${counter} documents processed`);
    }
  },
};

export default surveyAnswerMigration003FixCorruptedNestedAnswers;
