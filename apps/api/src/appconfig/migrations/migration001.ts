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
