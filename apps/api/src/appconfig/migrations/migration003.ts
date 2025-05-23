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

/* eslint-disable no-underscore-dangle */
import { Logger } from '@nestjs/common';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariants';
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

const migration003: Migration<AppConfig> = {
  name: '003-change-embed-to-framed-type',
  version: 4,
  execute: async (model) => {
    const previousSchemaVersion = 3;
    const newSchemaVersion = 4;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion });
    if (unprocessedDocuments.length === 0) {
      Logger.log('No documents to update for "003-change-embed-to-framed-type"');
      return;
    }

    const documents = await model.find();
    let processedDocumentsCount = 0;

    await Promise.all(
      documents.map(async (doc) => {
        const id = String(doc._id);
        try {
          await model.updateOne(
            { _id: doc._id },
            {
              $set: {
                appType:
                  doc.appType === APP_INTEGRATION_VARIANT.EMBEDDED ? APP_INTEGRATION_VARIANT.FRAMED : doc.appType,
                schemaVersion: newSchemaVersion,
              },
            },
          );

          processedDocumentsCount += 1;
          Logger.log(`Document ${id} updated successfully`);
        } catch (error) {
          Logger.error(`Failed to update document ${id}: ${(error as Error).message}`);
        }
      }),
    );

    if (processedDocumentsCount > 0) {
      Logger.log(`Migration completed: ${processedDocumentsCount} documents updated`);
    }
  },
};

export default migration003;
