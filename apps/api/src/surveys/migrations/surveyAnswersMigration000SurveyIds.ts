/*
 * LICENSE
 *
 * This program is free software: you can redistribute it and/or modify it under the terms of the GNU Affero General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License along with this program. If not, see <https://www.gnu.org/licenses/>.
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
