import { Model } from 'mongoose';
import { AppConfig } from '../appconfig/appconfig.schema';

// INFO: Here all models need to be added
export type MigrationModels = AppConfig;

export type Migration<T> = {
  name: string;
  version: number;
  execute: (model: Model<T>) => Promise<void>;
};
