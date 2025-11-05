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
import { Migration } from '../../migration/migration.type';
import { AppConfig } from '../appconfig.schema';

type ExtendedOption = {
  name: string;
  value: string;
};

const migration001: Migration<AppConfig> = {
  name: '001-transform-extended-options',
  version: 2,
  execute: async (model) => {
    const previousSchemaVersion = 1;
    const newSchemaVersion = 2;

    const unprocessedDocuments = await model.find({ schemaVersion: previousSchemaVersion });
    if (unprocessedDocuments.length === 0) {
      Logger.log('No documents to update for "001-transform-extended-options"');
      return;
    }

    const isOldExtendedOptionsValid = (extendedOptions: ExtendedOption[]) => Array.isArray(extendedOptions);
    const isExtendedOptionsAValidObject = (extendedOptions: ExtendedOption[]) => typeof extendedOptions === 'object';

    let processedDocumentsCount = 0;

    await Promise.all(
      unprocessedDocuments.map(async (doc) => {
        const id = String(doc._id);

        const oldExtendedOptions = doc.extendedOptions as ExtendedOption[];
        if (!isOldExtendedOptionsValid(oldExtendedOptions)) {
          if (!isExtendedOptionsAValidObject(oldExtendedOptions)) {
            Logger.warn(`Skipping document ${id} due to invalid extendedOptions format`);
          }
          return;
        }

        const newExtendedOptions = oldExtendedOptions.reduce<Record<string, string>>((acc, option) => {
          if (!option.name) return {};
          acc[option.name] = option.value;
          return acc;
        }, {});

        try {
          await model.updateOne(
            { _id: doc._id },
            {
              $set: {
                extendedOptions: newExtendedOptions,
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

export default migration001;
