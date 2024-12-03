import { Model } from 'mongoose';
import migration000 from './migrations/000-add-schema-version-number';
import { AppConfig } from '../appconfig.schema';

const revertMigration = async (model: Model<AppConfig>, serviceName?: string) => {
  const promises = [migration000.down(model, serviceName)];
  return Promise.all(promises);
};

export default revertMigration;
