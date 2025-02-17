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
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

const migration000: Migration<AppConfig> = {
  name: '000-add-db-version-number',
  version: 1,
  execute: async (model) => {
    const previousSchemaVersion = undefined;
    const newSchemaVersion = 1;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion });
    if (unprocessedDocuments.length === 0) {
      return;
    }
    Logger.log(`${unprocessedDocuments?.length} documents to update...`);

    // eslint-disable-next-line no-underscore-dangle
    const ids = unprocessedDocuments.map((doc) => doc._id);

    const result = await model.updateMany({ _id: { $in: ids } }, { $set: { schemaVersion: newSchemaVersion } });
    Logger.log(`Migration completed: ${result.modifiedCount} documents updated`);
  },
};

export default migration000;
