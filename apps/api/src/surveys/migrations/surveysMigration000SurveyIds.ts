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
import { SurveyDocument } from '../survey.schema';

interface OLDSurveyDocumentWithVirtuals extends SurveyDocument {
  created?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  canShowResultsTable?: boolean;
  canShowResultsChart?: boolean;
}

const name = '000-transform-survey-document-ids';

const migration000SurveyIds: Migration<SurveyDocument> = {
  name,
  version: 1,
  execute: async (model) => {
    const previousSchemaVersion = undefined;
    const newSchemaVersion = 1;

    const unprocessedDocuments = await model
      .find<OLDSurveyDocumentWithVirtuals>({
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
      unprocessedDocuments.map(async (doc: OLDSurveyDocumentWithVirtuals) => {
        try {
          // eslint-disable-next-line no-underscore-dangle
          const currentId = doc._id;

          if (currentId instanceof Types.ObjectId) {
            await model.updateOne({ _id: currentId }, { $set: { schemaVersion: newSchemaVersion } });
            processedCount += 1;
          } else if (typeof currentId === 'string') {
            const newId = new Types.ObjectId(currentId);

            const newDoc = {
              ...doc.toObject(),
              _id: newId,
              schemaVersion: newSchemaVersion,
              answers: Array.isArray(doc.answers)
                ? doc.answers.map((answer) =>
                    typeof answer === 'string' ? new Types.ObjectId(String(answer)) : answer,
                  )
                : [],
            } as OLDSurveyDocumentWithVirtuals;

            delete newDoc.id;
            delete newDoc.created;
            delete newDoc.canShowResultsTable;
            delete newDoc.canShowResultsChart;

            await model.create(newDoc);

            await model.deleteOne({ _id: currentId });

            processedCount += 1;
          } else {
            // Unsupported _id type: log an error.
            Logger.error(`Document ${doc.id} has unsupported _id type: ${typeof currentId}`);
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

export default migration000SurveyIds;
