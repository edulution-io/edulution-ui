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
import { Migration } from '../../migration/migration.type';
import { SurveyDocument as NewSurveyDocument } from '../survey.schema';
import { SurveysBackendLimiterDocument } from '../surveys-backend-limiter.schema';

type OldSurveyDocument = NewSurveyDocument & { backendLimiters?: { questionName: string; choices: unknown[] }[] };

const name = '002-move-backend-limiters-to-own-table';

const surveysMigration002MoveBackendLimitersToOwnTable: Migration<NewSurveyDocument> = {
  name,
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 1;
    const newSchemaVersion = 2;

    const cursor = model.find<OldSurveyDocument>({ schemaVersion: previousSchemaVersion }).cursor();

    let counter = 0;
    const updateSurveyOperations: AnyBulkWriteOperation[] = [];

    // eslint-disable-next-line no-restricted-syntax
    for await (const doc of cursor) {
      const { backendLimiters } = doc;

      if (!backendLimiters || backendLimiters.length === 0) {
        updateSurveyOperations.push({
          updateOne: {
            // eslint-disable-next-line no-underscore-dangle
            filter: { _id: doc._id },
            update: { $set: { schemaVersion: newSchemaVersion } },
          },
        });

        // eslint-disable-next-line no-continue
        continue;
      }

      const BackendLimiterModel = model.db.model<SurveysBackendLimiterDocument>('SurveysBackendLimiter');

      const createBackendLimiterOperations: AnyBulkWriteOperation[] = [];

      // eslint-disable-next-line no-restricted-syntax
      for (const limiter of backendLimiters) {
        createBackendLimiterOperations.push({
          insertOne: {
            document: {
              // eslint-disable-next-line no-underscore-dangle
              surveyId: doc._id,
              questionName: limiter.questionName,
              choices: limiter.choices,
              schemaVersion: 1,
            },
          },
        });

        Logger.log(
          // eslint-disable-next-line no-underscore-dangle
          `Inserting backend limiter for survey ${String(doc._id)} and question ${limiter.questionName}: ${JSON.stringify(limiter.choices)}`,
          name,
        );
      }

      if (createBackendLimiterOperations.length > 0) {
        try {
          await BackendLimiterModel.bulkWrite(createBackendLimiterOperations, { ordered: false });

          updateSurveyOperations.push({
            updateOne: {
              // eslint-disable-next-line no-underscore-dangle
              filter: { _id: doc._id },
              update: { $unset: { backendLimiters: '' }, $set: { schemaVersion: newSchemaVersion } },
            },
          });

          // eslint-disable-next-line no-underscore-dangle
          Logger.log(`Removing backend limiters from survey document ${String(doc._id)}`, name);
        } catch (error) {
          Logger.error(`Failed to migrate document ${doc.id}:`, error);
          // eslint-disable-next-line no-continue
          continue;
        }
      }
    }

    if (updateSurveyOperations.length > 0) {
      await model.bulkWrite(updateSurveyOperations, { ordered: false });
      counter += updateSurveyOperations.length;
    }

    if (counter > 0) {
      Logger.log(`Migration ${name} completed: ${counter} documents migrated`);
    }
  },
};

export default surveysMigration002MoveBackendLimitersToOwnTable;
