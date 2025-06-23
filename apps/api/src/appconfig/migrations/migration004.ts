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
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

const migration004: Migration<AppConfig> = {
  name: '004-add-position',
  version: 5,
  execute: async (model) => {
    const previousSchemaVersion = 4;
    const newSchemaVersion = 5;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion }).exec();
    if (unprocessedDocuments.length === 0) {
      return;
    }
    Logger.log(`${unprocessedDocuments?.length} documents to update...`);

    const bulkOperations = unprocessedDocuments.map((document, index) => ({
      updateOne: {
        filter: { _id: document._id },
        update: {
          $set: {
            position: index + 1,
            schemaVersion: newSchemaVersion,
          },
        },
      },
    }));

    const result = await model.bulkWrite(bulkOperations);
    Logger.log(`Migration completed: ${result.modifiedCount} documents updated`);
  },
};

export default migration004;
