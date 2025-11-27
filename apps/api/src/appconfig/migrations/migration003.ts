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

/* eslint-disable no-underscore-dangle */
import { Logger } from '@nestjs/common';
import APP_INTEGRATION_VARIANT from '@libs/appconfig/constants/appIntegrationVariant';
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
                appType: doc.appType === APP_INTEGRATION_VARIANT.EMBEDDED ? APP_INTEGRATION_VARIANT.FRAME : doc.appType,
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
