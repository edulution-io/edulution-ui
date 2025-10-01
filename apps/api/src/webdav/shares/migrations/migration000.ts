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
import { Migration } from '../../../migration/migration.type';
import { WebdavSharesDocument } from '../webdav-shares.schema';

const previousSchemaVersion = 0;
const newSchemaVersion = 1;

const migration000: Migration<WebdavSharesDocument> = {
  name: '000-add-pathname-to-webdav-shares',
  version: newSchemaVersion,
  execute: async (model) => {
    const toProcess = await model
      .find({
        $or: [{ schemaVersion: { $exists: false } }, { schemaVersion: previousSchemaVersion }],
      })
      .lean();

    if (!toProcess.length) {
      Logger.log('Nothing to update.');
      return;
    }

    Logger.log(`Found ${toProcess.length} webdav share to update…`);

    const bulk = model.collection.initializeUnorderedBulkOp();
    let modified = 0;

    toProcess.forEach((doc) => {
      try {
        const { pathname } = new URL(doc.url);

        if (doc.schemaVersion !== newSchemaVersion) {
          // eslint-disable-next-line no-underscore-dangle
          bulk.find({ _id: doc._id }).updateOne({
            $set: {
              pathname,
              isRootPath: true,
              schemaVersion: newSchemaVersion,
            },
          });
          modified += 1;
        }
      } catch (err) {
        Logger.error(`Invalid URL in document ${doc.displayName}:${doc.url}`);
      }
    });
    if (modified > 0) {
      const result = await bulk.execute();
      Logger.log(`Migration completed: ${result.modifiedCount ?? modified} webdav share(s) updated.`);
    } else {
      Logger.log('Migration completed: 0 updates (all docs already correct).');
    }
  },
};

export default migration000;
