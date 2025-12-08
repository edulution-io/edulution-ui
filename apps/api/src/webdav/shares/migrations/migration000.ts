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
              isRootServer: true,
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
