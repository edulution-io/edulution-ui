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

import { Logger } from '@nestjs/common';
import { Types } from 'mongoose';
import { Migration } from '../../migration/migration.type';
import { SurveyAnswerDocument } from '../survey-answers.schema';

const name = '000-transform-survey-answers-document-ids';

const surveyAnswersMigration000SurveyIds: Migration<SurveyAnswerDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    const previousSchemaVersion = undefined;
    const newSchemaVersion = 1;

    const unprocessedDocuments = await model
      .find<SurveyAnswerDocument>({
        $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: previousSchemaVersion }],
      })
      .sort({ _id: 1 })
      .exec();

    if (unprocessedDocuments.length === 0) {
      return;
    }

    Logger.log(`Found ${unprocessedDocuments.length} documents to process...`);

    let processedCount = 0;

    await Promise.all(
      unprocessedDocuments.map(async (doc: SurveyAnswerDocument) => {
        try {
          // eslint-disable-next-line no-underscore-dangle
          const currentId = doc._id;

          if (currentId instanceof Types.ObjectId) {
            await model.updateOne({ _id: currentId }, { $set: { schemaVersion: newSchemaVersion } });
            processedCount += 1;
          } else if (typeof currentId === 'string') {
            const newId = new Types.ObjectId(currentId);
            const surveyId = String(doc.surveyId);

            const newDoc = {
              ...doc.toObject(),
              _id: newId,
              schemaVersion: newSchemaVersion,
              surveyId: new Types.ObjectId(surveyId),
            } as SurveyAnswerDocument;

            delete newDoc.id;

            await model.create(newDoc);

            await model.deleteOne({ _id: currentId });

            processedCount += 1;
          } else {
            Logger.error(`Document ${doc.id} has an unsupported _id type: ${typeof currentId}`);
          }
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

export default surveyAnswersMigration000SurveyIds;
