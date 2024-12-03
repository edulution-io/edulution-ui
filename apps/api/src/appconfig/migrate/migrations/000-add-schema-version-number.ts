import { Model } from 'mongoose';
import { Logger } from '@nestjs/common';
import { AppConfig } from '../../appconfig.schema';

const MIGRATION_NAME = '000-add-db-version-number';
const THIS_MIGRATION_NUMBER = 0;

const migration000 = {
  async up(model: Model<AppConfig>, serviceName?: string) {
    const previousMigrationNumber = THIS_MIGRATION_NUMBER === 0 ? undefined : THIS_MIGRATION_NUMBER - 1;
    const unprocessedDocuments = await model.find({ schemaVersion: previousMigrationNumber });
    if (unprocessedDocuments.length === 0) {
      return;
    }
    Logger.log(
      `⬆         Migration ${MIGRATION_NAME} started (processing: ${unprocessedDocuments.length} documents)`,
      serviceName,
    );
    try {
      // eslint-disable-next-line no-underscore-dangle
      const ids = unprocessedDocuments.map((d) => d._id);

      await model.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            schemaVersion: THIS_MIGRATION_NUMBER,
            updatedAt: new Date().toDateString(),
          },
        },
      );
    } catch (e) {
      Logger.error(`⬆         Error while migrating: ${e}`, serviceName);
      return;
    }
    Logger.log(`⬆         Migration ${MIGRATION_NAME} completed`, serviceName);
  },

  async down(model: Model<AppConfig>, serviceName?: string) {
    const previousMigrationNumber = THIS_MIGRATION_NUMBER === 0 ? undefined : THIS_MIGRATION_NUMBER - 1;
    const processedDocuments = await model.find({ schemaVersion: THIS_MIGRATION_NUMBER });
    if (processedDocuments.length === 0) {
      return;
    }
    Logger.log(
      `⬆         Migration ${MIGRATION_NAME} started rollback (processing: ${processedDocuments.length} documents)`,
      serviceName,
    );
    try {
      // eslint-disable-next-line no-underscore-dangle
      const ids = processedDocuments.map((d) => d._id);

      await model.updateMany(
        { _id: { $in: ids } },
        {
          $set: {
            schemaVersion: previousMigrationNumber,
            updatedAt: new Date().toDateString(),
          },
        },
      );
    } catch (e) {
      Logger.error(`⬆         Error while rolling back: ${e}`, serviceName);
      return;
    }
    Logger.log(`⬆         Migration ${MIGRATION_NAME} reverted`, serviceName);
  },
};

export default migration000;
