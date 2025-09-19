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
import { BulletinDocument } from '../bulletin.schema';

const SRC_PREFIX_FIX = /(src\s*=\s*["'])(?!\/|https?:\/\/)(edu-api\/[^"']*)/gi;

const MONGO_FILTER = {
  content: { $regex: /(src\s*=\s*["'])\s*(?!\/|https?:\/\/)edu-api\//i },
};

const previousSchemaVersion = 0;
const newSchemaVersion = 1;

const migration000: Migration<BulletinDocument> = {
  name: '000-prefix-slash-in-bulletin-img-src',
  version: newSchemaVersion,
  execute: async (model) => {
    const toProcess = await model
      .find({
        ...MONGO_FILTER,
        $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: previousSchemaVersion }],
      })
      .lean();

    if (!toProcess.length) {
      Logger.log('No bulletin documents require src-prefix fix.');
      return;
    }

    Logger.log(`Found ${toProcess.length} bulletin(s) with relative "edu-api" src to fix…`);

    const bulk = model.collection.initializeUnorderedBulkOp();
    let modified = 0;

    toProcess.forEach((doc) => {
      const oldHtml = doc.content || '';
      const newHtml = oldHtml.replace(SRC_PREFIX_FIX, (_m, replacer, previous) => `${replacer}/${previous}`);

      if (newHtml !== oldHtml || doc.schemaVersion !== newSchemaVersion) {
        // eslint-disable-next-line no-underscore-dangle
        bulk.find({ _id: doc._id }).updateOne({
          $set: {
            content: newHtml,
            schemaVersion: newSchemaVersion,
          },
        });
        modified += 1;
      }
    });

    if (modified > 0) {
      const result = await bulk.execute();
      Logger.log(`Migration completed: ${result.modifiedCount ?? modified} bulletin(s) updated.`);
    } else {
      Logger.log('Migration completed: 0 updates (all docs already correct).');
    }
  },
};

export default migration000;
