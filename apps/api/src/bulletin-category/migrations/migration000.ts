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
import { BulletinCategoryDocument } from '../bulletin-category.schema';

const migration000AddPosition: Migration<BulletinCategoryDocument> = {
  name: '000-add-position-to-bulletin-category',
  version: 1,
  execute: async (model) => {
    const previousSchemaVersion = undefined;
    const newSchemaVersion = 1;

    const unprocessedDocuments = await model
      .find<BulletinCategoryDocument>({
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
      unprocessedDocuments.map(async (doc: BulletinCategoryDocument, index: number) => {
        try {
          await model.updateOne(
            { _id: doc.id },
            {
              $set: {
                position: index + 1,
                schemaVersion: newSchemaVersion,
              },
            },
          );

          processedCount += 1;
          Logger.log(`Document ${doc.id} updated successfully. Position set to ${index + 1}`);
        } catch (error) {
          Logger.error(`Failed to update document ${doc.id}: ${(error as Error).message}`);
        }
      }),
    );

    if (processedCount > 0) {
      Logger.log(`Migration "000-add-position-to-bulletin-category" completed: ${processedCount} documents updated`);
    }
  },
};

export default migration000AddPosition;
