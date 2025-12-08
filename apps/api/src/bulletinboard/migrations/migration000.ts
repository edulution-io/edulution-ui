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
