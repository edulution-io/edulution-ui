// TODO: Remove this migration file after applying plus some additional time (field testing)(Delete on 04.04.2025)

/**
 * Affected Schema: appconfigs
 * Affected Properties: [options, extendedOptions]
 * Migration: Unify the options and extendedOptions properties into a single options property with a GENERAL section for the former options
 *     and a new section for the extendedOptions
 * Description:
 *     1. Read the documents to find which options were set and to include those in a new section called GENERAL.
 *     2. Read the documents to find which extendedOptions were set and to include those in their specific section.
 *     3. merge those sections as the new options object.
 *     4. overwrite the options property with the new options object.
 *     5. Remove the extendedOptions property.
 * */

import mongoose, { Model, ObjectId } from 'mongoose';
import { Logger } from '@nestjs/common';
import { AppConfig, AppConfigSchema } from '../appconfig.schema';
import reconstructOldAppConfig from './reconstruct_old_app_config';
import TOldAppConfig from './tOldAppConfig';

async function upgrade() {
  Logger.log('Applying upgrade', 'APP-CONFIG-MIGRATION-000');

  const connection = mongoose.createConnection(process.env.MONGODB_SERVER_URL as string, {
    dbName: process.env.MONGODB_DATABASE_NAME,
    auth: { username: process.env.MONGODB_USERNAME, password: process.env.MONGODB_PASSWORD },
  });

  const collections = await connection.db?.listCollections({ name: 'appconfigs' }).toArray();
  if (collections?.length === 0) {
    return;
  }

  const appConfigModel: Model<AppConfig> = connection.model('appconfigs', AppConfigSchema);
  const count = await appConfigModel?.countDocuments();

  if (count === 0) {
    return;
  }

  const collection = connection.collection('appconfigs');
  try {
    // eslint-disable-next-line no-restricted-syntax
    for await (const appConfig of appConfigModel.find({})) {
      const currentConfig = appConfig.toObject();
      const updatedConfig = reconstructOldAppConfig(currentConfig as unknown as TOldAppConfig);
      // appConfig.overwrite(updatedConfig);
      // await appConfig.save();

      // eslint-disable-next-line no-underscore-dangle
      await collection.replaceOne({ _id: appConfig._id as ObjectId }, updatedConfig);
    }
    Logger.log('Migration completed successfully', 'APP-CONFIG-MIGRATION-000');
  } catch (error) {
    Logger.error(`Error during migration: ${error}`, 'APP-CONFIG-MIGRATION-000');
  }
  await connection.close();
}

const migrationReconstructOptionsAndExtendedOptions = upgrade;

export default migrationReconstructOptionsAndExtendedOptions;
