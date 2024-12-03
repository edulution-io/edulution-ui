import { Model, Connection } from 'mongoose';
import APP_CONFIG_COLLECTION_NAME from '@libs/appconfig/constants/appConfig-collectionName';
import defaultAppConfig from '@libs/appconfig/constants/defaultAppConfig';
import { AppConfig } from './appconfig.schema';

const initializeCollection = async (connection: Connection, appConfigModel: Model<AppConfig>) => {
  const collections = await connection.db?.listCollections({ name: APP_CONFIG_COLLECTION_NAME }).toArray();

  if (collections?.length === 0) {
    await connection.db?.createCollection(APP_CONFIG_COLLECTION_NAME);
  }

  const count = await appConfigModel.countDocuments();
  if (count === 0) {
    await appConfigModel.insertMany(defaultAppConfig);
  }
};

export default initializeCollection;
