import { Logger } from '@nestjs/common';
import { Migration, MigrationModels } from '../../migration/migration.type';

const migration000: Migration<MigrationModels> = {
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
