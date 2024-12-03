import { Model } from 'mongoose';
import migration000 from './migrations/000-add-schema-version-number';
import { AppConfig } from '../appconfig.schema';

const runMigration = async (model: Model<AppConfig>, serviceName?: string) => {
  const promises = [migration000.up(model, serviceName)];
  return Promise.all(promises);
};

export default runMigration;
