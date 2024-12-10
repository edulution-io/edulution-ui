/* eslint-disable no-underscore-dangle */
import { Logger } from '@nestjs/common';
import { Migration, MigrationModels } from '../../migration/migration.type';

type ExtendedOption = {
  name: string;
  value: string;
};

const migration001: Migration<MigrationModels> = {
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

    const isOldExtendedOptionsValid = (extendedOptions: ExtendedOption[]): extendedOptions is ExtendedOption[] => {
      if (!Array.isArray(extendedOptions)) return false;
      return extendedOptions.every((option) => typeof option.name === 'string' && typeof option.value === 'string');
    };

    await Promise.all(
      unprocessedDocuments.map(async (doc) => {
        const id = String(doc._id);

        const oldExtendedOptions = doc.extendedOptions as ExtendedOption[];
        if (!isOldExtendedOptionsValid(oldExtendedOptions)) {
          Logger.warn(`Skipping document ${id} due to invalid extendedOptions format`);
          return;
        }

        const newExtendedOptions = oldExtendedOptions.reduce<Record<string, string>>((acc, option) => {
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
          Logger.log(`Document ${id} updated successfully`);
        } catch (error) {
          Logger.error(`Failed to update document ${id}: ${(error as Error).message}`);
        }
      }),
    );

    Logger.log(`Migration completed: ${unprocessedDocuments.length} documents updated`);
  },
};

export default migration001;
